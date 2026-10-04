import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_L3UYsOCpoDG6@ep-old-wildflower-b4cdsnfs.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function addAuditTable() {
  const sql = neon(connectionString);
  console.log('Creating audit_logs table...');

  const statements = [
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      user_role VARCHAR(100) NOT NULL,
      action VARCHAR(50) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(255),
      entity_label VARCHAR(500),
      details JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id)`,
  ];

  for (const stmt of statements) {
    console.log('Executing:', stmt.substring(0, 60).replace(/\n/g, ' ') + '...');
    await sql.query(stmt);
  }
  console.log('✅ audit_logs table and indexes created!');
}

addAuditTable().catch((e) => { console.error(e); process.exit(1); });
