import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT
        id,
        service_date::text AS "serviceDate",
        service_type AS "serviceType",
        preacher, sermon_title AS "sermonTitle",
        male_count AS "maleCount",
        female_count AS "femaleCount",
        children_count AS "childrenCount",
        total_attendance AS "totalAttendance",
        first_timers_count AS "firstTimersCount",
        new_converts_count AS "newConvertsCount",
        total_offering AS "totalOffering",
        total_tithe AS "totalTithe",
        notes,
        submitted_by AS "submittedBy",
        created_at AS "createdAt"
      FROM general_service_reports
      ORDER BY service_date DESC, created_at DESC
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[GET /api/general-service-reports]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const {
      serviceDate, serviceType, preacher, sermonTitle,
      maleCount, femaleCount, childrenCount,
      firstTimersCount, newConvertsCount,
      totalOffering, totalTithe, notes, submittedBy,
    } = body;

    const rows = await sql`
      INSERT INTO general_service_reports (
        service_date, service_type, preacher, sermon_title,
        male_count, female_count, children_count,
        first_timers_count, new_converts_count,
        total_offering, total_tithe, notes, submitted_by
      ) VALUES (
        ${serviceDate}, ${serviceType || 'first_service'}, ${preacher || ''}, ${sermonTitle || ''},
        ${maleCount || 0}, ${femaleCount || 0}, ${childrenCount || 0},
        ${firstTimersCount || 0}, ${newConvertsCount || 0},
        ${totalOffering || 0}, ${totalTithe || 0}, ${notes || ''}, ${submittedBy || null}
      )
      RETURNING
        id,
        service_date::text AS "serviceDate",
        service_type AS "serviceType",
        preacher, sermon_title AS "sermonTitle",
        male_count AS "maleCount",
        female_count AS "femaleCount",
        children_count AS "childrenCount",
        total_attendance AS "totalAttendance",
        first_timers_count AS "firstTimersCount",
        new_converts_count AS "newConvertsCount",
        total_offering AS "totalOffering",
        total_tithe AS "totalTithe",
        notes,
        submitted_by AS "submittedBy",
        created_at AS "createdAt"
    `;
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/general-service-reports]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
