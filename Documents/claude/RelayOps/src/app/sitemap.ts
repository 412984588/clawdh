import type { MetadataRoute } from 'next'
import { absoluteUrl, publicSitemapPaths } from '@/lib/seo'
import { routing } from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  // 为每个公开页面生成多语言 URL 条目（含 hreflang alternates）
  return publicSitemapPaths.flatMap((path) => {
    const alternates: Record<string, string> = {}
    for (const locale of routing.locales) {
      const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
      alternates[locale] = absoluteUrl(`${prefix}${path}`)
    }

    return routing.locales.map((locale) => {
      const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
      return {
        url: absoluteUrl(`${prefix}${path}`),
        alternates: { languages: alternates },
      }
    })
  })
}
