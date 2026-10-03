import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// GET /api/c3-reports — list (with RBAC filtering done server-side)
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const c3Id = searchParams.get('c3Id');

    let rows;
    if (role === 'c3_minister' && c3Id) {
      rows = await sql`
        SELECT
          r.id, r.c3_id AS "c3Id", c.name AS "c3Name", c.zone,
          r.meeting_date::text AS "meetingDate",
          r.topic_taught AS "topicTaught",
          r.male_attendance AS "maleAttendance",
          r.female_attendance AS "femaleAttendance",
          r.children_attendance AS "childrenAttendance",
          r.total_attendance AS "totalAttendance",
          r.first_timers AS "firstTimers",
          r.new_converts AS "newConverts",
          r.offering_amount AS "offeringAmount",
          r.tithes_amount AS "tithesAmount",
          r.prayer_requests AS "prayerRequests",
          r.testimonies,
          r.challenges_encountered AS "challengesEncountered",
          r.submitted_by AS "submittedBy",
          p.full_name AS "submittedByName",
          r.status,
          r.associate_pastor_notes AS "associatePastorNotes",
          r.resident_pastor_notes AS "residentPastorNotes",
          r.created_at AS "createdAt",
          r.updated_at AS "updatedAt"
        FROM c3_reports r
        JOIN c3_centres c ON c.id = r.c3_id
        LEFT JOIN profiles p ON p.id = r.submitted_by
        WHERE r.c3_id = ${c3Id}
        ORDER BY r.meeting_date DESC, r.created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT
          r.id, r.c3_id AS "c3Id", c.name AS "c3Name", c.zone,
          r.meeting_date::text AS "meetingDate",
          r.topic_taught AS "topicTaught",
          r.male_attendance AS "maleAttendance",
          r.female_attendance AS "femaleAttendance",
          r.children_attendance AS "childrenAttendance",
          r.total_attendance AS "totalAttendance",
          r.first_timers AS "firstTimers",
          r.new_converts AS "newConverts",
          r.offering_amount AS "offeringAmount",
          r.tithes_amount AS "tithesAmount",
          r.prayer_requests AS "prayerRequests",
          r.testimonies,
          r.challenges_encountered AS "challengesEncountered",
          r.submitted_by AS "submittedBy",
          p.full_name AS "submittedByName",
          r.status,
          r.associate_pastor_notes AS "associatePastorNotes",
          r.resident_pastor_notes AS "residentPastorNotes",
          r.created_at AS "createdAt",
          r.updated_at AS "updatedAt"
        FROM c3_reports r
        JOIN c3_centres c ON c.id = r.c3_id
        LEFT JOIN profiles p ON p.id = r.submitted_by
        ORDER BY r.meeting_date DESC, r.created_at DESC
      `;
    }

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[GET /api/c3-reports]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/c3-reports
export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const {
      c3Id, meetingDate, topicTaught,
      maleAttendance, femaleAttendance, childrenAttendance,
      firstTimers, newConverts, offeringAmount, tithesAmount,
      prayerRequests, testimonies, challengesEncountered,
      submittedBy,
    } = body;

    const rows = await sql`
      INSERT INTO c3_reports (
        c3_id, meeting_date, topic_taught,
        male_attendance, female_attendance, children_attendance,
        first_timers, new_converts, offering_amount, tithes_amount,
        prayer_requests, testimonies, challenges_encountered,
        submitted_by, status
      ) VALUES (
        ${c3Id}, ${meetingDate}, ${topicTaught || ''},
        ${maleAttendance || 0}, ${femaleAttendance || 0}, ${childrenAttendance || 0},
        ${firstTimers || 0}, ${newConverts || 0}, ${offeringAmount || 0}, ${tithesAmount || 0},
        ${prayerRequests || ''}, ${testimonies || ''}, ${challengesEncountered || ''},
        ${submittedBy || null}, 'submitted'
      )
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
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/c3-reports]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
