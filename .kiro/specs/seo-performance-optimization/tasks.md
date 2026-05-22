# Implementation Plan: SEO & Performance Optimization

## Overview

Convert the Duky Store Next.js frontend from client-rendered pages to Server Components with ISR, add comprehensive SEO metadata and JSON-LD structured data, generate dynamic sitemap/robots.txt, implement on-demand revalidation, and optimize page load performance through lazy loading and code splitting.

## Tasks

- [x] 1. Create shared SEO utilities and components
  - [x] 1.1 Create metadata builder utility (`src/lib/metadata.ts`)
    - Implement `buildMetadata` function that accepts `PageMetadataInput` (title, description, path, image, type)
    - Generate title following pattern `"{title} | Duky Store"`
    - Generate Open Graph tags (og:title, og:description, og:image, og:url, og:type)
    - Generate Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
    - Use `NEXT_PUBLIC_SITE_URL` env var for canonical URLs with fallback to `https://dukystore.vn`
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

  - [x] 1.2 Create JSON-LD structured data builders (`src/lib/structured-data.ts`)
    - Implement `buildProductJsonLd(product)` → Product schema with name, description, image, sku, brand, offers (price, currency, availability)
    - Implement `buildBreadcrumbJsonLd(items)` → BreadcrumbList schema with sequential positions starting at 1
    - Implement `buildWebsiteJsonLd()` → WebSite schema with SearchAction
    - Implement `buildArticleJsonLd(post)` → Article/BlogPosting schema with headline, datePublished
    - Handle sale price: include both original and sale price in offers when salePrice is non-null
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 1.3 Create JsonLd renderer component (`src/components/seo/JsonLd.tsx`)
    - Server Component that renders `<script type="application/ld+json">`
    - Escape `<` characters as `\u003c` in JSON output to prevent XSS
    - Accept a `data` prop of type `object`
    - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [x] 2. Convert Collection Page to Server Component with ISR
  - [x] 2.1 Convert `src/app/(shop)/collections/[slug]/page.tsx` to Server Component
    - Remove `"use client"` directive
    - Set `export const revalidate = 60`
    - Implement `generateStaticParams` returning slugs: boot-nam, boot-nu, phu-kien, outfit
    - Implement `generateMetadata` using `buildMetadata` with collection name and description
    - Fetch products by category slug from API in the server component
    - Render hero banner, breadcrumb, and pass initial products to client component
    - Add `JsonLd` with breadcrumb structured data
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 5.4, 6.3_

  - [x] 2.2 Create `src/app/(shop)/collections/[slug]/CollectionClient.tsx` client component
    - Mark with `"use client"`
    - Accept `initialProducts` and `slug` props
    - Handle filter interactions and pagination state
    - Preserve existing product grid layout and favorites functionality
    - _Requirements: 2.4_

  - [ ]* 2.3 Write property test for collection metadata generation
    - **Property 3: Collection metadata contains collection name**
    - **Validates: Requirements 5.4**

- [x] 3. Convert Product Detail Page to Server Component with ISR
  - [x] 3.1 Convert `src/app/(shop)/products/[slug]/page.tsx` to Server Component
    - Remove `"use client"` directive
    - Set `export const revalidate = 60`
    - Implement `generateMetadata` using `buildMetadata` with product name, price, and thumbnail as og:image
    - Fetch product data and variants from API using slug parameter
    - Call `notFound()` if API returns 404
    - Add `JsonLd` with product schema and breadcrumb schema
    - Render product name, images, price, description as server HTML
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 5.3, 5.7, 6.1, 6.2, 6.3, 6.6_

  - [x] 3.2 Create `src/app/(shop)/products/[slug]/ProductDetailClient.tsx` client component
    - Mark with `"use client"`
    - Accept `product` and `variants` props
    - Handle size/color selectors, add-to-cart button, image gallery interactions
    - _Requirements: 3.4_

  - [ ]* 3.3 Write property tests for product metadata and JSON-LD
    - **Property 2: Product metadata contains product name and price**
    - **Property 5: Product og:image matches thumbnail URL**
    - **Property 6: Product JSON-LD contains all required schema fields**
    - **Property 9: Sale price products include both prices in offers**
    - **Validates: Requirements 5.3, 5.7, 6.1, 6.2, 6.6**

- [x] 4. Convert Homepage to Server Component with ISR
  - [x] 4.1 Convert `src/app/(shop)/page.tsx` to Server Component
    - Remove `"use client"` directive
    - Set `export const revalidate = 120`
    - Implement `generateMetadata` using `buildMetadata` for homepage
    - Fetch featured products, categories, and blog posts from API at build time
    - Add `JsonLd` with WebSite schema including SearchAction
    - Render above-fold content (hero banner, trust items, category section) synchronously
    - Preserve all existing visual layout sections
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.5, 5.6, 6.4_

  - [x] 4.2 Extract interactive elements into client components
    - Create `CartToastClient` component with `"use client"` for cart notifications
    - Ensure animated sections delegate to client components without affecting server shell
    - _Requirements: 1.5_

  - [ ]* 4.3 Write property tests for homepage metadata and WebSite JSON-LD
    - **Property 1: Title follows site pattern**
    - **Property 4: All pages have complete Open Graph and Twitter Card fields**
    - **Validates: Requirements 5.1, 5.5, 5.6**

