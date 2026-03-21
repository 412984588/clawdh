import type { MetadataRoute } from 'next'
import { absoluteUrl, siteConfig } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    host: siteConfig.url.origin,
    sitemap: absoluteUrl('/sitemap.xml'),
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/partner/', '/worker/'],
      },
    ],
  }
}
