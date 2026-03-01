import { MatchedPost, RedditPost } from "./types.js";

export interface KeywordFilterOptions {
  includeKeywords: string[];
  excludeKeywords?: string[];
  minScore?: number;
  minComments?: number;
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function normalizeOptions(
  keywordsOrOptions: string[] | KeywordFilterOptions,
): Required<KeywordFilterOptions> {
  if (Array.isArray(keywordsOrOptions)) {
    return {
      includeKeywords: keywordsOrOptions,
      excludeKeywords: [],
      minScore: 0,
      minComments: 0,
    };
  }

  return {
    includeKeywords: keywordsOrOptions.includeKeywords,
    excludeKeywords: keywordsOrOptions.excludeKeywords ?? [],
    minScore: keywordsOrOptions.minScore ?? 0,
    minComments: keywordsOrOptions.minComments ?? 0,
  };
}

export function filterPostsByKeywords(
  posts: RedditPost[],
  keywordsOrOptions: string[] | KeywordFilterOptions,
): MatchedPost[] {
  const options = normalizeOptions(keywordsOrOptions);

  return posts
    .filter((post) => post.score >= options.minScore && post.numComments >= options.minComments)
    .map((post) => {
      const haystack = `${post.title}\n${post.selftext}`.toLowerCase();
      const excluded = options.excludeKeywords.some((keyword) => haystack.includes(keyword));

      if (excluded) {
        return {
          post,
          matchedKeywords: [],
          excluded: true,
        };
      }

      const matchedKeywords =
        options.includeKeywords.length === 0
          ? []
          : unique(options.includeKeywords.filter((keyword) => haystack.includes(keyword)));

      return {
        post,
        matchedKeywords,
        excluded: false,
      };
    })
    .filter((item) => {
      if (item.excluded) {
        return false;
      }

      // includeKeywords 为空时走全量模式，仅受最小分数/评论数和排除词影响。
      if (options.includeKeywords.length === 0) {
        return true;
      }

      return item.matchedKeywords.length > 0;
    })
    .map(({ post, matchedKeywords }) => ({
      post,
      matchedKeywords,
    }));
}
