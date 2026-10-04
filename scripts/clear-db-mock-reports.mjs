import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_L3UYsOCpoDG6@ep-old-wildflower-b4cdsnfs.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function clearReports() {
  const sql = neon(connectionString);
  console.log('Clearing sample reports from Neon database...');

  await sql`DELETE FROM c3_reports`;
  await sql`DELETE FROM service_team_reports`;
  await sql`DELETE FROM ministry_reports`;
  await sql`DELETE FROM general_service_reports`;
  await sql`DELETE FROM audit_logs`;

  console.log('✅ Neon DB reports and logs cleared! Church structure (centres, teams, users) remains intact.');
}

clearReports().catch((err) => {
  console.error('Error clearing DB reports:', err);
  process.exit(1);
});
