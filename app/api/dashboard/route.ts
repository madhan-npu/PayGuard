import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const totalTransactions = (db.prepare('SELECT COUNT(*) as count FROM transactions').get() as { count: number })?.count || 0;
    const blockedPayments = (db.prepare('SELECT COUNT(*) as count FROM transactions WHERE status = "blocked"').get() as { count: number })?.count || 0;
    const warnings = (db.prepare('SELECT COUNT(*) as count FROM transactions WHERE risk_level = "MEDIUM"').get() as { count: number })?.count || 0;
    const scamReports = (db.prepare('SELECT COALESCE(SUM(report_count), 0) as total FROM reported_upis').get() as { total: number })?.total || 0;
    
    const moneyProtected = (db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = "blocked"
    `).get() as { total: number })?.total || 0;

    const recent = db.prepare('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5').all();

    return NextResponse.json({
      totalTransactions,
      blockedPayments,
      warnings,
      scamReports,
      moneyProtected,
      recentTransactions: recent || [],
    });
  } catch (err) {
    console.error('Dashboard Error:', err);
    return NextResponse.json({
      totalTransactions: 0,
      blockedPayments: 0,
      warnings: 0,
      scamReports: 0,
      moneyProtected: 0,
      recentTransactions: [],
    });
  }
}
