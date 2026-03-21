# Social Network Schema

Twitter/Instagram-style social schema with follows, posts, likes, and hashtags.

## Tables
- `users` — social profiles with denormalized counters
- `follows` — follow graph with pending state (for private accounts)
- `posts` — posts/tweets with threading and repost support
- `likes` — like relationships
- `hashtags` — hashtag index with post counts
- `post_hashtags` — posts ↔ hashtags join table

## Features
- Threaded posts via `parentId` (comments/replies)
- Repost/retweet via `repostOfId`
- Private account follow requests (`accepted = false`)
- Post visibility: public, followers-only, private
- Denormalized counters for fast feed rendering (update via triggers or application logic)
