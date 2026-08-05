import { useMemo } from 'react'
import { api } from './api'
import { useCMS } from '../hooks/useCMS'
import { defaultSiteContent } from '../data/defaultSiteContent'
import { defaultServicesPage } from '../data/defaultServicesPage'
import { categories as projectCategories, projectsData } from '../data/projects'
import { skillsData, toolsData } from '../data/tools'

export const getCms = async ({ page, section, slug } = {}) => {
  const params = new URLSearchParams()
  if (page) params.set('page', page)
  if (section) params.set('section', section)
  if (slug) params.set('slug', slug)
  return (await api.get(`/api/cms?${params}`)).data ?? {}
}

const normalizeCmsContent = (value) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value ?? {}
}

const hasContent = (value) => {
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return Boolean(value)
}

const fallbackPageSections = {
  Homepage: {
    Hero: defaultSiteContent.hero,
    Showreel: defaultSiteContent.showreel,
    Services: defaultSiteContent.services,
    Projects: defaultSiteContent.projects,
    Tools: defaultSiteContent.tools,
    Testimonials: defaultSiteContent.testimonials,
    FAQ: defaultSiteContent.faq,
    CTA: defaultSiteContent.cta,
    Site: defaultSiteContent.site,
    'Featured Services': defaultServicesPage.homeServices,
    'Featured Projects': { items: projectsData.slice(0, 3), categories: projectCategories.slice(1) },
    'Featured Products': { items: [] },
    SEO: { title: 'Icon Editz - Premium Video Editing & Motion Graphics', description: 'Premium video editing, motion graphics, and creative storytelling by Icon Editz.', canonical: 'https://iconeditz.com/' },
  },
  'About Page': {
    Hero: { eyebrow: 'About', heading: 'About Icon Editz', description: 'Creative video editing, motion graphics, and visual storytelling.', primaryLabel: 'View Projects', primaryUrl: '/projects', secondaryLabel: 'Hire Me', secondaryUrl: '/hire' },
    Story: { eyebrow: 'Who I am', heading: 'A story-led creative studio', description: 'I turn raw ideas into premium visual storytelling through editing, motion, branding, and creative direction.' },
    Stats: { items: [{ id: 'stat-1', label: 'Lyric Videos', value: '3D' }, { id: 'stat-2', label: 'Projects Done', value: '10+' }, { id: 'stat-3', label: 'Pro Tools', value: '4+' }, { id: 'stat-4', label: 'Creativity', value: '100%' }] },
    Skills: { items: skillsData.map((item) => ({ id: item.skill.toLowerCase().replace(/\s+/g, '-'), ...item })) },
    Timeline: { items: [{ id: 'timeline-1', year: '2022', title: 'Founded Icon Editz', description: 'Started building a studio around storytelling, motion, and polished digital media.' }, { id: 'timeline-2', year: '2024', title: 'Expanded into branding and motion systems', description: 'Created a broader offering for creators, launches, and premium campaigns.' }] },
    Tools: { items: toolsData },
    CTA: defaultSiteContent.cta,
    SEO: { title: 'About | Icon Editz', description: 'Learn more about Icon Editz and the creative story behind the studio.' },
  },
  'Services Page': {},
  'Projects Page': {
    Hero: { eyebrow: 'Projects', heading: 'Featured Projects', description: 'Selected creative work from Icon Editz.', primaryLabel: 'Hire Me', primaryUrl: '/hire' },
    Categories: { items: projectCategories },
    Projects: { items: projectsData, categories: projectCategories },
    Portfolio: { items: projectsData, categories: projectCategories },
    Filters: { items: projectCategories.slice(1) },
    CTA: defaultSiteContent.cta,
    SEO: { title: 'Projects | Icon Editz', description: 'Browse featured creative work from Icon Editz.' },
  },
  'Store Page': {
    Hero: { eyebrow: 'Store', heading: 'Premium creative assets', description: 'Templates, edits, presets, and creative tools built to make your next project stand out.', primaryLabel: 'Browse Products', primaryUrl: '/products' },
    Categories: { items: ['All Assets', 'PSD', 'Wedding Invitation', 'After Effects', 'Premiere Pro', 'Photoshop', 'LUTs', 'Sound Packs'] },
    'Featured Products': { items: [] },
    Banner: { heading: 'Premium assets for modern creators', description: 'Use polished templates and assets to launch faster with a polished finish.' },
    SEO: { title: 'Store | Icon Editz', description: 'Premium creative assets from Icon Editz.' },
  },
  'Hire From Us Page': {
    Hero: { eyebrow: 'Hire Icon Editz', heading: 'Let’s create something iconic.', description: 'Tell us your story and we will bring it to life.', primaryLabel: 'Get Started', primaryUrl: '/hire' },
    Features: { items: defaultServicesPage.features.slice(0, 6).map((feature, index) => ({ id: feature.id || `feature-${index}`, ...feature })) },
    'Enquiry Form': { heading: 'Tell us about your project', description: 'Share your goals, timeline, and the kind of creative support you need.' },
    CTA: defaultServicesPage.cta,
    SEO: { title: 'Hire Icon Editz', description: 'Start your next creative project with Icon Editz.' },
  },
}

const fallbackSingletons = {
  footer: { brandName: 'ICON EDITZ', description: 'Creative editing, motion, and digital assets.', quickLinks: [], socialLinks: { instagram: defaultSiteContent.site.instagram, linkedin: defaultSiteContent.site.linkedin, youtube: defaultSiteContent.site.youtube }, email: defaultSiteContent.site.email, backgroundColor: '#0f0a1f', accentColor: '#9d5cff', copyrightText: defaultSiteContent.site.copyright },
  cta: defaultSiteContent.cta,
}

const resolveSectionContent = (page, sectionName, content) => {
  const fallback = fallbackPageSections[page]?.[sectionName]
  return hasContent(content) ? content : fallback
}

const mergePageContent = (page, sections = {}) => {
  const fallback = fallbackPageSections[page] || {}
  const merged = { ...fallback }
  Object.entries(sections).forEach(([sectionName, content]) => {
    merged[sectionName] = resolveSectionContent(page, sectionName, content)
  })
  return merged
}

export const rowsToSections = (rows) => Object.fromEntries((Array.isArray(rows) ? rows : []).map((row) => [row.section, normalizeCmsContent(row.content)]))

export const useCmsPage = (page) => {
  const query = useCMS({ page })
  const content = useMemo(() => mergePageContent(page, rowsToSections(query.data)), [page, query.data])
  return { content, loading: query.isLoading, error: query.error, refetch: query.refetch }
}

export const useCmsSingleton = (section) => {
  const query = useCMS({ section })
  const data = query.data || {}
  const fallback = fallbackSingletons[section] || {}
  return useMemo(() => (hasContent(data) ? data : fallback), [data, fallback])
}
