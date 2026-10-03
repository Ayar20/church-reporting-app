-- ==============================================================================
-- CHRIST FAMILY CENTRE MAKURDI - CHURCH REPORTING SYSTEM
-- NEON POSTGRESQL SCHEMA & INITIAL SEED DATA
-- (Compatible with Neon Serverless Postgres)
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Enums for Roles, Statuses, and Service Types
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
    zone VARCHAR(100) NOT NULL, -- e.g. 'Wurukum', 'High-Level', 'North-Bank', 'Kanshio', etc.
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
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ministry Fellowships
CREATE TABLE IF NOT EXISTS ministry_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    target_audience VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Users / Profiles Directory (Standalone table for Neon DB)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    equipment_status TEXT,
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

-- 7. Sunday General Service Attendance (Consolidated)
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

-- 8. Seed Initial Church Units
INSERT INTO c3_centres (name, zone, meeting_address, host_name) VALUES
    ('Nyiman C3', 'Nyiman', 'Off Abu King Shuluwa Road, Nyiman Layout, Makurdi', 'Bro. Terungwa Aondo'),
    ('George Akume Way C3', 'George Akume Way', 'Near New Garage Junction, George Akume Way, Makurdi', 'Sis. Deborah Iorhemen'),
    ('North Bank C3', 'North Bank', 'Near University of Agriculture Road, North Bank, Makurdi', 'Bro. Emmanuel Agbo'),
    ('Gyado Villa C3', 'Gyado Villa', 'Beside Benue State University 2nd Gate, Gyado Villa, Makurdi', 'Elder Peter Ochigbo'),
    ('Welfare Quarters C3', 'Welfare Quarters', 'Welfare Quarters Road, Near Civil Service Commission, Makurdi', 'Deaconess Comfort Chia'),
    ('Old GRA C3', 'Old GRA', 'Kashim Ibrahim Road, Old GRA, Makurdi', 'Bro. Joshua Terver')
ON CONFLICT DO NOTHING;

INSERT INTO service_teams (name, code, description) VALUES
    ('Prayer & Counselling', 'PRAYER', 'Pre-service intercession, prayer cover for services, follow-up counselling and deliverance ministry'),
    ('Music', 'MUSIC', 'Praise, prophetic worship and choir leading the atmosphere of the Holy Spirit during all services'),
    ('Production', 'PRODUCTION', 'Sound engineering, acoustics, live multi-camera broadcast, lighting, LED screens and podcasts'),
    ('Welfare', 'WELFARE', 'Hospitality to first timers, benevolence support to members, food pantry, and visitation care'),
    ('Ushering & Protocol', 'USHERS', 'Sanctuary seating, welcoming congregants, offering coordination, and guest ministers reception'),
    ('Sanctuary Keepers', 'SANCTUARY', 'Beautification, cleanliness, and ambiance of the church auditorium and church facility'),
    ('Traffic & Security', 'SECURITY', 'Vehicle parking management, perimeter security, surveillance, and safe congregation dispersal')
ON CONFLICT DO NOTHING;

INSERT INTO ministry_teams (name, code, description, target_audience) VALUES
    ('Men of Faith Fellowship', 'MEN', 'Empowerment, spiritual mentorship, and leadership for Christian fathers and men', 'Men'),
    ('31st Ladies Fellowship', 'LADIES', 'Virtuous women ministry, home builders, spiritual retreats, and maternal care', 'Women'),
    ('Children''s Church (Kingdom Kids)', 'CHILDREN', 'Age-tailored foundational scripture learning, crafts, choir, and scripture recitation', 'Children (Ages 1-12)')
ON CONFLICT DO NOTHING;
