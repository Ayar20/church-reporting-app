import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// PUT /api/users/[id] — update user profile
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sql = getDb();
    const body = await req.json();
    const { fullName, email, phone, role, c3Id, serviceTeamId, ministryId } = body;

    const rows = await sql`
      UPDATE profiles
      SET
        full_name       = COALESCE(${fullName}, full_name),
        email           = COALESCE(${email ? email.toLowerCase().trim() : null}, email),
        phone           = COALESCE(${phone}, phone),
        role            = COALESCE(${role}, role),
        c3_id           = ${c3Id ? c3Id : null}::uuid,
        service_team_id = ${serviceTeamId ? serviceTeamId : null}::uuid,
        ministry_id     = ${ministryId ? ministryId : null}::uuid,
        updated_at      = now()
      WHERE id = ${id}::uuid
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

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: rows[0] });
  } catch (err: unknown) {
    console.error('[PUT /api/users/[id]]', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users/[id] — delete user profile
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sql = getDb();

    const rows = await sql`
      DELETE FROM profiles
      WHERE id = ${id}::uuid
      RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: rows[0].id });
  } catch (err: unknown) {
    console.error('[DELETE /api/users/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
