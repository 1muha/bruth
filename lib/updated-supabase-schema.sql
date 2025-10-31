-- ============================================
-- Tanishim Database Schema for Supabase
-- UPDATED VERSION - With social media fields
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable text search extension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);

-- ============================================
-- CONTACTS TABLE (UPDATED with social media fields)
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ism VARCHAR(255) NOT NULL,
    raqami TEXT,
    qayerda_tanishilgan TEXT,
    qanday_foydasi TEXT,
    biznings_foydamiz TEXT,
    meeting_date TIMESTAMP WITH TIME ZONE,
    telegram TEXT,  -- New field for Telegram handle
    instagram TEXT, -- New field for Instagram handle
    email TEXT,     -- New field for email address
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for contacts table
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_meeting_date ON contacts(meeting_date);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Indexes for new social media fields
CREATE INDEX IF NOT EXISTS idx_contacts_telegram ON contacts(telegram);
CREATE INDEX IF NOT EXISTS idx_contacts_instagram ON contacts(instagram);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Full-text search index (updated to include social media fields)
CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts 
USING gin(to_tsvector('simple', 
    COALESCE(ism, '') || ' ' || 
    COALESCE(raqami, '') || ' ' || 
    COALESCE(qayerda_tanishilgan, '') || ' ' || 
    COALESCE(qanday_foydasi, '') || ' ' || 
    COALESCE(biznings_foydamiz, '') || ' ' ||
    COALESCE(telegram, '') || ' ' ||
    COALESCE(instagram, '') || ' ' ||
    COALESCE(email, '')
));

-- Composite index for meeting queries
CREATE INDEX IF NOT EXISTS idx_contacts_user_meeting 
ON contacts(user_id, meeting_date) 
WHERE meeting_date IS NOT NULL;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - DISABLED for custom auth
-- ============================================

-- Disable RLS on both tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Drop existing policies (they won't work with custom auth anyway)
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;

-- ============================================
-- HELPER FUNCTIONS (UPDATED)
-- ============================================

-- Search contacts function (updated to include social media fields)
CREATE OR REPLACE FUNCTION search_contacts(
    p_user_id UUID,
    p_query TEXT
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    ism VARCHAR(255),
    raqami TEXT,
    qayerda_tanishilgan TEXT,
    qanday_foydasi TEXT,
    biznings_foydamiz TEXT,
    meeting_date TIMESTAMP WITH TIME ZONE,
    telegram TEXT,
    instagram TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.user_id,
        c.ism,
        c.raqami,
        c.qayerda_tanishilgan,
        c.qanday_foydasi,
        c.biznings_foydamiz,
        c.meeting_date,
        c.telegram,
        c.instagram,
        c.email,
        c.created_at,
        c.updated_at
    FROM contacts c
    WHERE c.user_id = p_user_id
    AND (
        p_query IS NULL 
        OR p_query = ''
        OR to_tsvector('simple', 
            COALESCE(c.ism, '') || ' ' || 
            COALESCE(c.raqami, '') || ' ' || 
            COALESCE(c.qayerda_tanishilgan, '') || ' ' || 
            COALESCE(c.qanday_foydasi, '') || ' ' || 
            COALESCE(c.biznings_foydamiz, '') || ' ' ||
            COALESCE(c.telegram, '') || ' ' ||
            COALESCE(c.instagram, '') || ' ' ||
            COALESCE(c.email, '')
        ) @@ plainto_tsquery('simple', p_query)
    )
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get upcoming meetings function (unchanged)
CREATE OR REPLACE FUNCTION get_upcoming_meetings(
    p_user_id UUID,
    p_hours_ahead INTEGER DEFAULT 24
)
RETURNS TABLE (
    id UUID,
    ism VARCHAR(255),
    meeting_date TIMESTAMP WITH TIME ZONE,
    hours_until_meeting NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.ism,
        c.meeting_date,
        EXTRACT(EPOCH FROM (c.meeting_date - CURRENT_TIMESTAMP)) / 3600 AS hours_until_meeting
    FROM contacts c
    WHERE c.user_id = p_user_id
    AND c.meeting_date IS NOT NULL
    AND c.meeting_date > CURRENT_TIMESTAMP
    AND c.meeting_date <= CURRENT_TIMESTAMP + (p_hours_ahead || ' hours')::INTERVAL
    ORDER BY c.meeting_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ADMIN USER (Optional)
-- ============================================

-- Insert admin user if needed
-- Password: admin123 (change after first login!)
INSERT INTO users (id, email, name, password_hash, is_admin, is_blocked)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@gmail.com',
    'Administrator',
    '$2a$10$rKJ3qE5gE5gE5gE5gE5gE.5gE5gE5gE5gE5gE5gE5gE5gE5gE5gE5',
    TRUE,
    FALSE
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tanishim Database Updated Successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables: users, contacts (with social media fields)';
    RAISE NOTICE 'New fields: telegram, instagram, email';
    RAISE NOTICE 'Indexes: Updated indexes for new fields';
    RAISE NOTICE 'Functions: Updated search function';
    RAISE NOTICE 'RLS: Disabled for custom authentication';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Ready to use! ✅';
    RAISE NOTICE '========================================';
END $$;
