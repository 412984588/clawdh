import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LocaleNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <p className="text-6xl font-bold text-slate-300">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
