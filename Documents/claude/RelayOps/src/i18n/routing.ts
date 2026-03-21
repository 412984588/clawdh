import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  // 默认语言不加前缀：/ = English，/zh/ = Chinese
  localePrefix: 'as-needed',
})
