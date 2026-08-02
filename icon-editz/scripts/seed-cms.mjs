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
  ['Hero', defaultSiteContent.hero], ['Showreel', defaultSiteContent.showreel], ['Services', defaultSiteContent.services],
  ['Projects', defaultSiteContent.projects], ['Tools', defaultSiteContent.tools], ['Testimonials', defaultSiteContent.testimonials],
  ['FAQ', defaultSiteContent.faq], ['CTA', defaultSiteContent.cta], ['Site', defaultSiteContent.site],
  ['Featured Services', defaultServicesPage.homeServices], ['Featured Projects', { items: projectsData.filter((_, index) => index < 3), categories }],
  ['Featured Products', { items: [] }], ['SEO', { title: 'Icon Editz - Premium Video Editing & Motion Graphics', description: 'Premium video editing, motion graphics, and creative storytelling by Icon Editz.', canonical: 'https://iconeditz.com/' }],
]
const pages = [
  ['Homepage', homepage],
  ['Services Page', [['Services', defaultServicesPage], ['Hero', defaultServicesPage.hero], ['Featured Services', defaultServicesPage.homeServices], ['SEO', { title: 'Services | Icon Editz', description: defaultServicesPage.hero.description }]]],
  ['Projects Page', [['Projects', { items: projectsData, categories }], ['Hero', { eyebrow: 'Projects', heading: 'Featured Projects', description: 'Selected creative work from Icon Editz.' }], ['SEO', { title: 'Projects | Icon Editz', description: 'Browse featured creative work from Icon Editz.' }]]],
  ['About Page', [['Tools', { items: toolsData }], ['Skills', { items: skillsData }], ['Hero', { eyebrow: 'About', heading: 'About Icon Editz', description: 'Creative video editing, motion graphics, and visual storytelling.' }], ['SEO', { title: 'About | Icon Editz', description: 'Learn more about Icon Editz.' }]]],
  ['Store Page', [['Hero', { eyebrow: 'Store', heading: 'Premium creative assets', description: 'Templates, edits, presets, and creative tools built to make your next project stand out.' }], ['Featured Products', { items: [] }], ['SEO', { title: 'Store | Icon Editz', description: 'Premium creative assets from Icon Editz.' }]]],
  ['Hire From Us', [['Hero', { eyebrow: 'Hire Icon Editz', heading: 'Let’s create something iconic.', description: 'Tell us your story and we will bring it to life.' }], ['SEO', { title: 'Hire Icon Editz', description: 'Start your next creative project with Icon Editz.' }]]],
]

for (const [page, sections] of pages) {
  for (const [sortOrder, [section, content]] of sections.entries()) {
    await upsertPageSection(page, section, content, sortOrder)
  }
}

for (const [table, content] of [['footer_content', { brandName: defaultSiteContent.site.brandName, description: 'Creative editing, motion, and digital assets.', socialLinks: { instagram: defaultSiteContent.site.instagram, linkedin: defaultSiteContent.site.linkedin, youtube: defaultSiteContent.site.youtube }, email: defaultSiteContent.site.email, copyrightText: defaultSiteContent.site.copyright }], ['cta_content', defaultSiteContent.cta]]) {
  const { error } = await db.from(table).upsert({ id: true, content, status: 'published' }, { onConflict: 'id' })
  if (error) throw error
}

const { data: settings, error: settingsError } = await db.from('settings').select('id,value').eq('key', 'site').maybeSingle()
if (settingsError) throw settingsError
if (settings && isEmpty(settings.value)) { const { error } = await db.from('settings').update({ value: defaultSiteContent.site }).eq('id', settings.id); if (error) throw error }
console.info(`CMS seed completed for ${pages.length} page groups`)
