# Design System — RelayOps

## Product Context
- **What this is:** RelayOps is a managed data operations platform for CRM cleanup, imports, QA, and delivery handoff.
- **Who it's for:** US RevOps agencies, implementation partners, and internal operator teams who need white-label, fixed-scope delivery.
- **Space/industry:** B2B SaaS, workflow operations, delivery infrastructure, agency enablement.
- **Project type:** Hybrid product. Public marketing site plus dense multi-role dashboard surfaces.

## Brand Personality
- **Core idea:** Operational confidence.
- **Traits:** precise, accountable, commercially credible, calm under deadline pressure.
- **What it should not feel like:** generic AI startup, neon developer toy, inspirational consulting deck, or soft consumer SaaS.
- **Visual metaphor:** a daylight control room. Clean paper surfaces for readability, dark command rails for authority, and restrained signal color for proof.

## Aesthetic Direction
- **Direction:** Operational Editorial.
- **Decoration level:** Intentional.
- **Mood:** RelayOps should feel like the agency-facing equivalent of a mission control console: clear hierarchy, hard promises, visible process, and enough polish to sell premium delivery without drifting into glossy startup theater.
- **Reference sites:**
  - https://stripe.com/
  - https://linear.app/
  - https://vercel.com/home
- **Observed cues worth borrowing:**
  - Stripe: atmospheric section framing and commercial confidence.
  - Linear: aggressive hierarchy, speed, and product-first density.
  - Vercel: authority through contrast, proof blocks, and restraint.
- **Where RelayOps should diverge:** stay lighter and more operational than dark-mode devtools, and warmer/more specific than interchangeable blue-card SaaS marketing.

## Safe Choices
- **Blue remains the primary action color** because the existing brand already owns it and it reads as trust, reliability, and enterprise friendliness.
- **Grid-disciplined structure** should anchor both marketing and dashboard surfaces because the product sells predictability.
- **Proof-heavy content modules** should stay central because buyers need to believe process quality before they care about aesthetics.

## Deliberate Risks
- **Display typography with more character:** Use `Space Grotesk` for hero and section headings instead of a default SaaS sans. Gain: recognizable silhouette and sharper rhythm. Cost: slightly more opinionated tone.
- **Two-speed surfaces:** Pair bright paper canvases with dark control rails instead of making the whole brand white or black. Gain: stronger identity and better separation between marketing narrative and operational proof. Cost: requires more discipline in section transitions.
- **Teal as the proof accent:** Use teal for automation, QA, and delivery confidence rather than decorative gradients or secondary purples. Gain: RelayOps gets a second signature color that still feels operational. Cost: accent use must stay rare.

## Typography
- **Display/Hero:** `Space Grotesk` — compact, technical, and memorable without becoming playful.
- **Body:** `Manrope` — clean and readable for both marketing paragraphs and dashboard copy.
- **UI/Labels:** `Manrope` — maintain one clear UI voice instead of introducing another neutral sans.
- **Data/Tables:** `IBM Plex Mono` — tabular, credible, and suited to ticket IDs, timestamps, and SLA markers.
- **Code:** `IBM Plex Mono`
- **Loading:** `next/font/google`
- **Scale:**
  - `xs`: 12px / 0.75rem
  - `sm`: 14px / 0.875rem
  - `base`: 16px / 1rem
  - `lg`: 20px / 1.25rem
  - `xl`: 24px / 1.5rem
  - `2xl`: 32px / 2rem
  - `3xl`: 40px / 2.5rem
  - `4xl`: 56px / 3.5rem
  - `5xl`: 72px / 4.5rem
- **Tracking guidance:**
  - Hero and large section titles: `-0.04em` to `-0.08em`
  - UI labels: default or `-0.01em`
  - Metadata and mono labels: uppercase with `0.18em` to `0.28em`

