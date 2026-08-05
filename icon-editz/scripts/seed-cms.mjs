import dotenv from 'dotenv'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { defaultSiteContent } from '../src/data/defaultSiteContent.js'
import { defaultServicesPage } from '../src/data/defaultServicesPage.js'
import { projectsData, categories } from '../src/data/projects.js'
import { toolsData, skillsData } from '../src/data/tools.js'

console.info('Starting CMS migration for Services Page...')

const envPath = path.resolve(process.cwd(), '.env')
dotenv.config({ path: envPath, quiet: true })

const configuredUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
const url = configuredUrl?.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')

if (!configuredUrl || !serviceKey) {
  console.error('Missing Supabase URL or Service Key. Check your .env file.')
  process.exit(1)
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } })

const upsertPageSection = async (page, section, content, sortOrder) => {
  // First, fetch the existing record
  const { data: existingRecord, error: fetchError } = await db
    .from('page_content')
    .select('content')
    .eq('page', page)
    .eq('section', section)
    .maybeSingle()

  if (fetchError) {
    console.error(`Error fetching section ${section} for page ${page}:`, fetchError)
    throw fetchError
  }

  let finalContent = content
  if (existingRecord && existingRecord.content) {
    // If a record exists, merge, giving precedence to existing (database) values
    // This is a deep merge
    const mergeDeep = (target, source) => {
      const output = { ...target }
      if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
          if (isObject(source[key])) {
            if (!(key in target))
              Object.assign(output, { [key]: source[key] });
            else
              output[key] = mergeDeep(target[key], source[key]);
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    }
    // The user wants to update only missing fields, which implies the default data should fill in gaps.
    // The database is the master. So, default content is the target, existing content is the source.
    finalContent = mergeDeep(content, existingRecord.content);
  }

  const { error } = await db.from('page_content').upsert(
    { page, section, content: finalContent, status: 'published', sort_order: sortOrder },
    { onConflict: 'page,section', ignoreDuplicates: false }
  )

  if (error) {
    console.error(`Error upserting section ${section} for page ${page}:`, error)
    throw error
  }
  console.log(`✓ Successfully upserted section: ${section}`)
}

const isObject = (item) => {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// Define only the Services Page sections
const servicesPageSections = [
    ['Hero', defaultServicesPage.hero],
    ['Services', { ...defaultServicesPage.services }],
    ['Process', { items: defaultServicesPage.process }],
    ['Features', { items: defaultServicesPage.features }],
    ['Industries', { items: defaultServicesPage.industries }],
    ['Software', { items: defaultServicesPage.software }],
    ['Pricing', { items: defaultServicesPage.packages }],
    ['FAQ', { items: defaultServicesPage.faq }],
    ['Testimonials', { items: defaultServicesPage.testimonials }],
    ['CTA', defaultServicesPage.cta],
    ['SEO', { title: 'Services | Icon Editz', description: defaultServicesPage.hero.description }],
]

const migrateServicesPage = async () => {
    console.log('Migrating "Services Page"...')
    for (const [sortOrder, [section, content]] of servicesPageSections.entries()) {
        await upsertPageSection('Services Page', section, content, sortOrder)
    }
    console.log('✓ "Services Page" migration complete.')
}


// Adding all sections for services page.
const migrateAllSections = async () => {
  console.log('Migrating all sections for "Services Page"...');

  const allSections = [
    ...defaultServicesPage.services.map(s => ['Service', s]),
    ...defaultServicesPage.process.map(p => ['Process', p]),
    ...defaultServicesPage.features.map(f => ['Feature', f]),
    ...defaultServicesPage.industries.map(i => ['Industry', i]),
    ...defaultServicesPage.software.map(s => ['Software', s]),
    ...defaultServicesPage.packages.map(p => ['Package', p]),
    ...defaultServicesPage.faq.map(f => ['FAQ', f]),
    ...defaultServicesPage.testimonials.map(t => ['Testimonial', t]),
  ];

  for (const [sortOrder, [section, content]] of allSections.entries()) {
    await upsertPageSection('Services Page', section, content, sortOrder);
  }
};


(async () => {
  try {
    await migrateServicesPage()
    await migrateAllSections()
    console.info('CMS seed for Services Page completed successfully.')
  } catch (error) {
    console.error('CMS seed for Services Page failed.', error.message)
    process.exit(1)
  }
})()
