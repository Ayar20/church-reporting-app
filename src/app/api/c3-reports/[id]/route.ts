import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// PUT /api/c3-reports/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await req.json();
    const {
      c3Id, meetingDate, topicTaught,
      maleAttendance, femaleAttendance, childrenAttendance,
      firstTimers, newConverts, offeringAmount, tithesAmount,
      prayerRequests, testimonies, challengesEncountered,
      status, associatePastorNotes, residentPastorNotes,
    } = body;

    const rows = await sql`
      UPDATE c3_reports SET
        c3_id                 = COALESCE(${c3Id ?? null}, c3_id),
        meeting_date          = COALESCE(${meetingDate ?? null}, meeting_date),
        topic_taught          = COALESCE(${topicTaught ?? null}, topic_taught),
        male_attendance       = COALESCE(${maleAttendance ?? null}, male_attendance),
        female_attendance     = COALESCE(${femaleAttendance ?? null}, female_attendance),
        children_attendance   = COALESCE(${childrenAttendance ?? null}, children_attendance),
        first_timers          = COALESCE(${firstTimers ?? null}, first_timers),
        new_converts          = COALESCE(${newConverts ?? null}, new_converts),
        offering_amount       = COALESCE(${offeringAmount ?? null}, offering_amount),
        tithes_amount         = COALESCE(${tithesAmount ?? null}, tithes_amount),
        prayer_requests       = COALESCE(${prayerRequests ?? null}, prayer_requests),
        testimonies           = COALESCE(${testimonies ?? null}, testimonies),
        challenges_encountered = COALESCE(${challengesEncountered ?? null}, challenges_encountered),
        status                = COALESCE(${status ?? null}::report_status, status),
        associate_pastor_notes = COALESCE(${associatePastorNotes ?? null}, associate_pastor_notes),
        resident_pastor_notes = COALESCE(${residentPastorNotes ?? null}, resident_pastor_notes),
        updated_at            = now()
      WHERE id = ${id}
      RETURNING
        id, c3_id AS "c3Id",
        meeting_date::text AS "meetingDate",
        topic_taught AS "topicTaught",
        male_attendance AS "maleAttendance",
        female_attendance AS "femaleAttendance",
        children_attendance AS "childrenAttendance",
        total_attendance AS "totalAttendance",
        first_timers AS "firstTimers",
        new_converts AS "newConverts",
        offering_amount AS "offeringAmount",
        tithes_amount AS "tithesAmount",
        prayer_requests AS "prayerRequests",
        testimonies,
        challenges_encountered AS "challengesEncountered",
        submitted_by AS "submittedBy",
        status,
        associate_pastor_notes AS "associatePastorNotes",
        resident_pastor_notes AS "residentPastorNotes",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error('[PUT /api/c3-reports/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/c3-reports/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM c3_reports WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/c3-reports/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
