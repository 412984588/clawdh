import { redirect } from 'next/navigation'

// 根路由重定向到默认 locale 首页
// [locale]/(public)/page.tsx 是真正的首页，/ 是无 locale 的入口
export default function RootPage() {
  redirect('/en')
}
