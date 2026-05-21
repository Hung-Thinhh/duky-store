// ─── Blog Types ──────────────────────────────────────────────────────────────

export interface BlogMedia {
  id: string;
  url: string;
  secureUrl: string | null;
  fileName: string | null;
  altText: string | null;
  title: string | null;
}

export interface BlogAuthor {
  id: string;
  fullName: string;
  email: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  type: string;
}

export interface BlogSeo {
  id: string;
  entityType: string;
  entityId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageMediaId: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  focusKeyword: string | null;
  seoScore: number | null;
  analysisJson: Record<string, unknown> | null;
  schemaType: string | null;
  schemaJson: Record<string, unknown> | null;
  breadcrumbJson: Record<string, unknown> | null;
  noIndex: boolean;
  noFollow: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverMediaId: string | null;
  coverMedia: BlogMedia | null;
  status: string;
  authorId: string;
  author: BlogAuthor | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categories: BlogCategory[];
  tags: BlogTag[];
  seo?: BlogSeo | null;
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
  sort?: "newest" | "oldest";
}
