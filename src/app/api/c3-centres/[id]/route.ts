import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// PUT /api/c3-centres/[id] — update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await req.json();
    const { name, zone, meetingAddress, meetingDay, meetingTime, hostName, isActive } = body;

    const rows = await sql`
      UPDATE c3_centres SET
        name            = COALESCE(${name}, name),
        zone            = COALESCE(${zone}, zone),
        meeting_address = COALESCE(${meetingAddress}, meeting_address),
        meeting_day     = COALESCE(${meetingDay}, meeting_day),
        meeting_time    = COALESCE(${meetingTime}, meeting_time),
        host_name       = COALESCE(${hostName}, host_name),
        is_active       = COALESCE(${isActive}, is_active),
        updated_at      = now()
      WHERE id = ${id}
      RETURNING
        id, name, zone,
        meeting_address AS "meetingAddress",
        meeting_day     AS "meetingDay",
        meeting_time    AS "meetingTime",
        host_name       AS "hostName",
        is_active       AS "isActive"
    `;
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error('[PUT /api/c3-centres/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/c3-centres/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM c3_centres WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/c3-centres/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
