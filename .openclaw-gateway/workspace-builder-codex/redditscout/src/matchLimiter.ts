import { MatchedPost } from "./types.js";

export interface MatchLimitResult {
  items: MatchedPost[];
  truncatedCount: number;
}

export function applyMatchLimit(
  items: MatchedPost[],
  maxMatches: number,
): MatchLimitResult {
  if (items.length <= maxMatches) {
    return {
      items,
      truncatedCount: 0,
    };
  }

  return {
    items: items.slice(0, maxMatches),
    truncatedCount: items.length - maxMatches,
  };
}
