import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// GET /api/users — list all church leadership profiles
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
        mt.name       AS "ministryName",
        p.created_at  AS "createdAt",
        p.updated_at  AS "updatedAt"
      FROM profiles p
      LEFT JOIN c3_centres  c3 ON c3.id = p.c3_id
      LEFT JOIN service_teams st ON st.id = p.service_team_id
      LEFT JOIN ministry_teams mt ON mt.id = p.ministry_id
      ORDER BY p.full_name ASC
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[GET /api/users]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users — create a new leadership profile
export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { fullName, email, phone, role, c3Id, serviceTeamId, ministryId } = body;

    if (!fullName || !email || !role) {
      return NextResponse.json({ error: 'Full name, email, and role are required' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO profiles (
        full_name,
        email,
        phone,
        role,
        c3_id,
        service_team_id,
        ministry_id
      )
      VALUES (
        ${fullName},
        ${email.toLowerCase().trim()},
        ${phone || null},
        ${role},
        ${c3Id ? c3Id : null}::uuid,
        ${serviceTeamId ? serviceTeamId : null}::uuid,
        ${ministryId ? ministryId : null}::uuid
      )
      RETURNING
        id,
        full_name AS "fullName",
        email,
        phone,
        role,
        avatar_url AS "avatarUrl",
        c3_id AS "c3Id",
        service_team_id AS "serviceTeamId",
        ministry_id AS "ministryId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err: unknown) {
    console.error('[POST /api/users]', err);
    const msg = err instanceof Error ? err.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'A leader with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
