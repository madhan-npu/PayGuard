import db from './db';

export interface RiskFactor {
  reason: string;
  points: number;
}

export interface RiskAssessment {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  action: 'ALLOW' | 'WARN' | 'BLOCK';
  reasons: RiskFactor[];
}

const SUSPICIOUS_KEYWORDS = [
  'otp', 'kyc', 'lottery', 'prize', 'urgent',
  'refund', 'investment', 'verify', 'verification',
  'cashback', 'account blocked'
];

export function validatePaymentPayload(receiverUpi: unknown, amount: unknown, description: unknown) {
  const errors: string[] = [];

  if (typeof receiverUpi !== 'string' || !receiverUpi.trim()) {
    errors.push('Receiver UPI ID is required.');
  } else {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(receiverUpi.trim())) {
      errors.push('Invalid UPI ID format. Expected format: username@bank');
    }
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.push('Amount must be a positive number greater than 0.');
  }

  if (description && typeof description === 'string' && description.length > 250) {
    errors.push('Description cannot exceed 250 characters.');
  }

  return { isValid: errors.length === 0, errors, parsedAmount };
}

export function evaluateRisk(receiverUpi: string, amount: number, description: string): RiskAssessment {
  const reasons: RiskFactor[] = [];
  const normalizedUpi = receiverUpi.trim().toLowerCase();
  const desc = (description || '').toLowerCase();

  const report = db.prepare('SELECT report_count FROM reported_upis WHERE LOWER(upi_id) = ?').get(normalizedUpi) as { report_count: number } | undefined;
  if (report && report.report_count > 0) {
    reasons.push({
      reason: `UPI ID has ${report.report_count} previous scam report(s)`,
      points: 40,
    });
  }

  const existingTx = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE LOWER(receiver_upi) = ?').get(normalizedUpi) as { count: number };
  if (existingTx.count === 0) {
    reasons.push({
      reason: 'First-time transfer to this recipient',
      points: 25,
    });
  }

  if (amount > 10000) {
    reasons.push({
      reason: 'High-value transaction (Amount exceeds ₹10,000)',
      points: 20,
    });
  }

  const matchedKeywords = SUSPICIOUS_KEYWORDS.filter((word) => desc.includes(word));
  if (matchedKeywords.length > 0) {
    reasons.push({
      reason: `Suspicious keyword detected: "${matchedKeywords[0]}"`,
      points: 10,
    });
  }

  const recentTx = db.prepare(`
    SELECT COUNT(*) as count 
    FROM transactions 
    WHERE created_at >= datetime('now', '-1 hour')
  `).get() as { count: number };
  if (recentTx.count > 3) {
    reasons.push({
      reason: 'High transaction frequency detected in the last hour',
      points: 10,
    });
  }

  const rawScore = reasons.reduce((sum, r) => sum + r.points, 0);
  const finalScore = Math.min(rawScore, 100);

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let action: 'ALLOW' | 'WARN' | 'BLOCK' = 'ALLOW';

  if (finalScore >= 61) {
    riskLevel = 'HIGH';
    action = 'BLOCK';
  } else if (finalScore >= 31) {
    riskLevel = 'MEDIUM';
    action = 'WARN';
  } else {
    riskLevel = 'LOW';
    action = 'ALLOW';
  }

  return { riskScore: finalScore, riskLevel, action, reasons };
}
