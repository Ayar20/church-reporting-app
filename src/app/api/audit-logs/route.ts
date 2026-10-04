import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// GET /api/audit-logs — returns paginated audit logs (most recent first)
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');

    let rows;
    let countRows;
    if (userId) {
      rows = await sql`
        SELECT
          id, user_id AS "userId", user_name AS "userName", user_role AS "userRole",
          action, entity_type AS "entityType", entity_id AS "entityId",
          entity_label AS "entityLabel", details, created_at AS "createdAt"
        FROM audit_logs
        WHERE user_id = ${userId}::uuid
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRows = await sql`SELECT count(*) FROM audit_logs WHERE user_id = ${userId}::uuid`;
    } else {
      rows = await sql`
        SELECT
          id, user_id AS "userId", user_name AS "userName", user_role AS "userRole",
          action, entity_type AS "entityType", entity_id AS "entityId",
          entity_label AS "entityLabel", details, created_at AS "createdAt"
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRows = await sql`SELECT count(*) FROM audit_logs`;
    }

    return NextResponse.json({ data: rows, total: Number(countRows[0].count) });
  } catch (err) {
    console.error('[GET /api/audit-logs]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/audit-logs — insert a new audit log entry
export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { userId, userName, userRole, action, entityType, entityId, entityLabel, details } = body;

    if (!userId || !userName || !userRole || !action || !entityType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO audit_logs (user_id, user_name, user_role, action, entity_type, entity_id, entity_label, details)
      VALUES (
        ${userId}::uuid, ${userName}, ${userRole}, ${action}, ${entityType},
        ${entityId || null}, ${entityLabel || null},
        ${details ? JSON.stringify(details) : null}::jsonb
      )
      RETURNING
        id, user_id AS "userId", user_name AS "userName", user_role AS "userRole",
        action, entity_type AS "entityType", entity_id AS "entityId",
        entity_label AS "entityLabel", details, created_at AS "createdAt"
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/audit-logs]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
