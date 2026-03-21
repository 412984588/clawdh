# Blog / CMS Schema

Full-featured blog schema with authors, categories, tags, posts, and comments.

## Tables
- `authors` — post authors with bio and avatar
- `categories` — hierarchical post categories
- `tags` — many-to-many post tags
- `posts` — articles with draft/published state
- `posts_tags` — join table for posts ↔ tags
- `comments` — moderated reader comments

## Features
- Slugs for SEO-friendly URLs
- Draft/published workflow
- Many-to-many tags via join table
- Comment moderation (approved field)
