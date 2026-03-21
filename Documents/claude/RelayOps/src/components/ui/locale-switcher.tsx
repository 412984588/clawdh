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
      className="min-h-[44px] rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:border-blue-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label={t('switchLanguage')}
    >
      {label}
    </button>
  )
}
