import type { ReactNode } from 'react'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'

export const metadata = createPublicMetadata(publicPageDefinitions.pricing)

export default function PricingLayout({ children }: { children: ReactNode }) {
  return children
}
