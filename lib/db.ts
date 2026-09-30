import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'armorpay.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS reported_upis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upi_id TEXT UNIQUE NOT NULL,
    report_count INTEGER DEFAULT 1,
    scam_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT DEFAULT 'demo-user@upi',
    receiver_upi TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    risk_score INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS risk_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    risk_points INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE
  );
`);

const seedCount = db.prepare('SELECT COUNT(*) as count FROM reported_upis').get() as { count: number };
if (seedCount.count === 0) {
  const insertSeed = db.prepare(`
    INSERT INTO reported_upis (upi_id, report_count, scam_type)
    VALUES (@upi_id, @report_count, @scam_type)
  `);

  const initialReports = [
    { upi_id: 'winner999@upi', report_count: 41, scam_type: 'Lottery Scam' },
    { upi_id: 'kyc-update@upi', report_count: 28, scam_type: 'Fake KYC' },
    { upi_id: 'refund-scam@upi', report_count: 17, scam_type: 'Refund Scam' },
    { upi_id: 'investment-help@upi', report_count: 12, scam_type: 'Investment Scam' },
    { upi_id: 'friend123@upi', report_count: 0, scam_type: 'None' },
  ];

  const seedTransaction = db.transaction((rows) => {
    for (const row of rows) insertSeed.run(row);
  });
  seedTransaction(initialReports);
}

export default db;
