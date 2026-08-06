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
const isObject = (item) => Boolean(item && typeof item === 'object' && !Array.isArray(item))

const mergeDeep = (source, target) => {
  const result = { ...target }
  for (const key in source) {
    if (isObject(source[key])) {
      if (!result[key]) {
        result[key] = {}
      }
      result[key] = mergeDeep(source[key], result[key])
    } else if (!Object.prototype.hasOwnProperty.call(result, key)) {
      result[key] = source[key]
    }
  }
  return result
}

// --- Upsert Logic for Page Content ---
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
  if (existing?.content && Object.keys(existing.content).length > 0) {
    action = 'UPDATE (merged)'
    finalContent = mergeDeep(content, existing.content)
  }

  const { error: upsertError } = await db
    .from('page_content')
    .upsert(
      { page, section, content: finalContent, status: 'published', sort_order: sortOrder, updated_at: new Date().toISOString() },
      { onConflict: 'page,section', ignoreDuplicates: false }
    )

  if (upsertError) {
    console.error(`🔴 Error upserting section '${section}' for page '${page}':`, upsertError.message)
    throw upsertError
  }
  console.log(`  ✓ ${action}: ${page} -> ${section}`)
}

// --- Data Definitions ---
const pagesToMigrate = {
  'Homepage': [
    ['Hero', defaultSiteContent.hero],
    ['Showreel', defaultSiteContent.showreel],
    ['Featured Services', defaultServicesPage.homeServices],
    ['Services', defaultSiteContent.services],
    ['Featured Projects', { items: projectsData.slice(0, 3), categories: projectCategories.slice(1) }],
    ['Projects', defaultSiteContent.projects],
    ['Featured Products', { items: [] }],
    ['Testimonials', defaultSiteContent.testimonials],
    ['Tools', { items: toolsData }],
    ['FAQ', defaultSiteContent.faq],
    ['CTA', defaultSiteContent.cta],
    ['Site', defaultSiteContent.site],
    ['SEO', { title: 'Icon Editz - Premium Video Editing & Motion Graphics', description: 'Premium visual storytelling by Icon Editz.', canonical: 'https://iconeditz.com/' }],
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
    ['Hero', { eyebrow: 'Projects', heading: 'Featured Projects', description: 'Selected creative work from Icon Editz.', primaryLabel: 'Hire Me', primaryUrl: '/hire' }],
    ['Categories', { items: projectCategories }],
    ['Portfolio', { items: projectsData, categories: projectCategories }],
    ['Projects', { items: projectsData, categories: projectCategories }],
    ['Filters', { items: projectCategories.filter((c) => c !== 'All') }],
    ['CTA', defaultSiteContent.cta],
    ['SEO', { title: 'Projects | Icon Editz', description: 'Browse featured creative work from Icon Editz.' }],
  ],
  'Store Page': [
    ['Hero', { eyebrow: 'Store', heading: 'Premium creative assets', description: 'Templates, edits, presets, and creative tools to elevate your projects.', primaryLabel: 'Browse Products', primaryUrl: '/products' }],
    ['Categories', { items: ['All Assets', 'PSD', 'Wedding Invitation', 'After Effects', 'Premiere Pro', 'Photoshop', 'LUTs', 'Sound Packs'] }],
    ['Featured Products', { items: [] }],
    ['Banner', { heading: 'Premium assets for modern creators', description: 'Use polished templates and assets to launch faster with a polished finish.' }],
    ['FAQ', { items: defaultSiteContent.faq.items }],
    ['CTA', defaultSiteContent.cta],
    ['SEO', { title: 'Store | Icon Editz', description: 'Premium creative assets from Icon Editz.' }],
  ],
  'About Page': [
    ['Hero', { eyebrow: 'About', heading: 'About Icon Editz', description: 'Creative video editing, motion graphics, and visual storytelling.', primaryLabel: 'View Projects', primaryUrl: '/projects', secondaryLabel: 'Hire Me', secondaryUrl: '/hire' }],
    ['Story', { eyebrow: 'Who I am', heading: 'A story-led creative studio', description: 'I turn raw ideas into premium visual storytelling through editing, motion, branding, and creative direction.' }],
    ['About', { heading: 'A story-led creative studio', description: 'I turn raw ideas into premium visual storytelling through editing, motion, branding, and creative direction.' }],
    ['Skills', { items: skillsData.map((item) => ({ id: item.skill.toLowerCase().replace(/\s+/g, '-'), ...item })) }],
    ['Stats', { items: [{ id: 'stat-1', label: 'Lyric Videos', value: '3D' }, { id: 'stat-2', label: 'Projects Done', value: '10+' }, { id: 'stat-3', label: 'Pro Tools', value: '4+' }, { id: 'stat-4', label: 'Creativity', value: '100%' }] }],
    ['Timeline', { items: [{ id: 'timeline-1', year: '2022', title: 'Founded Icon Editz', description: 'Started building a studio around storytelling, motion, and polished digital media.' }, { id: 'timeline-2', year: '2024', title: 'Expanded into branding and motion systems', description: 'Created a broader offering for creators, launches, and premium campaigns.' }] }],
    ['Tools', { items: toolsData }],
    ['CTA', defaultSiteContent.cta],
    ['SEO', { title: 'About | Icon Editz', description: 'Learn more about Icon Editz and the creative story behind the studio.' }],
  ],
  'Hire From Us Page': [
    ['Hero', { eyebrow: 'Hire Icon Editz', heading: 'Let’s create something iconic.', description: 'Tell us your story and we will bring it to life.', primaryLabel: 'Get Started', primaryUrl: '/hire' }],
    ['Services', { items: defaultServicesPage.services.slice(0, 6) }],
    ['Features', { items: defaultServicesPage.features }],
    ['Process', { items: defaultServicesPage.process }],
    ['Enquiry Form', { heading: 'Tell us about your project', description: 'Share your goals, timeline, and the kind of creative support you need.' }],
    ['FAQ', { items: defaultServicesPage.faq }],
    ['CTA', defaultServicesPage.cta],
    ['SEO', { title: 'Hire Icon Editz', description: 'Start your next creative project with Icon Editz.' }],
  ],
}

