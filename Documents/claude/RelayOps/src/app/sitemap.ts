import type { MetadataRoute } from 'next'
import { absoluteUrl, publicSitemapPaths } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return publicSitemapPaths.map((path) => ({
    url: absoluteUrl(path),
  }))
}
