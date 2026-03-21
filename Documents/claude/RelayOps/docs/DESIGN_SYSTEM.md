# Design System

RelayOps uses a blue-first system centered on `#3B82F6` for product identity, with semantic colors reserved for system state. Dashboard layout, spacing, and core component treatments should stay consistent across admin, partner, worker, and public marketing surfaces.

## Color System

- Brand blue: `#3B82F6`
- Primary token: `--primary: 217 91% 60%`
- CTA token: `--cta: 217 91% 60%`
- Sidebar active token: `--sidebar-item-active: 217 91% 60%`
- Neutrals: use zinc/slate for structure, surfaces, borders, and secondary text
- Success: keep green for confirmed, approved, completed, and paid-success cues
- Warning: keep amber/yellow for queued, invoiced, pending, or attention-required cues
- Destructive: keep red for disputes, failures, cancellations, and irreversible actions
- Do not introduce decorative `amber`, `indigo`, `violet`, `purple`, or `orange` accents when the UI intent is brand or emphasis rather than state

## Typography

- Page titles: `text-2xl font-bold`
- Section titles: `text-base font-semibold` or `text-sm font-semibold` depending on density
- Support text: `text-sm text-muted-foreground`
- Labels and metadata: `text-xs`, uppercase tracking only for compact status or metric labels
- Keep dashboard copy concise and operational; avoid marketing-style language in app surfaces

## Spacing

- Dashboard shell padding lives in `DashboardShell`: `px-4 py-6 sm:px-6 lg:px-8`
- Use shared page wrappers from `globals.css`
- `.dashboard-page`: wide dashboard pages, `max-w-6xl`, `space-y-8`
- `.dashboard-page-narrow`: medium-width flows, `max-w-4xl`, `space-y-8`
- `.dashboard-page-detail`: detail views and forms, `max-w-3xl`, `space-y-6`
- Prefer `gap-4` for metric cards and compact card grids
- Prefer `mb-3` or `mb-6` only for local section separation inside a page block

## Components

- Buttons: use shared `Button` variants; default and primary CTAs inherit the blue token
- Badges: use shared `Badge` variants; state-specific badges should map to brand blue or semantic green/amber/red
- Status pills: use `TicketStatusBadge` as the source of truth for ticket state colors
- Dashboard chrome: sidebar active state, logo chip, topbar role badge, and avatar fallback all use brand blue
- Cards: prefer subtle neutral surfaces with one top border or icon tint to communicate emphasis
- Tables: use shared `Table` primitives; table containers should keep neutral borders and consistent row density
- Public marketing chrome: navbar and footer should remain on the blue system to match landing-page CTA treatment
