import dotenv from 'dotenv'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { defaultSiteContent } from '../src/data/defaultSiteContent.js'
import { defaultServicesPage } from '../src/data/defaultServicesPage.js'
import { projectsData, categories } from '../src/data/projects.js'
import { toolsData, skillsData } from '../src/data/tools.js'

const envPath = path.resolve(process.cwd(), '.env')
const dotenvResult = dotenv.config({ path: envPath, quiet: true })
const configuredUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
const url = configuredUrl?.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')

const expectedEnvironment = 'Missing required environment variables.\n\nExpected .env:\n\nSUPABASE_URL=https://your-project.supabase.co\n\nSUPABASE_SERVICE_ROLE_KEY=your_service_role_key'
const validateEnvironment = ({ checkOnly = false } = {}) => {
  if (dotenvResult.error?.code === 'ENOENT') { console.error(expectedEnvironment); return false }
  if (!configuredUrl || !serviceKey) {
    const missing = [!configuredUrl && 'SUPABASE_URL (or VITE_SUPABASE_URL)', !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)'].filter(Boolean)
    console.error(`${expectedEnvironment}\n\nMissing: ${missing.join(', ')}`)
    return false
  }
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co')) throw new Error('invalid URL')
  } catch {
    console.error('Missing required environment variables. SUPABASE_URL must be a valid https://your-project.supabase.co URL.')
    return false
  }
  if (checkOnly) {
    console.info('✓ .env found')
    console.info('✓ SUPABASE_URL loaded')
    console.info('✓ SUPABASE_SERVICE_ROLE_KEY loaded')
  } else {
    console.info('✓ Supabase URL loaded')
    console.info('✓ Service Role Key loaded')
  }
  return true
}

const checkOnly = process.argv.includes('--check')
if (!validateEnvironment({ checkOnly })) process.exit(1)
if (checkOnly) process.exit(0)
const db = createClient(url, serviceKey, { auth: { persistSession: false } })
const isEmpty = (value) => !value || (typeof value === 'object' && Object.keys(value).length === 0)
const upsertPageSection = async (page, section, content, sortOrder) => {
  const { error } = await db.from('page_content').upsert({ page, section, content, status: 'published', sort_order: sortOrder }, { onConflict: 'page,section' })
  if (error) throw error
}

