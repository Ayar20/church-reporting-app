import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, name, code, description,
             target_audience AS "targetAudience",
             is_active AS "isActive"
      FROM ministry_teams ORDER BY name
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[GET /api/ministry-teams]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const { name, code, description, targetAudience } = await req.json();
    const rows = await sql`
      INSERT INTO ministry_teams (name, code, description, target_audience)
      VALUES (${name}, ${code || null}, ${description || ''}, ${targetAudience || ''})
      RETURNING id, name, code, description,
                target_audience AS "targetAudience",
                is_active AS "isActive"
    `;
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/ministry-teams]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
