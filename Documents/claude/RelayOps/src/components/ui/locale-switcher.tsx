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
      className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:border-blue-300 hover:text-blue-600"
      aria-label={t('switchLanguage')}
    >
      {label}
    </button>
  )
}
