import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Lazy singleton — created on first use so build-time analysis doesn't fail
let _sql: NeonQueryFunction<false, false> | null = null;

export default function getDb(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Add it to your Vercel project environment variables.'
    );
  }
  _sql = neon(url);
  return _sql;
}
