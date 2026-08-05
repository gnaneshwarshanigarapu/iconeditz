-- 011_add_collection_tables.sql

-- Create the 'projects' table
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT PRIMARY KEY,
    title TEXT,
    category TEXT,
    "videoUrl" TEXT,
    accent TEXT,
    description TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the 'tools' table
CREATE TABLE IF NOT EXISTS tools (
    id BIGINT PRIMARY KEY,
    name TEXT,
    icon TEXT,
    description TEXT,
    proficiency INTEGER,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the 'skills' table
CREATE TABLE IF NOT EXISTS skills (
    name TEXT PRIMARY KEY,
    level INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tools" ON tools FOR SELECT USING (true);
CREATE-POLICY "Allow public read access to skills" ON skills FOR SELECT USING (true);
