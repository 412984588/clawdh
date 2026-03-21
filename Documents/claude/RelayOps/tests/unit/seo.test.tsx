import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ForPartnersPage from '../../src/app/[locale]/(public)/for-partners/page'
import LandingPage from '../../src/app/[locale]/(public)/page'
import opengraphImage, { contentType, size } from '../../src/app/opengraph-image'
import robots from '../../src/app/robots'
import sitemap from '../../src/app/sitemap'
import {
  absoluteUrl,
  createPublicMetadata,
  publicPageDefinitions,
  publicSitemapPaths,
  rootMetadata,
  rootViewport,
} from '@/lib/seo'
import { routing } from '@/i18n/routing'

type PublicPage = (typeof publicPageDefinitions)[keyof typeof publicPageDefinitions]

function readJsonLdScript(id: string): Record<string, unknown> {
  const script = document.getElementById(id)

  expect(script).not.toBeNull()
  expect(script?.getAttribute('type')).toBe('application/ld+json')

  return JSON.parse(script?.textContent ?? '{}') as Record<string, unknown>
}

describe('site seo configuration', () => {
  it('defines root metadata defaults and viewport', () => {
    expect(rootMetadata.metadataBase?.toString()).toBe('http://localhost:3000/')
    expect(rootMetadata.title).toEqual({
      default: 'RelayOps',
      template: '%s | RelayOps',
    })
    expect(rootMetadata.description).toContain('White-label CRM data cleanup')
    expect(rootMetadata.keywords).toContain('crm data cleanup')
    expect(rootMetadata.robots).toMatchObject({
      index: true,
      follow: true,
    })
    expect(rootViewport).toEqual({
      width: 'device-width',
      initialScale: 1,
      themeColor: '#09090b',
    })
  })

  it.each([
    publicPageDefinitions.landing,
    publicPageDefinitions.home,
    publicPageDefinitions.demo,
    publicPageDefinitions.pricing,
    publicPageDefinitions.caseStudies,
    publicPageDefinitions.howItWorks,
    publicPageDefinitions.forPartners,
    publicPageDefinitions.requestAccess,
    publicPageDefinitions.pilotSample,
    publicPageDefinitions.security,
    publicPageDefinitions.privacy,
    publicPageDefinitions.terms,
    publicPageDefinitions.refundPolicy,
  ])('creates canonical and social metadata for $path', (page: PublicPage) => {
    const metadata = createPublicMetadata(page)
    const expectedCanonical = absoluteUrl(
      'canonicalPath' in page && page.canonicalPath ? page.canonicalPath : page.path,
    )
    const openGraphImages = metadata.openGraph?.images as Array<{ url: string }>
    const twitterImages = metadata.twitter?.images as string[]

    expect(metadata.alternates?.canonical).toBe(expectedCanonical)
    expect(metadata.openGraph).toMatchObject({
      title: expect.any(String),
      description: page.description,
      url: expectedCanonical,
      type: 'website',
    })
    expect(openGraphImages[0]?.url).toBe(absoluteUrl('/opengraph-image'))
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: expect.any(String),
      description: page.description,
    })
    expect(twitterImages[0]).toBe(absoluteUrl('/opengraph-image'))
  })

  it('renders organization json-ld on the landing page', () => {
    render(<LandingPage />)

    const schema = readJsonLdScript('relayops-organization-schema')

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Organization')
    expect(schema.name).toBe('RelayOps')
    expect(schema.url).toBe('http://localhost:3000/')
  })

  it('renders service json-ld on the for-partners page', () => {
    render(<ForPartnersPage />)

    const schema = readJsonLdScript('relayops-service-schema')

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Service')
    expect(schema.name).toBe('White-label CRM data cleanup fulfillment')
  })

  it('generates a sitemap for every public marketing route', () => {
    const expected = publicSitemapPaths.map((path) => ({
      url: absoluteUrl(path),
    }))

    expect(sitemap()).toEqual(expected)
  })

  it('publishes robots rules that block dashboard urls and point to the sitemap', () => {
    expect(robots()).toEqual({
      host: 'http://localhost:3000',
      sitemap: 'http://localhost:3000/sitemap.xml',
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin/', '/partner/', '/worker/'],
        },
      ],
    })
  })

  it('returns a png opengraph image at 1200x630', async () => {
    const response = await opengraphImage()

    expect(contentType).toBe('image/png')
    expect(size).toEqual({
      width: 1200,
      height: 630,
    })
    expect(response.headers.get('content-type')).toContain('image/png')
  })
})
