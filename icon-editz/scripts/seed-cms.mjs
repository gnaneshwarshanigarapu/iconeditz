import dotenv from 'dotenv'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

// Import all data sources
import { defaultSiteContent } from '../src/data/defaultSiteContent.js'
import { defaultServicesPage } from '../src/data/defaultServicesPage.js'
import { projectsData, categories as projectCategories } from '../src/data/projects.js'
import { toolsData, skillsData } from '../src/data/tools.js'

console.info('Starting comprehensive CMS data migration...')

// --- Environment and DB Setup ---
const envPath = path.resolve(process.cwd(), '.env')
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

// --- Deep Merge Utility ---
const isObject = (item) => (item && typeof item === 'object' && !Array.isArray(item))

const mergeDeep = (source, target) => { // source is from file, target is from DB
  for (const key in source) {
    if (isObject(source[key])) {
      if (!target[key]) {
        Object.assign(target, { [key]: {} });
      }
      mergeDeep(source[key], target[key]);
    } else {
      if (!target.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
}


// --- Upsert Logic ---
const upsertPageSection = async (page, section, content, sortOrder) => {
  const { data: existing, error: fetchError } = await db
    .from('page_content')
    .select('content')
    .eq('page', page)
    .eq('section', section)
    .maybeSingle()

  if (fetchError) {
    console.error(`🔴 Error fetching section '${section}' for page '${page}':`, fetchError.message)
    throw fetchError
  }

  let finalContent = content
  let action = 'INSERT'
  if (existing?.content) {
    action = 'UPDATE (merged)'
    finalContent = mergeDeep(content, existing.content) // Add missing fields from file to DB content
  }

  const { error: upsertError } = await db
    .from('page_content')
    .upsert(
      { page, section, content: finalContent, status: 'published', sort_order: sortOrder },
      { onConflict: 'page,section', ignoreDuplicates: false }
    )

  if (upsertError) {
    console.error(`🔴 Error upserting section '${section}' for page '${page}':`, upsertError.message)
    throw upsertError
  }
  console.log(`  ✓ ${action}: ${page} -> ${section}`)
}

const upsertCollection = async (tableName, data, conflictColumn = 'id') => {
    console.log(`
Processing collection: ${tableName}...`);
    const { error } = await db.from(tableName).upsert(data, { onConflict: conflictColumn, ignoreDuplicates: false });
    if (error) {
      console.error(`🔴 Error upserting collection '${tableName}':`, error.message);
      throw error;
    }
    console.log(`  ✓ UPSERT: ${data.length} records into ${tableName}`);
};

// --- Data Definitions ---
const pagesToMigrate = {
  'Homepage': [
    ['Hero', defaultSiteContent.hero],
    ['Featured Services', defaultServicesPage.homeServices],
    ['Featured Projects', { items: projectsData.slice(0, 3) }],
    ['Featured Products', { items: [] }], // Assuming no featured products initially
    ['Testimonials', defaultSiteContent.testimonials],
    ['Tools', {items: toolsData}],
    ['CTA', defaultSiteContent.cta],
    ['SEO', { title: 'Icon Editz - Premium Video Editing & Motion Graphics', description: 'Premium visual storytelling by Icon Editz.' }],
  ],
  'Services Page': [
    ['Hero', defaultServicesPage.hero],
    ['Services', { items: defaultServicesPage.services }],
    ['Process', { items: defaultServicesPage.process }],
    ['Features', { items: defaultServicesPage.features }],
    ['Industries', { items: defaultServicesPage.industries }],
    ['Software', { items: defaultServicesPage.software }],
    ['Pricing', { items: defaultServicesPage.packages }],
    ['FAQ', { items: defaultServicesPage.faq }],
    ['Testimonials', { items: defaultServicesPage.testimonials }],
    ['CTA', defaultServicesPage.cta],
    ['SEO', { title: 'Services | Icon Editz', description: defaultServicesPage.hero.description }],
  ],
  'Projects Page': [
      ['Hero', { eyebrow: 'Projects', heading: 'Featured Projects', description: 'Selected creative work from Icon Editz.'}],
      ['Categories', { items: projectCategories }],
      ['Portfolio', { items: projectsData }],
      ['Filters', { items: projectCategories.filter(c => c !== 'All') }],
      ['CTA', defaultSiteContent.cta],
      ['SEO', { title: 'Projects | Icon Editz', description: 'Browse featured creative work from Icon Editz.' }]
  ],
  'Store Page': [
      ['Hero', { eyebrow: 'Store', heading: 'Premium creative assets', description: 'Templates, edits, presets, and creative tools to elevate your projects.' }],
      ['Categories', { items: ['All Assets', 'PSD', 'Wedding Invitation', 'After Effects', 'Premiere Pro', 'Photoshop', 'LUTs', 'Sound Packs']}],
      ['Featured Products', { items: [] }],
      ['FAQ', { items: defaultSiteContent.faq.items }],
      ['CTA', defaultSiteContent.cta],
      ['SEO', { title: 'Store | Icon Editz', description: 'Premium creative assets from Icon Editz.' }]
  ],
  'About Page': [
      ['Hero', { eyebrow: 'About', heading: 'About Icon Editz', description: 'Creative video editing, motion graphics, and visual storytelling.' }],
      ['About', { heading: 'A story-led creative studio', description: 'I turn raw ideas into premium visual storytelling through editing, motion, branding, and creative direction.' }],
      ['Skills', { items: skillsData }],
      ['Stats', { items: [{ id: 'stat-1', label: 'Lyric Videos', value: '3D' }, { id: 'stat-2', label: 'Projects Done', value: '10+' }, { id: 'stat-3', label: 'Pro Tools', value: '4+' }, { id: 'stat-4', label: 'Creativity', value: '100%' }] }],
      ['Timeline', { items: [{ id: 'timeline-1', year: '2022', title: 'Founded Icon Editz', description: 'Started building a studio around storytelling, motion, and polished digital media.' }, { id: 'timeline-2', year: '2024', title: 'Expanded into branding and motion systems', description: 'Created a broader offering for creators, launches, and premium campaigns.' }] }],
      ['CTA', defaultSiteContent.cta],
      ['SEO', { title: 'About | Icon Editz', description: 'Learn more about Icon Editz and the creative story behind the studio.' }]
  ],
  'Hire From Us Page': [ // Mapped to 'Hire'
      ['Hero', { eyebrow: 'Hire Icon Editz', heading: 'Let’s create something iconic.', description: 'Tell us your story and we will bring it to life.' }],
      ['Services', { items: defaultServicesPage.services.slice(0, 6) }], // Subset of services
      ['Process', { items: defaultServicesPage.process }],
      ['FAQ', { items: defaultServicesPage.faq }],
      ['CTA', defaultServicesPage.cta],
      ['SEO', { title: 'Hire Icon Editz', description: 'Start your next creative project with Icon Editz.' }]
  ]
};

// --- Main Execution ---
(async () => {
  try {
    for (const [page, sections] of Object.entries(pagesToMigrate)) {
      console.log(`
Processing page: ${page}...`)
      for (const [sortOrder, [section, content]] of sections.entries()) {
        await upsertPageSection(page, section, content, sortOrder)
      }
    }

    // Handle Singletons
    console.log('
Processing singletons...')
    const { error: footerError } = await db.from('footer_content').upsert({ id: true, content: defaultSiteContent.site, status: 'published' }, { onConflict: 'id' });
    if (footerError) throw footerError;
    console.log('  ✓ UPSERT: Footer');

    const { error: settingsError } = await db.from('settings').upsert({ key: 'site', value: defaultSiteContent.site }, { onConflict: 'key' });
    if (settingsError) throw settingsError;
    console.log('  ✓ UPSERT: Settings (site)');
    
    // For global SEO, maybe we add a 'Global' page with an 'SEO' section
    await upsertPageSection('Global', 'SEO', { title: 'Icon Editz', description: 'Premium video editing, motion graphics, and creative assets.' }, 0);
    
    // --- Seed Collections ---
    await upsertCollection('projects', projectsData);
    await upsertCollection('tools', toolsData);
    await upsertCollection('skills', skillsData.map(s => ({ name: s.skill, level: s.level })), 'name');


    console.log('
✅ CMS data migration script completed successfully.')
  } catch (error) {
    console.error('
🔴 CMS data migration failed.', error)
    process.exit(1)
  }
})()
