import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const connectionString = 'postgresql://neondb_owner:npg_L3UYsOCpoDG6@ep-old-wildflower-b4cdsnfs.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Function to split SQL script into individual statements preserving $$ dollar quotes
function splitSqlStatements(sqlText) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let dollarTag = '';

  const lines = sqlText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--')) continue; // skip full line comments

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      // Check for dollar quoting like $$
      if (char === '$' && nextChar === '$') {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = '$$';
        } else if (dollarTag === '$$') {
          inDollarQuote = false;
          dollarTag = '';
        }
        current += '$$';
        i++; // skip next char
        continue;
      }

      if (char === ';' && !inDollarQuote) {
        if (current.trim().length > 0) {
          statements.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }
    current += '\n';
  }

  if (current.trim().length > 0) {
    statements.push(current.trim());
  }

  return statements;
}

async function migrate() {
  console.log('Connecting to Neon PostgreSQL at ep-old-wildflower-b4cdsnfs...');
  const sql = neon(connectionString);

  const schemaPath = path.join(process.cwd(), 'neon', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const statements = splitSqlStatements(schemaSql);
  console.log(`Parsed ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`Executing [${i + 1}/${statements.length}]: ${stmt.substring(0, 50).replace(/\n/g, ' ')}...`);
    try {
      await sql.query(stmt);
    } catch (err) {
      console.error(`Error on statement ${i + 1}:`, err.message);
      throw err;
    }
  }

  console.log('\n✅ All tables and seed data created successfully in Neon DB!');

  // Verify
  const centres = await sql`SELECT count(*) FROM c3_centres`;
  const teams = await sql`SELECT count(*) FROM service_teams`;
  const ministries = await sql`SELECT count(*) FROM ministry_teams`;
  console.log(`\nVerification:`);
  console.log(`- c3_centres: ${centres[0].count} rows`);
  console.log(`- service_teams: ${teams[0].count} rows`);
  console.log(`- ministry_teams: ${ministries[0].count} rows`);
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
