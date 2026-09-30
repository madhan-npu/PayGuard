import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const reports = db.prepare('SELECT * FROM reported_upis ORDER BY report_count DESC').all();
    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch scam list' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { upiId, scamType } = body;

    if (!upiId || !upiId.includes('@')) {
      return NextResponse.json({ error: 'A valid UPI ID is required.' }, { status: 400 });
    }
    if (!scamType) {
      return NextResponse.json({ error: 'Scam type selection is required.' }, { status: 400 });
    }

    const normalizedUpi = upiId.trim().toLowerCase();
    const existing = db.prepare('SELECT * FROM reported_upis WHERE LOWER(upi_id) = ?').get(normalizedUpi) as { id: number; report_count: number } | undefined;

    if (existing) {
      db.prepare('UPDATE reported_upis SET report_count = report_count + 1 WHERE id = ?').run(existing.id);
    } else {
      db.prepare(`
        INSERT INTO reported_upis (upi_id, report_count, scam_type)
        VALUES (?, 1, ?)
      `).run(normalizedUpi, scamType);
    }

    return NextResponse.json({ success: true, message: 'Report submitted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to record report' }, { status: 500 });
  }
}
