-- Migration: Create tables for the "Hire From Us" page CMS
-- Timestamp: {{YYYYMMDDHHMMSS}}

-- 1. Main content table for static sections
CREATE TABLE hire_us_content (
    section TEXT PRIMARY KEY,
    content JSONB,
    published_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE hire_us_content IS 'Stores content for the various sections of the "Hire From Us" page. One row per section.';
COMMENT ON COLUMN hire_us_content.section IS 'The unique identifier for the page section (e.g., "hero", "enquiry_form").';
COMMENT ON COLUMN hire_us_content.content IS 'The JSON object containing all editable fields for that section.';

-- 2. Table for dynamic "Feature Cards"
CREATE TABLE hire_us_features (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order SMALLINT DEFAULT 0,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE hire_us_features IS 'Stores individual feature cards for the "Hire From Us" page.';

-- 3. Table for dynamic "Services" offered
CREATE TABLE hire_us_services (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    description TEXT,
    image_path TEXT, -- Path in Supabase Storage
    sort_order SMALLINT DEFAULT 0,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE hire_us_services IS 'Stores services listed on the "Hire From Us" page.';

-- 4. Table for the dynamic "Gallery"
CREATE TABLE hire_us_gallery_items (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT,
    file_path TEXT NOT NULL, -- Path in Supabase Storage
    type TEXT NOT NULL, -- 'image' or 'video'
    sort_order SMALLINT DEFAULT 0,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE hire_us_gallery_items IS 'Stores images and videos for the gallery on the "Hire From Us" page.';

-- 5. Table for dynamic "FAQ" items
CREATE TABLE hire_us_faq_items (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order SMALLINT DEFAULT 0,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE hire_us_faq_items IS 'Stores FAQ question-answer pairs for the "Hire From Us" page.';


-- RLS POLICIES FOR NEW "HIRE FROM US" TABLES

-- is_admin function should already exist from previous migrations.

-- hire_us_content
ALTER TABLE hire_us_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hire Us content is viewable by everyone" ON hire_us_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage Hire Us content" ON hire_us_content FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- hire_us_features
ALTER TABLE hire_us_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hire Us features are viewable by everyone" ON hire_us_features FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage Hire Us features" ON hire_us_features FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- hire_us_services
ALTER TABLE hire_us_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hire Us services are viewable by everyone" ON hire_us_services FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage Hire Us services" ON hire_us_services FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- hire_us_gallery_items
ALTER TABLE hire_us_gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hire Us gallery is viewable by everyone" ON hire_us_gallery_items FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage Hire Us gallery" ON hire_us_gallery_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- hire_us_faq_items
ALTER TABLE hire_us_faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hire Us FAQs are viewable by everyone" ON hire_us_faq_items FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage Hire Us FAQs" ON hire_us_faq_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
