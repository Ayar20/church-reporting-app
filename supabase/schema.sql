-- ==============================================================================
-- CHRIST FAMILY CENTRE MAKURDI - CHURCH REPORTING SYSTEM SCHEMA
-- ==============================================================================

-- 1. Create Enums for Roles and Statuses
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'resident_pastor',
        'associate_pastor_c3',
        'associate_pastor_service_teams',
        'c3_minister',
        'service_team_leader',
        'ministry_leader'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM (
        'draft',
        'submitted',
        'reviewed_by_associate',
        'approved_by_resident_pastor',
        'revision_requested'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_type AS ENUM (
        'first_service',
        'second_service',
        'combined_service',
        'midweek_service',
        'special_meeting'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Organizations & Units Tables

-- Community Churches (C3s)
CREATE TABLE IF NOT EXISTS c3_centres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    zone VARCHAR(100) NOT NULL, -- e.g. 'Wurukum', 'High-Level', 'North-Bank', 'Kanshio', 'Judges Quarters', 'Modern Market'
    meeting_address TEXT NOT NULL,
    meeting_day VARCHAR(50) DEFAULT 'Wednesday',
    meeting_time VARCHAR(50) DEFAULT '5:00 PM',
    host_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Service Teams
CREATE TABLE IF NOT EXISTS service_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL, -- e.g. 'Choir / Sound of Judah', 'Ushering & Greeters', 'Media & Tech', 'Sanctuary Keepers', 'Protocol', 'Traffic & Security'
    code VARCHAR(50) UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ministry Fellowships
CREATE TABLE IF NOT EXISTS ministry_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL, -- e.g. 'Men of Faith Fellowship', '31st Ladies Fellowship', "Children's Church"
    code VARCHAR(50) UNIQUE,
    description TEXT,
    target_audience VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Profiles / User Directory (Extending Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role user_role NOT NULL DEFAULT 'c3_minister',
    c3_id UUID REFERENCES c3_centres(id) ON DELETE SET NULL,
    service_team_id UUID REFERENCES service_teams(id) ON DELETE SET NULL,
    ministry_id UUID REFERENCES ministry_teams(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. C3 Weekly Reports
CREATE TABLE IF NOT EXISTS c3_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    c3_id UUID NOT NULL REFERENCES c3_centres(id) ON DELETE CASCADE,
    meeting_date DATE NOT NULL,
    topic_taught TEXT,
    male_attendance INTEGER NOT NULL DEFAULT 0,
    female_attendance INTEGER NOT NULL DEFAULT 0,
    children_attendance INTEGER NOT NULL DEFAULT 0,
    total_attendance INTEGER GENERATED ALWAYS AS (male_attendance + female_attendance + children_attendance) STORED,
    first_timers INTEGER NOT NULL DEFAULT 0,
    new_converts INTEGER NOT NULL DEFAULT 0,
    offering_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tithes_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    prayer_requests TEXT,
    testimonies TEXT,
    challenges_encountered TEXT,
    submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status report_status NOT NULL DEFAULT 'submitted',
    associate_pastor_notes TEXT,
    resident_pastor_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Service Team Reports
CREATE TABLE IF NOT EXISTS service_team_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES service_teams(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    service_type service_type NOT NULL DEFAULT 'first_service',
    roster_present_count INTEGER NOT NULL DEFAULT 0,
    roster_absent_count INTEGER NOT NULL DEFAULT 0,
    total_on_duty INTEGER NOT NULL DEFAULT 0,
    tasks_completed TEXT,
    equipment_status TEXT, -- notes on sound, instruments, cameras, screens, ushering badges etc.
    challenges_encountered TEXT,
    urgent_needs TEXT,
    submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status report_status NOT NULL DEFAULT 'submitted',
    associate_pastor_notes TEXT,
    resident_pastor_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Ministry Fellowship Reports
CREATE TABLE IF NOT EXISTS ministry_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ministry_id UUID NOT NULL REFERENCES ministry_teams(id) ON DELETE CASCADE,
    meeting_date DATE NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    total_attendance INTEGER NOT NULL DEFAULT 0,
    first_timers INTEGER NOT NULL DEFAULT 0,
    offering_amount NUMERIC(12, 2) DEFAULT 0.00,
    activities_summary TEXT NOT NULL,
    spiritual_highlights TEXT,
    upcoming_programs TEXT,
    challenges_and_requests TEXT,
    submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status report_status NOT NULL DEFAULT 'submitted',
    pastoral_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Sunday General Service Attendance (Consolidated for Resident Pastor)
CREATE TABLE IF NOT EXISTS general_service_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_date DATE NOT NULL,
    service_type service_type NOT NULL DEFAULT 'first_service',
    preacher VARCHAR(255) NOT NULL,
    sermon_title TEXT NOT NULL,
    male_count INTEGER NOT NULL DEFAULT 0,
    female_count INTEGER NOT NULL DEFAULT 0,
    children_count INTEGER NOT NULL DEFAULT 0,
    total_attendance INTEGER GENERATED ALWAYS AS (male_count + female_count + children_count) STORED,
    first_timers_count INTEGER NOT NULL DEFAULT 0,
    new_converts_count INTEGER NOT NULL DEFAULT 0,
    total_offering NUMERIC(12, 2) DEFAULT 0.00,
    total_tithe NUMERIC(12, 2) DEFAULT 0.00,
    notes TEXT,
    submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Row Level Security (RLS) Setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE c3_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE c3_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_team_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_service_reports ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profile viewing for church members"
    ON profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- Reference Tables (Read-only for all logged in users, manageable by pastors)
CREATE POLICY "Anyone can view C3s" ON c3_centres FOR SELECT USING (true);
CREATE POLICY "Anyone can view Service Teams" ON service_teams FOR SELECT USING (true);
CREATE POLICY "Anyone can view Ministry Teams" ON ministry_teams FOR SELECT USING (true);

-- C3 Reports Policies
CREATE POLICY "C3 Ministers see own C3 reports"
    ON c3_reports FOR SELECT
    USING (
        get_my_role() IN ('resident_pastor', 'associate_pastor_c3') OR
        c3_id IN (SELECT c3_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "C3 Ministers can create reports"
    ON c3_reports FOR INSERT
    WITH CHECK (
        get_my_role() IN ('resident_pastor', 'associate_pastor_c3', 'c3_minister')
    );

CREATE POLICY "C3 Ministers and Pastors can update reports"
    ON c3_reports FOR UPDATE
    USING (
        get_my_role() IN ('resident_pastor', 'associate_pastor_c3') OR
        submitted_by = auth.uid()
    );

-- Service Team Reports Policies
CREATE POLICY "Service Team reports access"
    ON service_team_reports FOR SELECT
    USING (
        get_my_role() IN ('resident_pastor', 'associate_pastor_service_teams') OR
        team_id IN (SELECT service_team_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Service Team leaders can insert reports"
    ON service_team_reports FOR INSERT
    WITH CHECK (
        get_my_role() IN ('resident_pastor', 'associate_pastor_service_teams', 'service_team_leader')
    );

CREATE POLICY "Service Team leaders and pastors update"
    ON service_team_reports FOR UPDATE
    USING (
        get_my_role() IN ('resident_pastor', 'associate_pastor_service_teams') OR
        submitted_by = auth.uid()
    );

-- Ministry Reports Policies
CREATE POLICY "Ministry reports access"
    ON ministry_reports FOR SELECT
    USING (
        get_my_role() = 'resident_pastor' OR
        ministry_id IN (SELECT ministry_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Ministry leaders and Resident Pastor insert"
    ON ministry_reports FOR INSERT
    WITH CHECK (
        get_my_role() IN ('resident_pastor', 'ministry_leader')
    );

-- 9. Sample Seed Data for Christ Family Centre Makurdi
INSERT INTO c3_centres (name, zone, meeting_address, host_name) VALUES
    ('C3 Wurukum Grace Center', 'Wurukum', 'No. 14 Gboko Road, Wurukum, Makurdi', 'Bro. Terungwa Aondo'),
    ('C3 High-Level Faith Hub', 'High-Level', 'Opposite Modern Market Roundabout, High-Level, Makurdi', 'Sis. Deborah Iorhemen'),
    ('C3 North-Bank Victory Cell', 'North-Bank', 'Near University of Agriculture Road, North-Bank, Makurdi', 'Bro. Emmanuel Agbo'),
    ('C3 Kanshio Covenant Assembly', 'Kanshio', 'Behind Federal Low Cost, Kanshio, Makurdi', 'Elder Peter Ochigbo'),
    ('C3 Judges Quarters Peace Unit', 'Judges Quarters', 'Plot 8, GRA Extension, Judges Quarters, Makurdi', 'Deaconess Comfort Chia'),
    ('C3 Modern Market Dominion Cell', 'Modern Market', 'Beside Railway Line, Modern Market Area, Makurdi', 'Bro. Joshua Terver')
ON CONFLICT DO NOTHING;

INSERT INTO service_teams (name, code, description) VALUES
    ('Choir (Sound of Judah)', 'CHOIR', 'Praise & Worship team leading prophetic atmosphere and worship sessions'),
    ('Ushering & Greeters', 'USHERS', 'Sanctuary seating, welcoming congregants, offering coordination'),
    ('Media & Technical', 'MEDIA', 'Audio engineering, livestreaming, multi-camera videography, projection'),
    ('Sanctuary Keepers', 'SANCTUARY', 'Beautification, cleanliness, and ambiance of church auditorium and surroundings'),
    ('Protocol & Pastoral Care', 'PROTOCOL', 'Guest ministers reception, pulpit protocol, orderliness during altarcalls'),
    ('Traffic & Security', 'SECURITY', 'Vehicle parking management, perimeter security, surveillance'),
    ('Welfare & Follow-Up', 'WELFARE', 'Visitor assimilation, care for needy members, home checkups')
ON CONFLICT DO NOTHING;

INSERT INTO ministry_teams (name, code, description, target_audience) VALUES
    ('Men of Faith Fellowship', 'MEN', 'Empowerment, spiritual mentorship, and leadership for Christian fathers and men', 'Men'),
    ('31st Ladies Fellowship', 'LADIES', 'Virtuous women ministry, home builders, spiritual retreats, and maternal care', 'Women'),
    ('Children''s Church (Kingdom Kids)', 'CHILDREN', 'Age-tailored foundational scripture learning, crafts, choir, and scripture recitation', 'Children (Ages 1-12)')
ON CONFLICT DO NOTHING;