- [x] 5. Convert Blog Pages to Server Components with ISR
  - [x] 5.1 Convert blog listing page (`src/app/(shop)/blog/page.tsx`) to Server Component with ISR
    - Set `export const revalidate = 300`
    - Implement `generateMetadata` for blog listing page
    - Fetch blog posts from API
    - _Requirements: 4.1_

  - [x] 5.2 Convert blog post page (`src/app/(shop)/blog/[slug]/page.tsx`) to Server Component with ISR
    - Set `export const revalidate = 300`
    - Implement `generateMetadata` using blog post title, excerpt, and cover image
    - Fetch full blog post content from API
    - Call `notFound()` if API returns 404
    - Add `JsonLd` with Article schema
    - _Requirements: 4.2, 4.3, 4.4, 6.5_

  - [ ]* 5.3 Write property tests for blog metadata and Article JSON-LD
    - **Property 8: Article JSON-LD is valid for any blog post**
    - **Validates: Requirements 6.5**

- [x] 6. Checkpoint - Ensure all page conversions work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Add sitemap and robots.txt generation
  - [x] 7.1 Create dynamic sitemap (`src/app/sitemap.ts`)
    - Fetch all published products with lastModified dates
    - Fetch all published blog posts with lastModified dates
    - Include collection URLs: boot-nam, boot-nu, phu-kien, outfit
    - Include static pages: homepage, contact, policy, gallery
    - Set changeFrequency and priority: homepage daily/1.0, products weekly/0.8, collections weekly/0.9, blog weekly/0.6
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 7.2 Create robots.txt generator (`src/app/robots.ts`)
    - Allow all crawlers to access public pages
    - Disallow crawling of: /login, /signup, /user, /cart, /checkout
    - Include reference to sitemap URL
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 7.3 Write property test for sitemap completeness
    - **Property 10: All published entities appear in sitemap**
    - **Validates: Requirements 7.2, 7.4**

  - [ ]* 7.4 Write property test for breadcrumb JSON-LD validity
    - **Property 7: BreadcrumbList JSON-LD is valid for any path**
    - **Validates: Requirements 6.3**

- [x] 8. Implement on-demand revalidation endpoint
  - [x] 8.1 Create revalidation API route (`src/app/api/revalidate/route.ts`)
    - Expose POST handler at `/api/revalidate`
    - Validate `Authorization: Bearer <secret>` header against `REVALIDATION_SECRET` env var
    - Return 401 if token is missing or invalid
    - Accept JSON body with `path` (string) or `tag` (string)
    - Return 400 if both `path` and `tag` are missing
    - Call `revalidatePath(path)` or `revalidateTag(tag)` as appropriate
    - When revalidating a product path, also revalidate the `"collections"` tag
    - Return 200 with `{ revalidated: true }` on success
    - Return 500 with error message on failure
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 8.2 Write property tests for revalidation endpoint
    - **Property 11: Valid revalidation request triggers revalidation and returns 200**
    - **Property 12: Invalid auth token returns 401**
    - **Property 13: Product revalidation cascades to collection pages**
    - **Validates: Requirements 9.2, 9.4, 9.5, 9.6**

- [x] 9. Add performance optimizations
  - [x] 9.1 Implement lazy loading for below-fold homepage sections
    - Use `next/dynamic` with loading skeletons for: BootMaleSection, BootFemaleSection, GuideSection, NewsSection, FAQSection, PreFooter
    - Wrap each lazy section in `<Suspense>` with skeleton fallback
    - Ensure above-fold content (hero banner, trust items, category section) renders without lazy loading
    - Avoid importing motion/gsap in server-rendered shell
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 9.2 Add image optimization and layout shift prevention
    - Ensure all images use `next/image` with explicit width/height or fill + container aspect ratio
    - Set `priority={true}` on above-fold images
    - Add `sizes` attribute for responsive images
    - Display placeholder elements while images load to prevent CLS
    - _Requirements: 10.5_

- [x] 10. Add environment variable configuration
  - [x] 10.1 Add `REVALIDATION_SECRET` to environment configuration
    - Add `REVALIDATION_SECRET` to `.env.example` with a placeholder value
    - Document the variable's purpose in a comment
    - _Requirements: 9.4_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout — all implementations use TypeScript
- Existing `src/lib/api.ts` already uses `fetch` with `{ next: { revalidate } }`, so ISR data layer is partially in place
- Blog pages may already be partially server-rendered — verify before converting

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3", "4.1", "4.2"] },
    { "id": 4, "tasks": ["4.3", "5.1", "5.2"] },
    { "id": 5, "tasks": ["5.3", "7.1", "7.2"] },
    { "id": 6, "tasks": ["7.3", "7.4", "8.1"] },
    { "id": 7, "tasks": ["8.2", "9.1", "9.2"] },
    { "id": 8, "tasks": ["10.1"] }
  ]
}
```
