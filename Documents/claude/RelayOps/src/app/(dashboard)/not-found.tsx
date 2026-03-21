'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ROLE_PREFIXES = ['/admin', '/partner', '/worker'] as const

export default function DashboardNotFound() {
  const pathname = usePathname()

  // 从 URL 推导角色前缀，兜底到 /
  const rolePrefix = ROLE_PREFIXES.find(p => pathname.startsWith(p)) ?? '/'

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-slate-900">404</h2>
          <p className="text-sm text-muted-foreground">
            Page not found. The page you are looking for does not exist.
          </p>
        </div>
        <Button variant="outline" asChild className="w-full">
          <Link href={rolePrefix}>Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
