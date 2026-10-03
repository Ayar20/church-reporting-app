import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const { name, code, description, isActive } = await req.json();
    const rows = await sql`
      UPDATE service_teams SET
        name        = COALESCE(${name}, name),
        code        = COALESCE(${code}, code),
        description = COALESCE(${description}, description),
        is_active   = COALESCE(${isActive}, is_active),
        updated_at  = now()
      WHERE id = ${id}
      RETURNING id, name, code, description, is_active AS "isActive"
    `;
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error('[PUT /api/service-teams/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM service_teams WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/service-teams/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
