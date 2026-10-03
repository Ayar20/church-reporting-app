import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await req.json();
    const {
      ministryId, meetingDate, reportTitle,
      totalAttendance, firstTimers, offeringAmount,
      activitiesSummary, spiritualHighlights, upcomingPrograms,
      challengesAndRequests, status, pastoralNotes,
    } = body;

    const rows = await sql`
      UPDATE ministry_reports SET
        ministry_id             = COALESCE(${ministryId ?? null}, ministry_id),
        meeting_date            = COALESCE(${meetingDate ?? null}, meeting_date),
        report_title            = COALESCE(${reportTitle ?? null}, report_title),
        total_attendance        = COALESCE(${totalAttendance ?? null}, total_attendance),
        first_timers            = COALESCE(${firstTimers ?? null}, first_timers),
        offering_amount         = COALESCE(${offeringAmount ?? null}, offering_amount),
        activities_summary      = COALESCE(${activitiesSummary ?? null}, activities_summary),
        spiritual_highlights    = COALESCE(${spiritualHighlights ?? null}, spiritual_highlights),
        upcoming_programs       = COALESCE(${upcomingPrograms ?? null}, upcoming_programs),
        challenges_and_requests = COALESCE(${challengesAndRequests ?? null}, challenges_and_requests),
        status                  = COALESCE(${status ?? null}::report_status, status),
        pastoral_notes          = COALESCE(${pastoralNotes ?? null}, pastoral_notes),
        updated_at              = now()
      WHERE id = ${id}
      RETURNING
        id, ministry_id AS "ministryId",
        meeting_date::text AS "meetingDate",
        report_title AS "reportTitle",
        total_attendance AS "totalAttendance",
        first_timers AS "firstTimers",
        offering_amount AS "offeringAmount",
        activities_summary AS "activitiesSummary",
        spiritual_highlights AS "spiritualHighlights",
        upcoming_programs AS "upcomingPrograms",
        challenges_and_requests AS "challengesAndRequests",
        submitted_by AS "submittedBy",
        status,
        pastoral_notes AS "pastoralNotes",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error('[PUT /api/ministry-reports/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM ministry_reports WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/ministry-reports/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
