import {
  buildOrganizationJsonLd,
  createPublicMetadata,
  publicPageDefinitions,
} from '@/lib/seo'
import { LandingContent } from './landing-content'

export const metadata = createPublicMetadata(publicPageDefinitions.landing)

export default function LandingPage() {
  return (
    <>
      <LandingContent />
      <script
        id="relayops-organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
      />
    </>
  )
}
