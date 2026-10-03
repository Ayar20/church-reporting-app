import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// GET /api/auth/login — look up user by email, return profile
export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const rows = await sql`
      SELECT
        p.id,
        p.full_name   AS "fullName",
        p.email,
        p.phone,
        p.role,
        p.avatar_url  AS "avatarUrl",
        p.c3_id       AS "c3Id",
        c3.name       AS "c3Name",
        p.service_team_id AS "serviceTeamId",
        st.name       AS "serviceTeamName",
        p.ministry_id AS "ministryId",
        mt.name       AS "ministryName"
      FROM profiles p
      LEFT JOIN c3_centres  c3 ON c3.id = p.c3_id
      LEFT JOIN service_teams st ON st.id = p.service_team_id
      LEFT JOIN ministry_teams mt ON mt.id = p.ministry_id
      WHERE p.email = ${email}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] });
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/auth/users — list all users (for Resident Pastor role switching)
export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT
        p.id,
        p.full_name   AS "fullName",
        p.email,
        p.phone,
        p.role,
        p.avatar_url  AS "avatarUrl",
        p.c3_id       AS "c3Id",
        c3.name       AS "c3Name",
        p.service_team_id AS "serviceTeamId",
        st.name       AS "serviceTeamName",
        p.ministry_id AS "ministryId",
        mt.name       AS "ministryName"
      FROM profiles p
      LEFT JOIN c3_centres  c3 ON c3.id = p.c3_id
      LEFT JOIN service_teams st ON st.id = p.service_team_id
      LEFT JOIN ministry_teams mt ON mt.id = p.ministry_id
      ORDER BY p.full_name
    `;
    return NextResponse.json({ users: rows });
  } catch (err) {
    console.error('[GET /api/auth/users]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
