import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, name, code, description, is_active AS "isActive"
      FROM service_teams ORDER BY name
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[GET /api/service-teams]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const { name, code, description } = await req.json();
    const rows = await sql`
      INSERT INTO service_teams (name, code, description)
      VALUES (${name}, ${code || null}, ${description || ''})
      RETURNING id, name, code, description, is_active AS "isActive"
    `;
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/service-teams]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