// --- Main Execution ---
;(async () => {
  try {
    for (const [page, sections] of Object.entries(pagesToMigrate)) {
      console.log(`\nProcessing page: ${page}...`)
      for (const [sortOrder, [section, content]] of sections.entries()) {
        await upsertPageSection(page, section, content, sortOrder)
      }
    }

    // Handle Singletons
    console.log('\nProcessing singletons...')
    const fullFooter = {
      brandName: defaultSiteContent.site.brandName || 'ICON EDITZ',
      description: 'Creative editing, motion, and digital assets.',
      quickLinks: [
        { label: 'Home', url: '/' },
        { label: 'Services', url: '/services' },
        { label: 'Projects', url: '/projects' },
        { label: 'Store', url: '/store' },
        { label: 'Hire', url: '/hire' },
      ],
      socialLinks: {
        instagram: defaultSiteContent.site.instagram,
        linkedin: defaultSiteContent.site.linkedin,
        youtube: defaultSiteContent.site.youtube,
        github: defaultSiteContent.site.github,
      },
      email: defaultSiteContent.site.email,
      backgroundColor: '#0f0a1f',
      accentColor: '#9d5cff',
      copyrightText: defaultSiteContent.site.copyright,
    }

    const { error: footerError } = await db
      .from('footer_content')
      .upsert({ id: true, content: fullFooter, status: 'published', updated_at: new Date().toISOString() }, { onConflict: 'id' })
    if (footerError) throw footerError
    console.log('  ✓ UPSERT: Footer')

    const { error: ctaError } = await db
      .from('cta_content')
      .upsert({ id: true, content: defaultSiteContent.cta, status: 'published', updated_at: new Date().toISOString() }, { onConflict: 'id' })
    if (ctaError) throw ctaError
    console.log('  ✓ UPSERT: CTA Singleton')

    const { error: settingsError } = await db
      .from('settings')
      .upsert({ key: 'site', value: defaultSiteContent.site, status: 'published', updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (settingsError) throw settingsError
    console.log('  ✓ UPSERT: Settings (site)')

    // Global SEO
    await upsertPageSection('Global', 'SEO', { title: 'Icon Editz', description: 'Premium video editing, motion graphics, and creative assets.' }, 0)

    // Populate website_sections for Hire From Us Page
    console.log('\nProcessing website_sections...')
    const websiteSections = [
      { page: 'Hire From Us Page', section_key: 'hero', title: 'Hero', content: pagesToMigrate['Hire From Us Page'].find(([s]) => s === 'Hero')[1], status: 'published', sort_order: 0 },
      { page: 'Hire From Us Page', section_key: 'features', title: 'Features', content: { items: defaultServicesPage.features }, status: 'published', sort_order: 1 },
      { page: 'Hire From Us Page', section_key: 'services', title: 'Services', content: { items: defaultServicesPage.services }, status: 'published', sort_order: 2 },
      { page: 'Hire From Us Page', section_key: 'process', title: 'Process', content: { items: defaultServicesPage.process }, status: 'published', sort_order: 3 },
      { page: 'Hire From Us Page', section_key: 'faq', title: 'FAQ', content: { items: defaultServicesPage.faq }, status: 'published', sort_order: 4 },
      { page: 'Hire From Us Page', section_key: 'cta', title: 'CTA', content: defaultServicesPage.cta, status: 'published', sort_order: 5 },
    ]
    for (const ws of websiteSections) {
      const { error } = await db.from('website_sections').upsert(ws, { onConflict: 'page,section_key' })
      if (error) console.warn(`Website sections notice (${ws.section_key}):`, error.message)
    }

    // Categories collection
    console.log('\nProcessing collection: categories...')
    const categoryCollectionItems = projectCategories.map((c) => ({
      name: c,
      slug: c.toLowerCase().replace(/\s+/g, '-'),
      description: `${c} projects`,
      status: 'published',
    }))
    const { error: catErr } = await db.from('categories').upsert(categoryCollectionItems, { onConflict: 'slug' })
    if (catErr) console.warn('Categories notice:', catErr.message)
    else console.log(`  ✓ UPSERT: ${categoryCollectionItems.length} records into categories`)

    console.log('\n✅ CMS data migration script completed successfully.')
  } catch (error) {
    console.error('\n🔴 CMS data migration failed.', error)
    process.exit(1)
  }
})()
