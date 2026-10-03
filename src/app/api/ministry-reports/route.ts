import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const ministryId = searchParams.get('ministryId');

    let rows;
    if (role === 'ministry_leader' && ministryId) {
      rows = await sql`
        SELECT
          r.id, r.ministry_id AS "ministryId", mt.name AS "ministryName",
          r.meeting_date::text AS "meetingDate",
          r.report_title AS "reportTitle",
          r.total_attendance AS "totalAttendance",
          r.first_timers AS "firstTimers",
          r.offering_amount AS "offeringAmount",
          r.activities_summary AS "activitiesSummary",
          r.spiritual_highlights AS "spiritualHighlights",
          r.upcoming_programs AS "upcomingPrograms",
          r.challenges_and_requests AS "challengesAndRequests",
          r.submitted_by AS "submittedBy",
          p.full_name AS "submittedByName",
          r.status,
          r.pastoral_notes AS "pastoralNotes",
          r.created_at AS "createdAt",
          r.updated_at AS "updatedAt"
        FROM ministry_reports r
        JOIN ministry_teams mt ON mt.id = r.ministry_id
        LEFT JOIN profiles p ON p.id = r.submitted_by
        WHERE r.ministry_id = ${ministryId}
        ORDER BY r.meeting_date DESC, r.created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT
          r.id, r.ministry_id AS "ministryId", mt.name AS "ministryName",
          r.meeting_date::text AS "meetingDate",
          r.report_title AS "reportTitle",
          r.total_attendance AS "totalAttendance",
          r.first_timers AS "firstTimers",
          r.offering_amount AS "offeringAmount",
          r.activities_summary AS "activitiesSummary",
          r.spiritual_highlights AS "spiritualHighlights",
          r.upcoming_programs AS "upcomingPrograms",
          r.challenges_and_requests AS "challengesAndRequests",
          r.submitted_by AS "submittedBy",
          p.full_name AS "submittedByName",
          r.status,
          r.pastoral_notes AS "pastoralNotes",
          r.created_at AS "createdAt",
          r.updated_at AS "updatedAt"
        FROM ministry_reports r
        JOIN ministry_teams mt ON mt.id = r.ministry_id
        LEFT JOIN profiles p ON p.id = r.submitted_by
        ORDER BY r.meeting_date DESC, r.created_at DESC
      `;
    }
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[GET /api/ministry-reports]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const {
      ministryId, meetingDate, reportTitle,
      totalAttendance, firstTimers, offeringAmount,
      activitiesSummary, spiritualHighlights, upcomingPrograms,
      challengesAndRequests, submittedBy,
    } = body;

    const rows = await sql`
      INSERT INTO ministry_reports (
        ministry_id, meeting_date, report_title,
        total_attendance, first_timers, offering_amount,
        activities_summary, spiritual_highlights, upcoming_programs,
        challenges_and_requests, submitted_by, status
      ) VALUES (
        ${ministryId}, ${meetingDate}, ${reportTitle || 'Monthly Fellowship Report'},
        ${totalAttendance || 0}, ${firstTimers || 0}, ${offeringAmount || 0},
        ${activitiesSummary || ''}, ${spiritualHighlights || ''}, ${upcomingPrograms || ''},
        ${challengesAndRequests || ''}, ${submittedBy || null}, 'submitted'
      )
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
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/ministry-reports]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
