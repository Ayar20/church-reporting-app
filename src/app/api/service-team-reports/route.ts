import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const teamId = searchParams.get('teamId');

    let rows;
    if (role === 'service_team_leader' && teamId) {
      rows = await sql`
        SELECT
          r.id, r.team_id AS "teamId", st.name AS "teamName",
          r.service_date::text AS "serviceDate",
          r.service_type AS "serviceType",
          r.roster_present_count AS "rosterPresentCount",
          r.roster_absent_count AS "rosterAbsentCount",
          r.total_on_duty AS "totalOnDuty",
          r.tasks_completed AS "tasksCompleted",
          r.equipment_status AS "equipmentStatus",
          r.challenges_encountered AS "challengesEncountered",
          r.urgent_needs AS "urgentNeeds",
          r.submitted_by AS "submittedBy",
          p.full_name AS "submittedByName",
          r.status,
          r.associate_pastor_notes AS "associatePastorNotes",
          r.resident_pastor_notes AS "residentPastorNotes",
          r.created_at AS "createdAt",
          r.updated_at AS "updatedAt"
        FROM service_team_reports r
        JOIN service_teams st ON st.id = r.team_id
        LEFT JOIN profiles p ON p.id = r.submitted_by
        WHERE r.team_id = ${teamId}
        ORDER BY r.service_date DESC, r.created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT
          r.id, r.team_id AS "teamId", st.name AS "teamName",
          r.service_date::text AS "serviceDate",
          r.service_type AS "serviceType",
          r.roster_present_count AS "rosterPresentCount",
          r.roster_absent_count AS "rosterAbsentCount",
          r.total_on_duty AS "totalOnDuty",
          r.tasks_completed AS "tasksCompleted",
          r.equipment_status AS "equipmentStatus",
          r.challenges_encountered AS "challengesEncountered",
          r.urgent_needs AS "urgentNeeds",
          r.submitted_by AS "submittedBy",
          p.full_name AS "submittedByName",
          r.status,
          r.associate_pastor_notes AS "associatePastorNotes",
          r.resident_pastor_notes AS "residentPastorNotes",
          r.created_at AS "createdAt",
          r.updated_at AS "updatedAt"
        FROM service_team_reports r
        JOIN service_teams st ON st.id = r.team_id
        LEFT JOIN profiles p ON p.id = r.submitted_by
        ORDER BY r.service_date DESC, r.created_at DESC
      `;
    }
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[GET /api/service-team-reports]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const {
      teamId, serviceDate, serviceType,
      rosterPresentCount, rosterAbsentCount, totalOnDuty,
      tasksCompleted, equipmentStatus, challengesEncountered, urgentNeeds,
      submittedBy,
    } = body;

    const rows = await sql`
      INSERT INTO service_team_reports (
        team_id, service_date, service_type,
        roster_present_count, roster_absent_count, total_on_duty,
        tasks_completed, equipment_status, challenges_encountered, urgent_needs,
        submitted_by, status
      ) VALUES (
        ${teamId}, ${serviceDate}, ${serviceType || 'first_service'},
        ${rosterPresentCount || 0}, ${rosterAbsentCount || 0}, ${totalOnDuty || rosterPresentCount || 0},
        ${tasksCompleted || ''}, ${equipmentStatus || ''}, ${challengesEncountered || ''}, ${urgentNeeds || ''},
        ${submittedBy || null}, 'submitted'
      )
      RETURNING
        id, team_id AS "teamId",
        service_date::text AS "serviceDate",
        service_type AS "serviceType",
        roster_present_count AS "rosterPresentCount",
        roster_absent_count AS "rosterAbsentCount",
        total_on_duty AS "totalOnDuty",
        tasks_completed AS "tasksCompleted",
        equipment_status AS "equipmentStatus",
        challenges_encountered AS "challengesEncountered",
        urgent_needs AS "urgentNeeds",
        submitted_by AS "submittedBy",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/service-team-reports]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
