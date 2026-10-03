import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await req.json();
    const {
      teamId, serviceDate, serviceType,
      rosterPresentCount, rosterAbsentCount, totalOnDuty,
      tasksCompleted, equipmentStatus, challengesEncountered, urgentNeeds,
      status, associatePastorNotes, residentPastorNotes,
    } = body;

    const rows = await sql`
      UPDATE service_team_reports SET
        team_id               = COALESCE(${teamId ?? null}, team_id),
        service_date          = COALESCE(${serviceDate ?? null}, service_date),
        service_type          = COALESCE(${serviceType ?? null}::service_type, service_type),
        roster_present_count  = COALESCE(${rosterPresentCount ?? null}, roster_present_count),
        roster_absent_count   = COALESCE(${rosterAbsentCount ?? null}, roster_absent_count),
        total_on_duty         = COALESCE(${totalOnDuty ?? null}, total_on_duty),
        tasks_completed       = COALESCE(${tasksCompleted ?? null}, tasks_completed),
        equipment_status      = COALESCE(${equipmentStatus ?? null}, equipment_status),
        challenges_encountered = COALESCE(${challengesEncountered ?? null}, challenges_encountered),
        urgent_needs          = COALESCE(${urgentNeeds ?? null}, urgent_needs),
        status                = COALESCE(${status ?? null}::report_status, status),
        associate_pastor_notes = COALESCE(${associatePastorNotes ?? null}, associate_pastor_notes),
        resident_pastor_notes = COALESCE(${residentPastorNotes ?? null}, resident_pastor_notes),
        updated_at            = now()
      WHERE id = ${id}
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
        associate_pastor_notes AS "associatePastorNotes",
        resident_pastor_notes AS "residentPastorNotes",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error('[PUT /api/service-team-reports/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM service_team_reports WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/service-team-reports/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
