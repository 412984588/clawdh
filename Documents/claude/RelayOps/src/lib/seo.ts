import type { Metadata, Viewport } from 'next'
import { env } from '@/lib/config/env'

type JsonLd = Record<string, unknown>

type PublicPageDefinition = {
  path: string
  canonicalPath?: string
  title: string
  description: string
  keywords?: string[]
}

const DEFAULT_KEYWORDS = [
  'crm data cleanup',
  'hubspot import prep',
  'revops agency fulfillment',
  'white-label data cleanup',
  'crm deduplication',
  'crm normalization',
]

export const siteConfig = {
  name: 'RelayOps',
  description:
    'White-label CRM data cleanup fulfillment for US RevOps agencies. CRM import prep in 2 business days.',
  url: new URL(env.NEXT_PUBLIC_APP_URL),
  ogImagePath: '/opengraph-image',
  keywords: DEFAULT_KEYWORDS,
} as const

export const publicPageDefinitions = {
  landing: {
    path: '/',
    title: 'CRM Data Cleanup for US Agencies',
    description:
      'White-label CRM data cleanup, deduplication, normalization, and import prep in 2 business days for US RevOps agencies.',
    keywords: ['crm import prep', 'hubspot cleanup'],
  },
  home: {
    path: '/home',
    canonicalPath: '/',
    title: 'CRM Data Cleanup in 2 Business Days',
    description:
      'White-label HubSpot and CRM import prep for RevOps agencies with a 2-business-day turnaround.',
    keywords: ['crm import prep', 'hubspot import prep'],
  },
  demo: {
    path: '/demo',
    title: 'Interactive Product Demo',
    description:
      'Walk through the RelayOps workflow from partner intake to pricing, fulfillment, and delivery approval in one interactive product demo.',
    keywords: ['product demo', 'crm workflow demo', 'revops demo'],
  },
  pricing: {
    path: '/pricing',
    title: 'Pricing',
    description:
      'Explore RelayOps placeholder pricing tiers for teams evaluating structured CRM cleanup operations, scalable delivery, and enterprise support.',
    keywords: ['pricing', 'crm operations pricing', 'revops outsourcing pricing'],
  },
  caseStudies: {
    path: '/case-studies',
    title: 'Case Studies',
    description:
      'Placeholder customer stories showing how RelayOps supports ecommerce, SaaS, and financial operations teams with high-stakes data delivery.',
    keywords: ['customer stories', 'data migration case studies', 'crm cleanup results'],
  },
  howItWorks: {
    path: '/how-it-works',
    title: 'How It Works',
    description:
      'See the five-step RelayOps workflow from scoping and invoicing to clean, import-ready CRM data delivery.',
    keywords: ['crm workflow', 'data cleanup process'],
  },
  forPartners: {
    path: '/for-partners',
    title: 'For Partners',
    description:
      'White-label CRM data cleanup fulfillment for RevOps agencies with fixed pricing, 2-day turnaround, and secure delivery.',
    keywords: ['partner program', 'white-label fulfillment'],
  },
  requestAccess: {
    path: '/request-access',
    title: 'Request Partner Access',
    description:
      'Apply to become a RelayOps partner and offer white-label CRM data cleanup to your clients.',
    keywords: ['partner application', 'revops partner'],
  },
  pilotSample: {
    path: '/pilot-sample',
    title: 'Paid Pilot',
    description:
      'Start with a $149 CRM cleanup pilot to review RelayOps output before committing to production work.',
    keywords: ['crm pilot', 'data cleanup pilot'],
  },
  security: {
    path: '/security',
    title: 'Security & Data Handling',
    description:
      'Review RelayOps security controls, retention windows, AI privacy protections, encryption, and DPA availability.',
    keywords: ['data security', 'ai privacy'],
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy',
    description: 'How RelayOps collects, uses, stores, and protects partner and client information.',
    keywords: ['privacy policy', 'data handling'],
  },
  terms: {
    path: '/terms',
    title: 'Terms of Service',
    description: 'RelayOps terms for partner access, billing, data handling, and acceptable use.',
    keywords: ['terms of service', 'billing terms'],
  },
  refundPolicy: {
    path: '/refund-policy',
    title: 'Refund Policy',
    description:
      'Understand RelayOps refund eligibility by job status, revision flow, and dispute outcomes.',
    keywords: ['refund policy', 'job disputes'],
  },
} satisfies Record<string, PublicPageDefinition>

export const publicSitemapPaths = [
  publicPageDefinitions.landing.path,
  publicPageDefinitions.home.path,
  publicPageDefinitions.demo.path,
  publicPageDefinitions.pricing.path,
  publicPageDefinitions.caseStudies.path,
  publicPageDefinitions.howItWorks.path,
  publicPageDefinitions.forPartners.path,
  publicPageDefinitions.requestAccess.path,
  publicPageDefinitions.pilotSample.path,
  publicPageDefinitions.security.path,
  publicPageDefinitions.privacy.path,
  publicPageDefinitions.terms.path,
  publicPageDefinitions.refundPolicy.path,
] as const

export const rootViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09090b',
}

export const rootMetadata: Metadata = {
  metadataBase: siteConfig.url,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: absoluteUrl('/'),
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
    images: [buildOpenGraphImage()],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImagePath)],
  },
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString()
}

export function createPublicMetadata(page: PublicPageDefinition): Metadata {
  const canonicalUrl = absoluteUrl(page.canonicalPath ?? page.path)
  const socialTitle = buildSocialTitle(page.title)

  return {
    title: page.title,
    description: page.description,
    keywords: Array.from(new Set([...siteConfig.keywords, ...(page.keywords ?? [])])),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: socialTitle,
      description: page.description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: 'en_US',
      type: 'website',
      images: [buildOpenGraphImage()],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: page.description,
      images: [absoluteUrl(siteConfig.ogImagePath)],
    },
  }
}

export function buildOrganizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: absoluteUrl('/'),
    logo: absoluteUrl(siteConfig.ogImagePath),
    description: siteConfig.description,
    areaServed: 'US',
  }
}

export function buildPartnerServiceJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'White-label CRM data cleanup fulfillment',
    description: publicPageDefinitions.forPartners.description,
    serviceType: 'White-label CRM data cleanup',
    url: absoluteUrl(publicPageDefinitions.forPartners.path),
    areaServed: 'US',
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: absoluteUrl('/'),
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'RevOps agencies',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(publicPageDefinitions.requestAccess.path),
    },
  }
}

function buildSocialTitle(title: string): string {
  return `${title} | ${siteConfig.name}`
}

function buildOpenGraphImage() {
  return {
    url: absoluteUrl(siteConfig.ogImagePath),
    width: 1200,
    height: 630,
    alt: 'RelayOps social preview',
  }
}
