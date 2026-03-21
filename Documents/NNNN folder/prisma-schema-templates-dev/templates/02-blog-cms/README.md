# 02 — Blog CMS

Full-featured blog schema with authors, categories, many-to-many tags, posts, and nested comments.

## Models

- **Author** — post authors with slug
- **Category** — post categories (one-to-many)
- **Tag** — many-to-many tags via PostTag junction
- **Post** — core content with status, view count, SEO slug
- **Comment** — nested comments with moderation status

## Key patterns

- Self-referential `Comment` for threaded replies
- `PostTag` explicit junction table for many-to-many
- Composite indexes for `status + publishedAt` (listing queries)
