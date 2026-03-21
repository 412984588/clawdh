# 10 — Social Network

Twitter/Instagram-style social graph with follows, posts, likes, nested comments, and hashtags.

## Models

- **User** — profiles with verification, privacy settings
- **Follow** — self-referential many-to-many with PENDING status for private accounts
- **Post** — content with image array, denormalized counters
- **Like** — unique like per user per post
- **Comment** — nested replies via self-relation
- **Hashtag** + **PostHashtag** — many-to-many with denormalized post count

## Key patterns

- Dual `@relation` names ("Follower"/"Following") on self-referential many-to-many
- Denormalized `likeCount`/`commentCount` — update via triggers or application logic
- `FollowStatus.PENDING` for private account approval flow
