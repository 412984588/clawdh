export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  subreddit: string;
  author: string;
  score: number;
  createdUtc: number;
}

export interface MatchedPost {
  post: RedditPost;
  matchedKeywords: string[];
}

export interface DigestConfig {
  subreddits: string[];
  keywords: string[];
  postLimitPerSubreddit: number;
  digestDate: string;
  outputDir: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
}

export interface RuntimeConfig {
  digest: DigestConfig;
  telegram?: TelegramConfig;
  email?: EmailConfig;
}
