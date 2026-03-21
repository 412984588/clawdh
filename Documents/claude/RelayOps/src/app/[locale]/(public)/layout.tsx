import { PublicNavbar } from '@/components/layouts/public-navbar'
import { PublicFooter } from '@/components/layouts/public-footer'
import { PageTransition } from '@/components/ui/motion'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main id="main-content" className="flex-1 flex flex-col">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <PublicFooter />
    </div>
  )
}
