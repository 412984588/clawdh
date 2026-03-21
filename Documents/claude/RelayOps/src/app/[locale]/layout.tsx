import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { absoluteUrl } from '@/lib/seo'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// 为每个 locale 生成 hreflang alternates metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 验证 locale 参数（确保 generateMetadata 消费 params Promise）
  await params
  const languages: Record<string, string> = {}
  for (const loc of routing.locales) {
    const prefix = loc === routing.defaultLocale ? '' : `/${loc}`
    languages[loc] = absoluteUrl(prefix || '/')
  }

  return {
    alternates: {
      languages,
    },
    other: {
      'x-default': absoluteUrl('/'),
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    <NextIntlClientProvider>
      {children}
    </NextIntlClientProvider>
  )
}
