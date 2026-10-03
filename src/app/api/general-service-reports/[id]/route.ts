import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await req.json();
    const {
      serviceDate, serviceType, preacher, sermonTitle,
      maleCount, femaleCount, childrenCount,
      firstTimersCount, newConvertsCount,
      totalOffering, totalTithe, notes,
    } = body;

    const rows = await sql`
      UPDATE general_service_reports SET
        service_date       = COALESCE(${serviceDate ?? null}, service_date),
        service_type       = COALESCE(${serviceType ?? null}::service_type, service_type),
        preacher           = COALESCE(${preacher ?? null}, preacher),
        sermon_title       = COALESCE(${sermonTitle ?? null}, sermon_title),
        male_count         = COALESCE(${maleCount ?? null}, male_count),
        female_count       = COALESCE(${femaleCount ?? null}, female_count),
        children_count     = COALESCE(${childrenCount ?? null}, children_count),
        first_timers_count = COALESCE(${firstTimersCount ?? null}, first_timers_count),
        new_converts_count = COALESCE(${newConvertsCount ?? null}, new_converts_count),
        total_offering     = COALESCE(${totalOffering ?? null}, total_offering),
        total_tithe        = COALESCE(${totalTithe ?? null}, total_tithe),
        notes              = COALESCE(${notes ?? null}, notes)
      WHERE id = ${id}
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
        notes, submitted_by AS "submittedBy",
        created_at AS "createdAt"
    `;
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error('[PUT /api/general-service-reports/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM general_service_reports WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/general-service-reports/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
