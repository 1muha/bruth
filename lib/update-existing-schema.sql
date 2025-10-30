-- ============================================
-- UPDATE SCRIPT FOR EXISTING TANISHIM DATABASE
-- Adds social media fields to contacts table
-- ============================================

-- Add new columns to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS telegram TEXT;

ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS instagram TEXT;

ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_contacts_telegram ON contacts(telegram);
CREATE INDEX IF NOT EXISTS idx_contacts_instagram ON contacts(instagram);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Update the full-text search index to include social media fields
DROP INDEX IF EXISTS idx_contacts_search;

CREATE INDEX idx_contacts_search ON contacts 
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

-- Update the search_contacts function to include new fields
DROP FUNCTION IF EXISTS search_contacts(UUID, TEXT);

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

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tanishim Database Updated Successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Added new fields: telegram, instagram, email';
    RAISE NOTICE 'Updated search functionality';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Ready to use! ✅';
    RAISE NOTICE '========================================';
END $$;