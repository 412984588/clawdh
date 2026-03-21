'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('common.locale')

  const targetLocale = locale === 'en' ? 'zh' : 'en'
  const label = locale === 'en' ? t('zh') : t('en')

  function handleSwitch() {
    router.replace(pathname, { locale: targetLocale })
  }

  return (
    <button
      onClick={handleSwitch}
      className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full border border-zinc-200 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-600 transition-colors hover:border-blue-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:min-h-[44px] sm:min-w-[44px] sm:px-3 sm:text-xs"
      aria-label={t('switchLanguage')}
    >
      {label}
    </button>
  )
}
