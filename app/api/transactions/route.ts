import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { validatePaymentPayload, evaluateRisk } from '@/lib/serverRiskEngine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');

    let query = 'SELECT * FROM transactions ORDER BY created_at DESC';
    const params: unknown[] = [];

    if (filter === 'LOW' || filter === 'MEDIUM' || filter === 'HIGH') {
      query = 'SELECT * FROM transactions WHERE risk_level = ? ORDER BY created_at DESC';
      params.push(filter);
    } else if (filter === 'BLOCKED') {
      query = 'SELECT * FROM transactions WHERE status = "blocked" ORDER BY created_at DESC';
    }

    const transactions = db.prepare(query).all(...params);
    return NextResponse.json({ transactions }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve transactions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { receiverUpi, amount, description, statusOverride } = body;

    const validation = validatePaymentPayload(receiverUpi, amount, description);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors.join(' ') }, { status: 400 });
    }

    const risk = evaluateRisk(receiverUpi, validation.parsedAmount, description || '');
    const finalStatus = statusOverride || (risk.action === 'BLOCK' ? 'blocked' : risk.action === 'WARN' ? 'warned' : 'allowed');

    const insertTx = db.prepare(`
      INSERT INTO transactions (sender, receiver_upi, amount, description, risk_score, risk_level, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertEvent = db.prepare(`
      INSERT INTO risk_events (transaction_id, reason, risk_points)
      VALUES (?, ?, ?)
    `);

    let txId: number | bigint = 0;
    const execute = db.transaction(() => {
      const res = insertTx.run(
        'demo-user@upi',
        receiverUpi.trim(),
        validation.parsedAmount,
        description || '',
        risk.riskScore,
        risk.riskLevel,
        finalStatus
      );
      txId = res.lastInsertRowid;
      for (const reason of risk.reasons) {
        insertEvent.run(txId, reason.reason, reason.points);
      }
    });

    execute();

    return NextResponse.json({
      success: true,
      transactionId: txId,
      receiver: receiverUpi.trim(),
      amount: validation.parsedAmount,
      description,
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      status: finalStatus,
      createdAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 });
  }
}
