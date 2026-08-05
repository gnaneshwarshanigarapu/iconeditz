/*
This script is a new version of the CMS seeding script.
It uses a relational data model to store the CMS content.

The new database schema is as follows:

-- Pages Table: Stores the pages of the website
CREATE TABLE pages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sections Table: Stores the sections of each page
CREATE TABLE sections (
  id SERIAL PRIMARY KEY,
  page_id INTEGER REFERENCES pages(id),
  name VARCHAR(255) NOT NULL,
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, name)
);

-- Content Items Table: A generic table to store content items for each section
-- This is a simplified approach. A better approach would be to have separate tables for each content type.
-- For this iteration, I will use a JSONB column to store the data.
CREATE TABLE content_items (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES sections(id),
  sort_order INTEGER,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Separate tables for each content type (The better approach)

-- services
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  features TEXT[],
  price VARCHAR(255),
  delivery VARCHAR(255),
  best_for VARCHAR(255),
  icon VARCHAR(255),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  video_url VARCHAR(255),
  accent VARCHAR(255),
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- tools
CREATE TABLE tools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(255),
  description TEXT,
  proficiency INTEGER,
  color VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- skills
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  skill VARCHAR(255) NOT NULL,
  level INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- testimonials
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  review TEXT,
  rating INTEGER,
  image VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- faq_items
CREATE TABLE faq_items (
  id SERIAL PRIMARY KEY,
  page VARCHAR(255), -- e.g., 'Services', 'About'
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- And so on for other content types like features, industries, packages...

For the sake of this exercise, I will use the "Separate tables for each content type" approach as it's more scalable.
I will generate the CREATE TABLE statements for the main content types.
The user should run these SQL commands in their Supabase project.

*/

import dotenv from 'dotenv'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

// Import all data sources
import { defaultSiteContent } from '../src/data/defaultSiteContent.js'
import { defaultServicesPage } from '../src/data/defaultServicesPage.js'
import { projectsData, categories as projectCategories } from '../src/data/projects.js'
import { toolsData, skillsData } from '../src/data/tools.js'

console.info('Starting NEW CMS data migration...')

// --- Environment and DB Setup ---
const envPath = path.resolve(process.cwd(), 'icon-editz', '.env')
dotenv.config({ path: envPath, quiet: true })

const configuredUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
const url = configuredUrl?.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')

if (!configuredUrl || !serviceKey) {
  console.error('🔴 Missing Supabase URL or Service Key. Check your .env file.')
  process.exit(1)
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } })
console.log('✅ Supabase client created.')

const run = async () => {
  // Clear all data
  console.log('Clearing existing data...')
  await db.from('services').delete().neq('id', 0)
  await db.from('projects').delete().neq('id', 0)
  await db.from('categories').delete().neq('id', 0)
  /*
    await db.from('tools').delete().neq('id', 0)
    await db.from('skills').delete().neq('id', 0)
    await db.from('faq_items').delete().neq('id', 0)
    */
  await db.from('faq_items').delete().neq('id', 0)
  // Add other tables here to clear...

  console.log('Seeding new data...')

  // Seed services
  const { error: servicesError } = await db.from('services').insert(defaultServicesPage.services.map(s => ({
    slug: s.id,
    title: s.title,
    description: s.description,
    price: s.price
  })))
  if (servicesError) console.error('Error seeding services:', servicesError)

  // Seed projects and categories
  const { error: categoriesError } = await db.from('categories').insert(projectCategories.map(c => ({ name: c, slug: c.toLowerCase().replace(/\s+/g, '-') })))
  if (categoriesError) console.error('Error seeding project categories:', categoriesError)

  const { error: projectsError } = await db.from('projects').insert(projectsData.map(p => ({
    title: p.title,
    video_url: p.videoUrl,
    description: p.description,
    tags: p.tags
  })))
  if (projectsError) console.error('Error seeding projects:', projectsError)

  /*
  // Seed tools
  const { error: toolsError } = await db.from('tools').insert(toolsData.map(t => ({
    name: t.name,
    icon: t.icon,
    description: t.description,
    proficiency: t.proficiency,
    color: t.color
  })))
  if (toolsError) console.error('Error seeding tools:', toolsError)

  // Seed skills
  const { error: skillsError } = await db.from('skills').insert(skillsData.map(s => ({
    skill: s.skill,
    level: s.level
  })))
  if (skillsError) console.error('Error seeding skills:', skillsError)
  */

  // Seed testimonials
  const { error: testimonialsError } = await db.from('testimonials').insert(defaultSiteContent.testimonials.items.map(t => ({
    name: t.name,
    review: t.review,
    rating: t.rating
  })))
  if (testimonialsError) console.error('Error seeding testimonials:', testimonialsError)

  /*
  // Seed FAQ items
  const { error: faqError } = await db.from('faq_items').insert(defaultSiteContent.faq.items.map(f => ({
    page: 'Homepage',
    question: f.question,
    answer: f.answer
  })))
  if (faqError) console.error('Error seeding homepage faq:', faqError)

  const { error: servicesFaqError } = await db.from('faq_items').insert(defaultServicesPage.faq.map(f => ({
    page: 'Services',
    question: f.question,
    answer: f.answer
  })))
  if (servicesFaqError) console.error('Error seeding services faq:', servicesFaqError)
  */

  console.log('✅ NEW CMS data migration script completed successfully.')
}

run().catch(err => {
  console.error('🔴 NEW CMS data migration failed.', err)
  process.exit(1)
})