## Color
- **Approach:** Balanced.
- **Primary:** `#3B82F6` — Relay Blue. Primary CTA, active states, links, focus rings, high-trust accents.
- **Secondary:** `#14B8A6` — Signal Teal. QA confidence, automation states, completion proof, selective emphasis.
- **Neutrals:**
  - `#F8FAFC` Paper White
  - `#E8EEF7` Mist Surface
  - `#CBD5E1` Quiet Border
  - `#526071` Steel Text
  - `#0B1220` Control Ink
- **Semantic:**
  - success `#16A34A`
  - warning `#F59E0B`
  - error `#DC2626`
  - info `#3B82F6`
- **Dark mode:** keep the same hue family, reduce saturation 10-15% on large surfaces, and reserve bright blue/teal for interactive or proof moments. Dark mode should feel like control-room contrast, not gamer neon.
- **Do not use:**
  - purple/violet gradients as the main brand move
  - decorative amber/orange accents outside semantic warning
  - flat all-gray UI that removes the brand entirely

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable-compact
- **Scale:** `2xs(4)` `xs(8)` `sm(12)` `md(16)` `lg(24)` `xl(32)` `2xl(48)` `3xl(64)` `4xl(96)`
- **Rules:**
  - Marketing sections should breathe with `xl` to `3xl` spacing.
  - Dashboard cards should prefer `md` to `xl`.
  - Avoid identical spacing everywhere. Hero, proof blocks, and dense tables should each have visibly different rhythm.

## Layout
- **Approach:** Hybrid.
- **Grid:** 4 columns mobile, 8 columns tablet, 12 columns desktop.
- **Max content width:** 1280px for public surfaces, 1400px for dashboard shells when needed.
- **Section strategy:**
  - Marketing: alternate bright editorial canvases with darker proof or workflow blocks.
  - Dashboard: keep consistent shells, denser modules, and strong left-to-right scan patterns.
- **Border radius:**
  - `sm`: 10px
  - `md`: 16px
  - `lg`: 28px
  - `full`: 9999px
- **Rule:** do not round everything to the same radius. Big cards, pills, and inputs should feel intentionally tiered.

## Motion
- **Approach:** Minimal-functional.
- **Easing:** enter `cubic-bezier(0.22, 1, 0.36, 1)`, exit `ease-in`, move `ease-in-out`
- **Duration:** micro `80-120ms`, short `160-220ms`, medium `240-320ms`
- **Usage:**
  - hover lift on premium CTA or proof cards
  - slide/fade for page entry and list reveal
  - subtle scale for status change confirmation
- **Avoid:** scroll-jacking, ambient looping glows, or animation that makes the dashboard feel less trustworthy.

## Component Direction
- **Buttons:** primary buttons should be solid Relay Blue on light surfaces, and avoid gradient fills. Secondary buttons use quiet borders and strong text.
- **Cards:** favor neutral cards with one strong signal edge: top border, mono label, or accent pill.
- **Badges:** blue for brand emphasis, teal for proof/completion, semantic colors only for actual state.
- **Tables:** tight headers, mono metadata, and enough whitespace to scan; never soft or bubbly.
- **Navigation:** top-level marketing chrome should feel crisp and premium, not oversized or floating for its own sake.

## Copy + Tone
- **Voice:** direct, operational, commercially confident.
- **Preferred language:** turnaround, proof, QA, delivery, white-label, scoped, review-ready.
- **Avoid:** vague aspirational slogans, AI hype clichés, and filler like "unlock your workflow potential."

## Implementation Notes
- Use `Space Grotesk`, `Manrope`, and `IBM Plex Mono` as the default stack for any new visual system work.
- Keep `#3B82F6` as the anchor, but always pair it with Control Ink and Signal Teal so the identity is more than "blue SaaS."
- Public pages should feel editorial and sales-ready. Dashboard pages should feel procedural and unambiguous.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-21 | Created RelayOps v2 design system | Needed a professional visual language with stronger identity than generic blue startup styling |
| 2026-03-21 | Chose Operational Editorial direction | Best fit for a product selling delivery trust, operational rigor, and white-label quality |
| 2026-03-21 | Chose Space Grotesk + Manrope + IBM Plex Mono | Gives RelayOps a sharper silhouette while keeping dashboard readability high |
