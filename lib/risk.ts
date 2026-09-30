export type PaymentIntent = {
  upiId: string
  amount: number
  message: string
  url: string
  fromQr: boolean
  qrName: string
}

export type Signal = {
  id: string
  label: string
  detail: string
  points: number
  source: 'Message' | 'URL' | 'QR' | 'Recipient' | 'Amount'
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'

export type RiskResult = {
  score: number
  level: RiskLevel
  signals: Signal[]
  registeredName: string
  isNewRecipient: boolean
}

export const contacts = [
  { name: 'Priya Sharma', upiId: 'priya.sharma@okaxis', avgAmount: 1200 },
  { name: 'Ravi Kumar', upiId: 'ravi.k@oksbi', avgAmount: 800 },
  { name: 'Anjali Menon', upiId: 'anjali.m@okhdfc', avgAmount: 2500 },
  { name: 'Karthik R', upiId: 'karthik.r@ybl', avgAmount: 450 },
]

const upiDirectory: Record<string, string> = {
  ...Object.fromEntries(contacts.map((c) => [c.upiId, c.name])),
  'refund.desk2291@paytm': 'Suresh Traders',
  'freshmart@icici': 'FreshMart Grocery',
}

const URGENCY = /\b(urgent|immediately|blocked|suspend|suspended|within \d+|expire|expires|last chance|final notice|act now|today only)\b/i
const IMPERSONATION = /\b(bank|customer care|support|kyc|official|rbi|refund desk|helpdesk)\b/i
const SUSPICIOUS_URL = /(bit\.ly|tinyurl|\.xyz|\.top|\.click|-support|-kyc|verify-|refund|login-|\d{3,}\.)/i

export function lookupName(upiId: string) {
  return upiDirectory[upiId.trim().toLowerCase()] ?? 'Unregistered name'
}

export function analyzeIntent(intent: PaymentIntent): RiskResult {
  const upi = intent.upiId.trim().toLowerCase()
  const registeredName = lookupName(upi)
  const contact = contacts.find((c) => c.upiId === upi)
  const isNewRecipient = !contact
  const signals: Signal[] = []

  if (intent.fromQr && intent.qrName.trim()) {
    const qr = intent.qrName.trim().toLowerCase()
    if (!registeredName.toLowerCase().includes(qr) && !qr.includes(registeredName.toLowerCase())) {
      signals.push({
        id: 'qr',
        label: 'QR recipient mismatch',
        detail: `QR says "${intent.qrName}", bank records say "${registeredName}".`,
        points: 25,
        source: 'QR',
      })
    }
  }

  if (intent.url.trim()) {
    const url = intent.url.trim()
    if (SUSPICIOUS_URL.test(url) || !url.startsWith('https://')) {
      signals.push({
        id: 'url',
        label: 'Suspicious URL',
        detail: 'The link does not match any verified bank or merchant domain.',
        points: 20,
        source: 'URL',
      })
    }
  }

  if (URGENCY.test(intent.message)) {
    signals.push({
      id: 'urgency',
      label: 'Urgency language',
      detail: 'The message pressures you to act fast — a classic scam tactic.',
      points: 15,
      source: 'Message',
    })
  }

  if (isNewRecipient) {
    signals.push({
      id: 'new',
      label: 'New recipient',
      detail: 'You have never paid this UPI ID before.',
      points: 15,
      source: 'Recipient',
    })
  }

  const baseline = contact?.avgAmount ?? 1500
  if (intent.amount > baseline * 3 || intent.amount >= 10000) {
    signals.push({
      id: 'amount',
      label: 'Unusual amount',
      detail: `₹${intent.amount.toLocaleString('en-IN')} is well above your usual payments.`,
      points: 11,
      source: 'Amount',
    })
  }

  if (IMPERSONATION.test(intent.message) && isNewRecipient) {
    signals.push({
      id: 'impersonation',
      label: 'Impersonation pattern',
      detail: 'Claims to be bank or support, but pays to a personal account.',
      points: 6,
      source: 'Message',
    })
  }

  const score = Math.min(
    100,
    signals.reduce((sum, s) => sum + s.points, 0),
  )

  const level: RiskLevel = score >= 85 ? 'Critical' : score >= 60 ? 'High' : score >= 30 ? 'Medium' : 'Low'

  return { score, level, signals, registeredName, isNewRecipient }
}

export const scamExample: PaymentIntent = {
  upiId: 'refund.desk2291@paytm',
  amount: 24999,
  message:
    'Dear customer, your bank KYC has expired and your account will be BLOCKED within 2 hours. Pay the verification fee immediately to avoid suspension. - Customer Care',
  url: 'http://sbi-kyc-verify-support.xyz/pay',
  fromQr: true,
  qrName: 'State Bank Support',
}

export const emptyIntent: PaymentIntent = {
  upiId: '',
  amount: 0,
  message: '',
  url: '',
  fromQr: false,
  qrName: '',
}
