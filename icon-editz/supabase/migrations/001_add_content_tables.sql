-- Migration: Add content and settings tables
-- Timestamp: {{YYYYMMDDHHMMSS}}
CREATE TABLE homepage_content (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    section TEXT NOT NULL UNIQUE,
    content JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE services (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    sort_order SMALLINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    project_url TEXT,
    sort_order SMALLINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE testimonials (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    author_name TEXT NOT NULL,
    author_role TEXT,
    quote TEXT NOT NULL,
    avatar_url TEXT,
    sort_order SMALLINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE faq (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order SMALLINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    key TEXT NOT NULL UNIQUE,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES FOR NEW TABLES
-- Enable RLS and set up policies allowing public read access but restricting modifications to admins.
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Homepage content is viewable by everyone" ON homepage_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage homepage content" ON homepage_content FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON services FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Admins can manage projects" ON projects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testimonials are viewable by everyone" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQ entries are viewable by everyone" ON faq FOR SELECT USING (true);
CREATE POLICY "Admins can manage FAQ entries" ON faq FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are viewable by everyone" ON settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
