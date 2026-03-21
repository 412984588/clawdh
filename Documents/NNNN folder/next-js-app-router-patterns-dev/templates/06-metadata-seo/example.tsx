// Next.js App Router Metadata & SEO 完整模式
// 涵盖静态 metadata、动态 metadata、OG 图片、结构化数据、robots.txt

import type { Metadata, Viewport } from "next";

// ===== 1. 静态 metadata — 用于固定内容页面 =====
export const metadata: Metadata = {
  // 基础 SEO
  title: {
    default: "我的应用",
    template: "%s | 我的应用", // 子页面标题格式
  },
  description: "应用的简短描述，建议 150-160 字符，包含核心关键词",
  keywords: ["Next.js", "React", "TypeScript", "App Router"],
  authors: [{ name: "开发者", url: "https://example.com" }],
  creator: "开发者姓名",

  // Open Graph — 社交分享卡片
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://example.com",
    siteName: "我的应用",
    title: "我的应用 — 简洁有力的标题",
    description: "OG 描述，适合社交分享",
    images: [
      {
        url: "https://example.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "OG 图片描述",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "我的应用",
    description: "Twitter 分享描述",
    images: ["https://example.com/twitter-image.png"],
    creator: "@yourhandle",
  },

  // 规范链接，防止重复内容
  alternates: {
    canonical: "https://example.com",
    languages: {
      "zh-CN": "https://example.com/zh",
      "en-US": "https://example.com/en",
    },
  },

  // 爬虫指令
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 网站验证
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
};

// ===== 2. Viewport 配置（Next.js 15 需单独导出）=====
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

// ===== 3. 动态 metadata — 用于动态路由（如博客文章、商品详情）=====
interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | undefined };
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  // 从数据库或 API 获取数据
  const post = await fetchPost(params.slug);

  if (!post) {
    return {
      title: "文章不存在",
      description: "您访问的文章不存在",
    };
  }

  const ogImage = post.coverImage || "/default-og.png";

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://example.com/blog/${params.slug}`,
    },
  };
}

// ===== 4. OG 图片生成 — 在 app/og/route.tsx 中使用 ImageResponse =====
// import { ImageResponse } from "next/og";
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const title = searchParams.get("title") ?? "默认标题";
//   return new ImageResponse(
//     <div style={{ display: "flex", width: "100%", height: "100%",
//                   background: "linear-gradient(135deg, #667eea, #764ba2)",
//                   alignItems: "center", justifyContent: "center", padding: 60 }}>
//       <h1 style={{ color: "white", fontSize: 64, fontWeight: "bold" }}>{title}</h1>
//     </div>,
//     { width: 1200, height: 630 }
//   );
// }

// ===== 5. 结构化数据 (JSON-LD) =====
export function ArticleJsonLd({
  title,
  description,
  datePublished,
  dateModified,
  authorName,
  url,
  imageUrl,
}: {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  url: string;
  imageUrl: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished,
    dateModified,
    author: {
      "@type": "Person",
      name: authorName,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ===== 6. robots.txt — 在 app/robots.ts 中 =====
// import { MetadataRoute } from "next";
// export default function robots(): MetadataRoute.Robots {
//   return {
//     rules: [
//       { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
//       { userAgent: "Googlebot", allow: "/" },
//     ],
//     sitemap: "https://example.com/sitemap.xml",
//   };
// }

// ===== 7. sitemap.xml — 在 app/sitemap.ts 中 =====
// import { MetadataRoute } from "next";
// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const posts = await getAllPosts();
//   const postUrls = posts.map((post) => ({
//     url: `https://example.com/blog/${post.slug}`,
//     lastModified: post.updatedAt,
//     changeFrequency: "weekly" as const,
//     priority: 0.8,
//   }));
//   return [
//     { url: "https://example.com", lastModified: new Date(), priority: 1 },
//     { url: "https://example.com/about", lastModified: new Date(), priority: 0.5 },
//     ...postUrls,
//   ];
// }

// 页面组件示例
export default function BlogPostPage({ params }: PageProps) {
  return (
    <article>
      <ArticleJsonLd
        title="示例文章标题"
        description="文章描述"
        datePublished="2024-01-01"
        dateModified="2024-01-15"
        authorName="作者名"
        url={`https://example.com/blog/${params.slug}`}
        imageUrl="https://example.com/image.png"
      />
      <h1>文章内容</h1>
    </article>
  );
}

// 占位辅助函数
async function fetchPost(_slug: string) {
  return {
    title: "文章标题",
    excerpt: "文章摘要",
    coverImage: "/cover.png",
    createdAt: new Date(),
    updatedAt: new Date(),
    author: { name: "作者" },
  };
}

async function getAllPosts() {
  return [{ slug: "hello-world", updatedAt: new Date() }];
}
