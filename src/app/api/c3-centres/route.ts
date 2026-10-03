import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// GET /api/c3-centres — list all
export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT
        id, name, zone,
        meeting_address AS "meetingAddress",
        meeting_day     AS "meetingDay",
        meeting_time    AS "meetingTime",
        host_name       AS "hostName",
        is_active       AS "isActive"
      FROM c3_centres
      ORDER BY name
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[GET /api/c3-centres]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/c3-centres — create
export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { name, zone, meetingAddress, meetingDay, meetingTime, hostName } = body;

    const rows = await sql`
      INSERT INTO c3_centres (name, zone, meeting_address, meeting_day, meeting_time, host_name)
      VALUES (${name}, ${zone}, ${meetingAddress}, ${meetingDay || 'Wednesday'}, ${meetingTime || '5:00 PM'}, ${hostName || ''})
      RETURNING
        id, name, zone,
        meeting_address AS "meetingAddress",
        meeting_day     AS "meetingDay",
        meeting_time    AS "meetingTime",
        host_name       AS "hostName",
        is_active       AS "isActive"
    `;
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/c3-centres]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
