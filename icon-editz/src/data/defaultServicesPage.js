const item = (id, title, description, extras = {}) => ({ id, title, description, visible: true, status: 'published', ...extras })

export const defaultServicesPage = {
  homepage: { buttonText: 'View All Services', buttonUrl: '/services', visible: true },
  hero: {
    label: 'SERVICES',
    heading: 'Creative Services That Help Brands Stand Out',
    description: 'I create premium video editing, motion graphics, branding, social media creatives, logo animations and digital content that help businesses and creators grow.',
    primaryCta: 'Hire Me', primaryHref: '/contact', secondaryCta: 'View Projects', secondaryHref: '/projects', visible: true, status: 'published',
  },
  services: [
    item('video-editing', 'Video Editing', 'Cinematic stories with confident pacing and polished finishing.', { features: ['Cinematic editing', 'Reels, YouTube & corporate'], price: 'From ₹1,999', delivery: '2–5 Days', bestFor: 'Brands, creators & weddings', icon: 'Film', featured: true }),
    item('motion-graphics', 'Motion Graphics', 'Animated typography and visuals built to hold attention.', { features: ['Titles & transitions', 'Branded motion'], price: 'From ₹2,999', delivery: '3–6 Days', bestFor: 'Campaigns & launches', icon: 'Sparkles', featured: true }),
    item('logo-animation', 'Logo Animation', 'Memorable logo reveals that make a first impression.', { features: ['Custom reveal', 'Social-ready export'], price: 'From ₹1,499', delivery: '2–4 Days', bestFor: 'New brand identities', icon: 'BadgeCheck', featured: true }),
    item('youtube-editing', 'YouTube Editing', 'Long-form edits structured for retention and clarity.', { features: ['Hooks & pacing', 'Thumbnails ready'], price: 'From ₹2,499', delivery: '3–5 Days', bestFor: 'YouTubers & educators', icon: 'Clapperboard', featured: true }),
    item('social-media-editing', 'Social Media Editing', 'Platform-native creative that stops the scroll.', { features: ['Captions', 'Multiple formats'], price: 'From ₹999' }),
    item('wedding-events', 'Wedding & Events', 'Emotional, cinematic edits for milestone moments.', { features: ['Highlights', 'Music sync'], price: 'From ₹4,999' }),
    item('commercial-ads', 'Commercial Ads', 'High-impact campaign edits for products and launches.', { features: ['Campaign cutdowns', 'CTA motion'], price: 'From ₹3,999' }),
    item('corporate-videos', 'Corporate Videos', 'Clear, premium films for teams and organisations.', { features: ['Interviews', 'Brand consistency'], price: 'From ₹4,999' }),
    item('reels-shorts', 'Reels & Shorts', 'Fast, vertical storytelling engineered for reach.', { features: ['9:16 delivery', 'Trend-aware pacing'], price: 'From ₹799' }),
    item('thumbnail-design', 'Thumbnail Design', 'High-contrast thumbnails with a clear visual hook.', { features: ['Click-focused', 'Brand aligned'], price: 'From ₹499' }),
    item('brand-identity', 'Brand Identity', 'Cohesive visual direction for ambitious brands.', { features: ['Visual system', 'Creative direction'], price: 'From ₹4,999' }),
    item('graphic-design', 'Graphic Design', 'Premium marketing and social assets made to perform.', { features: ['Campaign assets', 'Ready-to-post'], price: 'From ₹999' }),
  ].map((service, index) => ({ ...service, featured: index < 4 })),
  homeServices: {
    label: 'Featured Services',
    heading: 'Creative support for every big idea',
    description: 'A focused selection of our most requested creative services.',
    buttonText: 'View All Services',
    buttonUrl: '/services',
    buttonVisible: true,
  },
  process: [
    item('discussion', 'Project Discussion', 'We align on your goals, audience, style, and success criteria.'),
    item('planning', 'Planning', 'A clear creative direction and production plan set the pace.'),
    item('editing', 'Editing', 'I shape the story with motion, rhythm, detail, and polish.'),
    item('review', 'Review', 'You share feedback and we refine every important detail.'),
    item('delivery', 'Final Delivery', 'Optimised, high-resolution assets delivered for every channel.'),
  ],
  features: ['Fast Delivery', 'Unlimited Revisions', 'Professional Quality', 'Creative Ideas', 'Affordable Pricing', 'Dedicated Support', 'Cloud Delivery', 'High Resolution Output'].map((title, index) => item(`feature-${index}`, title, 'A considered service experience designed around your goals.')),
  industries: ['Real Estate', 'Restaurants', 'Fashion', 'Travel', 'Education', 'Corporate', 'Personal Brands', 'YouTubers', 'Influencers', 'Wedding', 'Music', 'Startups'].map((title, index) => item(`industry-${index}`, title, 'Creative tailored to your audience and platform.')),
  software: [
    item('premiere', 'Adobe Premiere Pro', '★★★★★', { percentage: 95 }), item('after-effects', 'Adobe After Effects', '★★★★★', { percentage: 95 }), item('photoshop', 'Photoshop', '★★★★☆', { percentage: 88 }), item('illustrator', 'Illustrator', '★★★★☆', { percentage: 85 }), item('davinci', 'DaVinci Resolve', '★★★★★', { percentage: 92 }), item('canva', 'Canva', '★★★★★', { percentage: 95 }), item('capcut', 'CapCut', '★★★★★', { percentage: 95 }),
  ],
  packages: [
    item('basic', 'Basic', 'A focused creative deliverable.', { features: ['1 deliverable', '3-day delivery', '2 revisions'], price: '₹1,999' }), item('standard', 'Standard', 'More polish for growing brands.', { features: ['3 deliverables', '4-day delivery', '4 revisions'], price: '₹4,999' }), item('premium', 'Premium', 'A complete creative campaign.', { features: ['6 deliverables', '5-day delivery', 'Unlimited revisions'], price: '₹9,999' }), item('enterprise', 'Enterprise', 'A flexible creative partnership.', { features: ['Custom scope', 'Priority delivery', 'Dedicated support'], price: 'Let’s talk' }),
  ],
  faq: [item('timeline', 'How long does a project take?', 'Timelines depend on scope, but every package includes a clear delivery estimate.'), item('revisions', 'Can I request revisions?', 'Yes. We refine the work until it is aligned with your creative direction.'), item('files', 'Which formats do you deliver?', 'You receive platform-ready, high-resolution exports for the channels you need.')],
  testimonials: [item('client-1', 'Sai Kumar', 'Music Creator', { review: 'Every frame felt intentional. The pacing and polish were exactly what we needed.', rating: 5 }), item('client-2', 'Harika & Arun', 'Wedding Client', { review: 'The edit felt cinematic, warm, and beautifully balanced.', rating: 5 }), item('client-3', 'Rohit', 'Brand Studio', { review: 'The motion graphics elevated the entire campaign instantly.', rating: 5 })],
  cta: { heading: 'Ready to bring your ideas to life?', description: 'Let’s create something memorable for your next launch, campaign, or story.', primaryCta: 'Hire Me', primaryHref: '/contact', secondaryCta: 'Contact Me', secondaryHref: '/contact', visible: true, status: 'published' },
}
