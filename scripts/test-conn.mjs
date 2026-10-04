import { neon } from '@neondatabase/serverless';

const poolerUrl = 'postgresql://neondb_owner:npg_L3UYsOCpoDG6@ep-old-wildflower-b4cdsnfs-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';
const directUrl = 'postgresql://neondb_owner:npg_L3UYsOCpoDG6@ep-old-wildflower-b4cdsnfs.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function test() {
  console.log('Testing direct endpoint...');
  try {
    const sqlDirect = neon(directUrl);
    const r1 = await sqlDirect`SELECT 1 as connected`;
    console.log('✅ Direct connection successful:', r1);
    return directUrl;
  } catch (err) {
    console.log('Direct endpoint failed:', err.message);
  }

  console.log('Testing pooler endpoint...');
  try {
    const sqlPooler = neon(poolerUrl);
    const r2 = await sqlPooler`SELECT 1 as connected`;
    console.log('✅ Pooler connection successful:', r2);
    return poolerUrl;
  } catch (err) {
    console.log('Pooler endpoint failed:', err.message);
  }
}

test();