const homepage = [
  ['Hero', defaultSiteContent.hero], ['Showreel', defaultSiteContent.showreel], ['Services', defaultSiteContent.services], ['Projects', defaultSiteContent.projects],
  ['Tools', defaultSiteContent.tools], ['Testimonials', defaultSiteContent.testimonials], ['FAQ', defaultSiteContent.faq], ['CTA', defaultSiteContent.cta], ['Site', defaultSiteContent.site],
  ['Featured Services', defaultServicesPage.homeServices], ['Featured Projects', { items: projectsData.slice(0, 3), categories }], ['Featured Products', { items: [] }],
  ['SEO', { title: 'Icon Editz - Premium Video Editing & Motion Graphics', description: 'Premium video editing, motion graphics, and creative storytelling by Icon Editz.', canonical: 'https://iconeditz.com/' }],
]
const pages = [
  ['Homepage', homepage],
  ['Services Page', [
    ['Hero', defaultServicesPage.hero],
    ['Services', { items: defaultServicesPage.services, visible: true, published: true }],
    ['Pricing', { items: defaultServicesPage.packages }],
    ['FAQ', { items: defaultServicesPage.faq }],
    ['Testimonials', { items: defaultServicesPage.testimonials }],
    ['CTA', defaultServicesPage.cta],
    ['SEO', { title: 'Services | Icon Editz', description: defaultServicesPage.hero.description }],
  ]],
  ['Projects Page', [
    ['Hero', { eyebrow: 'Projects', heading: 'Featured Projects', description: 'Selected creative work from Icon Editz.', primaryLabel: 'Hire Me', primaryUrl: '/hire' }],
    ['Categories', { items: categories }],
    ['Projects', { items: projectsData, categories }],
    ['Portfolio', { items: projectsData, categories }],
    ['Filters', { items: categories.slice(1) }],
    ['CTA', defaultSiteContent.cta],
    ['SEO', { title: 'Projects | Icon Editz', description: 'Browse featured creative work from Icon Editz.' }],
  ]],
  ['About Page', [
    ['Hero', { eyebrow: 'About', heading: 'About Icon Editz', description: 'Creative video editing, motion graphics, and visual storytelling.', primaryLabel: 'View Projects', primaryUrl: '/projects', secondaryLabel: 'Hire Me', secondaryUrl: '/hire' }],
    ['Story', { eyebrow: 'Who I am', heading: 'A story-led creative studio', description: 'I turn raw ideas into premium visual storytelling through editing, motion, branding, and creative direction.' }],
    ['Stats', { items: [{ id: 'stat-1', label: 'Lyric Videos', value: '3D' }, { id: 'stat-2', label: 'Projects Done', value: '10+' }, { id: 'stat-3', label: 'Pro Tools', value: '4+' }, { id: 'stat-4', label: 'Creativity', value: '100%' }] }],
    ['Skills', { items: skillsData.map((item) => ({ id: item.skill.toLowerCase().replace(/\s+/g, '-'), ...item })) }],
    ['Timeline', { items: [{ id: 'timeline-1', year: '2022', title: 'Founded Icon Editz', description: 'Started building a studio around storytelling, motion, and polished digital media.' }, { id: 'timeline-2', year: '2024', title: 'Expanded into branding and motion systems', description: 'Created a broader offering for creators, launches, and premium campaigns.' }] }],
    ['Tools', { items: toolsData }],
    ['CTA', defaultSiteContent.cta],
    ['SEO', { title: 'About | Icon Editz', description: 'Learn more about Icon Editz and the creative story behind the studio.' }],
  ]],
  ['Store Page', [
    ['Hero', { eyebrow: 'Store', heading: 'Premium creative assets', description: 'Templates, edits, presets, and creative tools built to make your next project stand out.', primaryLabel: 'Browse Products', primaryUrl: '/products' }],
    ['Categories', { items: ['All Assets', 'PSD', 'Wedding Invitation', 'After Effects', 'Premiere Pro', 'Photoshop', 'LUTs', 'Sound Packs'] }],
    ['Featured Products', { items: [] }],
    ['Banner', { heading: 'Premium assets for modern creators', description: 'Use polished templates and assets to launch faster with a polished finish.' }],
    ['SEO', { title: 'Store | Icon Editz', description: 'Premium creative assets from Icon Editz.' }],
  ]],
  ['Hire From Us Page', [
    ['Hero', { eyebrow: 'Hire Icon Editz', heading: 'Let’s create something iconic.', description: 'Tell us your story and we will bring it to life.', primaryLabel: 'Get Started', primaryUrl: '/hire' }],
    ['Features', { items: defaultServicesPage.features.slice(0, 6).map((feature, index) => ({ id: feature.id || `feature-${index}`, ...feature })) }],
    ['Enquiry Form', { heading: 'Tell us about your project', description: 'Share your goals, timeline, and the kind of creative support you need.' }],
    ['CTA', defaultServicesPage.cta],
    ['SEO', { title: 'Hire Icon Editz', description: 'Start your next creative project with Icon Editz.' }],
  ]],
]

for (const [page, sections] of pages) {
  for (const [sortOrder, [section, content]] of sections.entries()) {
    await upsertPageSection(page, section, content, sortOrder)
  }
}

for (const [table, content] of [['footer_content', { brandName: defaultSiteContent.site.brandName, description: 'Creative editing, motion, and digital assets.', socialLinks: { instagram: defaultSiteContent.site.instagram, linkedin: defaultSiteContent.site.linkedin, youtube: defaultSiteContent.site.youtube }, email: defaultSiteContent.site.email, backgroundColor: '#0f0a1f', accentColor: '#9d5cff', copyrightText: defaultSiteContent.site.copyright }], ['cta_content', defaultSiteContent.cta]]) {
  const { error } = await db.from(table).upsert({ id: true, content, status: 'published' }, { onConflict: 'id' })
  if (error) throw error
}

const { data: settings, error: settingsError } = await db.from('settings').select('id,value').eq('key', 'site').maybeSingle()
if (settingsError) throw settingsError
if (settings && isEmpty(settings.value)) { const { error } = await db.from('settings').update({ value: defaultSiteContent.site }).eq('id', settings.id); if (error) throw error }
console.info(`CMS seed completed for ${pages.length} page groups`)
