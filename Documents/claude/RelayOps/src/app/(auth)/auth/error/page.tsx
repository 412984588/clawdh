import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthErrorPageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { message } = await searchParams
  const errorMessage = message ? decodeURIComponent(message) : 'An authentication error occurred.'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Authentication Error</h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    </div>
  )
}
