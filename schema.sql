CREATE TABLE IF NOT EXISTS leads(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,phone TEXT NOT NULL,email TEXT NOT NULL,condominium TEXT,message TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'new',created_at TEXT NOT NULL DEFAULT(datetime('now')));
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

CREATE TABLE IF NOT EXISTS admin_payments(
  installment INTEGER PRIMARY KEY,
  amount_cents INTEGER NOT NULL DEFAULT 30000,
  paid INTEGER NOT NULL DEFAULT 0,
  proof_name TEXT,
  proof_type TEXT,
  proof_base64 TEXT,
  proof_uploaded_at TEXT,
  paid_at TEXT,
  updated_at TEXT NOT NULL DEFAULT(datetime('now'))
);
INSERT OR IGNORE INTO admin_payments(installment,amount_cents) VALUES(1,30000),(2,30000),(3,30000);
