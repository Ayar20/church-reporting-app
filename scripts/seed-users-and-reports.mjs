import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_L3UYsOCpoDG6@ep-old-wildflower-b4cdsnfs.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);

async function seed() {
  console.log('Seeding profiles and reports...');

  // Get IDs of centres and teams
  const centres = await sql`SELECT id, name FROM c3_centres`;
  const teams = await sql`SELECT id, name, code FROM service_teams`;
  const ministries = await sql`SELECT id, name, code FROM ministry_teams`;

  const getCentreId = (nameSub) => centres.find(c => c.name.toLowerCase().includes(nameSub.toLowerCase()))?.id || null;
  const getTeamId = (code) => teams.find(t => t.code === code)?.id || null;
  const getMinistryId = (code) => ministries.find(m => m.code === code)?.id || null;

  // Insert profiles
  const users = [
    {
      fullName: 'Pastor David Terzungwe',
      email: 'resident.pastor@cfcmakurdi.org',
      phone: '+234 803 123 4567',
      role: 'resident_pastor',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      fullName: 'Pastor Emmanuel Ogwuche',
      email: 'assoc.c3@cfcmakurdi.org',
      phone: '+234 802 234 5678',
      role: 'associate_pastor_c3',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      fullName: 'Pastor Samuel Iorkase',
      email: 'assoc.teams@cfcmakurdi.org',
      phone: '+234 805 345 6789',
      role: 'associate_pastor_service_teams',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    {
      fullName: 'Minister Faith Terungwa',
      email: 'faith.nyiman@cfcmakurdi.org',
      phone: '+234 813 456 7890',
      role: 'c3_minister',
      c3Id: getCentreId('Nyiman'),
    },
    {
      fullName: 'Minister Joshua Idoko',
      email: 'joshua.gakume@cfcmakurdi.org',
      phone: '+234 814 567 8901',
      role: 'c3_minister',
      c3Id: getCentreId('George Akume'),
    },
    {
      fullName: 'Minister Timothy Bem',
      email: 'timothy.northbank@cfcmakurdi.org',
      phone: '+234 815 678 1234',
      role: 'c3_minister',
      c3Id: getCentreId('North Bank'),
    },
    {
      fullName: 'Minister Peter Ochigbo',
      email: 'peter.gyadovilla@cfcmakurdi.org',
      phone: '+234 816 789 2345',
      role: 'c3_minister',
      c3Id: getCentreId('Gyado Villa'),
    },
    {
      fullName: 'Minister Comfort Chia',
      email: 'comfort.welfareqtrs@cfcmakurdi.org',
      phone: '+234 817 890 3456',
      role: 'c3_minister',
      c3Id: getCentreId('Welfare'),
    },
    {
      fullName: 'Minister Paul Hembadoon',
      email: 'paul.oldgra@cfcmakurdi.org',
      phone: '+234 818 901 4567',
      role: 'c3_minister',
      c3Id: getCentreId('Old GRA'),
    },
    {
      fullName: 'Pastor Mercy Agbese',
      email: 'prayer.lead@cfcmakurdi.org',
      phone: '+234 819 012 5678',
      role: 'service_team_leader',
      serviceTeamId: getTeamId('PRAYER'),
    },
    {
      fullName: 'Bro. Gabriel Onoja',
      email: 'music.lead@cfcmakurdi.org',
      phone: '+234 816 678 9012',
      role: 'service_team_leader',
      serviceTeamId: getTeamId('MUSIC'),
    },
    {
      fullName: 'Bro. Daniel Aondo',
      email: 'production.lead@cfcmakurdi.org',
      phone: '+234 818 890 1234',
      role: 'service_team_leader',
      serviceTeamId: getTeamId('PRODUCTION'),
    },
    {
      fullName: 'Deaconess Martha Kula',
      email: 'welfare.lead@cfcmakurdi.org',
      phone: '+234 817 789 0123',
      role: 'service_team_leader',
      serviceTeamId: getTeamId('WELFARE'),
    },
    {
      fullName: 'Sis. Grace Kave',
      email: 'ushering.lead@cfcmakurdi.org',
      phone: '+234 812 345 6789',
      role: 'service_team_leader',
      serviceTeamId: getTeamId('USHERS'),
    },
    {
      fullName: 'Elder Abraham Chia',
      email: 'men.fellowship@cfcmakurdi.org',
      phone: '+234 809 901 2345',
      role: 'ministry_leader',
      ministryId: getMinistryId('MEN'),
    },
    {
      fullName: 'Deaconess Blessing Terungwa',
      email: '31stladies@cfcmakurdi.org',
      phone: '+234 808 012 3456',
      role: 'ministry_leader',
      ministryId: getMinistryId('LADIES'),
    },
    {
      fullName: 'Sis. Rosemary Abah',
      email: 'children.church@cfcmakurdi.org',
      phone: '+234 807 123 9876',
      role: 'ministry_leader',
      ministryId: getMinistryId('CHILDREN'),
    },
  ];

  for (const u of users) {
    await sql`
      INSERT INTO profiles (full_name, email, phone, role, c3_id, service_team_id, ministry_id, avatar_url)
      VALUES (${u.fullName}, ${u.email}, ${u.phone || null}, ${u.role}::user_role, ${u.c3Id || null}, ${u.serviceTeamId || null}, ${u.ministryId || null}, ${u.avatarUrl || null})
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        c3_id = EXCLUDED.c3_id,
        service_team_id = EXCLUDED.service_team_id,
        ministry_id = EXCLUDED.ministry_id
    `;
  }
  console.log(`✅ Seeded ${users.length} profiles.`);

  // Get seeded profiles for report authorship
  const profs = await sql`SELECT id, email FROM profiles`;
  const getProfId = (email) => profs.find(p => p.email === email)?.id || null;

  // Insert sample C3 reports
  const nyimanId = getCentreId('Nyiman');
  if (nyimanId) {
    await sql`
      INSERT INTO c3_reports (
        c3_id, meeting_date, topic_taught,
        male_attendance, female_attendance, children_attendance,
        first_timers, new_converts, offering_amount, tithes_amount,
        prayer_requests, testimonies, challenges_encountered,
        submitted_by, status, associate_pastor_notes, resident_pastor_notes
      ) VALUES (
        ${nyimanId}, '2026-09-23', 'Walking in Supernatural Dominion: Part 3',
        11, 14, 7, 3, 1, 18500, 25000,
        'Healing for Mama Iorbee admitted at FMC Makurdi. Job breakthrough for Bro Joseph.',
        'Sis. Jennifer testified of surviving a vehicle breakdown on Makurdi-Aliade expressway safely.',
        'Generator fuel price increase affected power during the fellowship.',
        ${getProfId('faith.nyiman@cfcmakurdi.org')}, 'approved_by_resident_pastor',
        'Commended for consistent attendance growth and follow-up on FMC hospital visit.',
        'Great work Nyiman cell. Pastoral team will visit Mama Iorbee at FMC.'
      )
    `;
  }

  // Insert sample Service Team report
  const prayerTeamId = getTeamId('PRAYER');
  if (prayerTeamId) {
    await sql`
      INSERT INTO service_team_reports (
        team_id, service_date, service_type,
        roster_present_count, roster_absent_count, total_on_duty,
        tasks_completed, equipment_status, challenges_encountered, urgent_needs,
        submitted_by, status, associate_pastor_notes, resident_pastor_notes
      ) VALUES (
        ${prayerTeamId}, '2026-09-27', 'first_service',
        16, 1, 16,
        'Conducted 6:00 AM pre-service prayer vigil. Interceded during praise, word, and altarcall. Counselled 17 altar call converts and 12 brethren in prayer room.',
        'Prayer room sound monitors and counselling intake sheets were properly set up.',
        'Need more private counselling cubicles as demand for one-on-one sessions was very high.',
        'Additional 50 convert decision counselling booklets.',
        ${getProfId('prayer.lead@cfcmakurdi.org')}, 'approved_by_resident_pastor',
        'Prayer atmosphere was deep and effective. Convert follow-up booklets approved.',
        'Commended. Pastoral counseling team is vital to fruit that remains.'
      )
    `;
  }

  // Insert sample Ministry Fellowship report
  const menMinId = getMinistryId('MEN');
  if (menMinId) {
    await sql`
      INSERT INTO ministry_reports (
        ministry_id, meeting_date, report_title,
        total_attendance, first_timers, offering_amount,
        activities_summary, spiritual_highlights, upcoming_programs,
        challenges_and_requests, submitted_by, status, pastoral_notes
      ) VALUES (
        ${menMinId}, '2026-09-20', 'September Men Breakfast & Wealth Creation Summit',
        78, 9, 95000,
        'Organized practical business seminar on Commercial Grain Storage & Distribution in Benue State. Followed by intense prayer for family prosperity.',
        '3 men dedicated their businesses to the Lord; one brother received salvation during the breakfast session.',
        'Annual Men of Faith Camp Retreat scheduled for November 14-16 at Canaan Land Camp, Makurdi.',
        'Requesting church bus support for transporting men living in North Bank and Gyado Villa for the upcoming retreat.',
        ${getProfId('men.fellowship@cfcmakurdi.org')}, 'approved_by_resident_pastor',
        'Excellent initiative connecting faith and economic empowerment. Church bus logistics approved for the retreat.'
      )
    `;
  }

  // Ensure enum includes all service types
  const extraEnums = ['prayer_and_communion', 'connect_to_life_first', 'connect_to_life_second', 'connect_to_life_combined', 'c3_midweek'];
  for (const val of extraEnums) {
    try {
      await sql.query(`ALTER TYPE service_type ADD VALUE IF NOT EXISTS '${val}'`);
    } catch { /* ignore if already exists */ }
  }

  // Insert sample General Service report
  await sql`
    INSERT INTO general_service_reports (
      service_date, service_type, preacher, sermon_title,
      male_count, female_count, children_count,
      first_timers_count, new_converts_count,
      total_offering, total_tithe, notes, submitted_by
    ) VALUES (
      '2026-09-27', 'prayer_and_communion', 'Pastor David Terzungwe',
      'Unlocking Supernatural Supply in Economic Seasons',
      245, 310, 146, 48, 17, 385000, 760000,
      'Last Sunday of the Month Prayer & Communion Service — All 6 C3 Community Churches gathered together in one celebration. Holy Communion ministered with intense prayer sessions.',
      ${getProfId('resident.pastor@cfcmakurdi.org')}
    )
  `;

  console.log('✅ Successfully seeded sample reports into Neon DB!');
}

seed().catch(console.error);
