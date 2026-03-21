import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'

export const metadata = createPublicMetadata(publicPageDefinitions.home)

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-6">
        CRM Data Cleanup in 2 Business Days
      </h1>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
        White-label HubSpot / CRM import prep for RevOps agencies. No more scrubbing CSVs — we
        handle it end to end.
      </p>
      <div className="flex gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/request-access">Request Access</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/how-it-works">How It Works</Link>
        </Button>
      </div>
    </div>
  )
}
