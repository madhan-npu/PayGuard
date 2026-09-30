import { NextResponse } from 'next/server';
import { validatePaymentPayload, evaluateRisk } from '@/lib/serverRiskEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { receiverUpi, amount, description } = body;

    const validation = validatePaymentPayload(receiverUpi, amount, description);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors.join(' ') }, { status: 400 });
    }

    const assessment = evaluateRisk(receiverUpi, validation.parsedAmount, description || '');
    return NextResponse.json(assessment, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error while analyzing risk' }, { status: 500 });
  }
}
