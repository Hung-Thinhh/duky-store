# Requirements Document

## Introduction

This feature converts the Duky Store Next.js frontend from fully client-side rendered pages to Server Components with Incremental Static Regeneration (ISR), adds comprehensive SEO metadata (Open Graph, JSON-LD structured data), generates a dynamic sitemap and robots.txt, and optimizes page load performance through lazy loading and bundle size reduction. The goal is to improve search engine discoverability, social sharing previews, and Core Web Vitals scores.

## Glossary

- **ISR_Engine**: The Next.js Incremental Static Regeneration system that statically generates pages at build time and revalidates them at configurable intervals
- **Metadata_Generator**: The Next.js `generateMetadata` async function that produces page-level SEO tags (title, description, Open Graph, Twitter cards)
- **Structured_Data_Renderer**: A component or utility that outputs JSON-LD schema markup into the page `<head>` for search engine rich results
- **Sitemap_Generator**: A Next.js App Router `sitemap.ts` file that dynamically produces an XML sitemap from product, collection, and blog data
- **Robots_Generator**: A Next.js App Router `robots.ts` file that outputs crawl directives for search engines
- **Revalidation_Endpoint**: A Next.js API route that accepts authenticated webhook requests and triggers on-demand ISR revalidation for specific paths
- **Server_Component**: A React Server Component that renders on the server, enabling data fetching at build/request time without shipping JavaScript to the client
- **Client_Component**: A React component marked with "use client" that hydrates on the browser and supports interactivity (state, effects, event handlers)
- **Homepage**: The root shop page at `/` displaying hero banner, category sections, featured products, and FAQ
- **Collection_Page**: A dynamic page at `/collections/[slug]` displaying filtered products for a category
- **Product_Detail_Page**: A dynamic page at `/products/[slug]` displaying full product information, variants, and recommendations
- **Blog_Page**: The blog listing page at `/blog` and individual blog post pages at `/blog/[slug]`
- **API_Backend**: The NestJS backend at `localhost:4000/api/v1` serving product, category, and blog data

## Requirements

### Requirement 1: Convert Homepage to Server Component with ISR

**User Story:** As a search engine crawler, I want the homepage content to be pre-rendered as static HTML, so that I can index the full page content without executing JavaScript.

#### Acceptance Criteria

1. THE ISR_Engine SHALL serve the Homepage as a statically generated page with a revalidation interval of 120 seconds
2. WHEN a request arrives for the Homepage after the revalidation interval has elapsed, THE ISR_Engine SHALL regenerate the page in the background while serving the stale version to the current request
3. THE Homepage Server_Component SHALL fetch featured products, categories, and blog posts from the API_Backend at build time and during revalidation
4. WHILE the Homepage is rendered as a Server_Component, THE Homepage SHALL preserve all existing visual layout and content sections (hero banner, categories, boot male/female, guide, news, FAQ, pre-footer)
5. WHEN interactive elements are needed (cart toast, animations), THE Homepage SHALL delegate those to nested Client_Components without affecting the server-rendered shell

### Requirement 2: Convert Collection Pages to Server Components with ISR

**User Story:** As a search engine crawler, I want collection pages to contain pre-rendered product listings in the HTML, so that all products are indexable without client-side JavaScript execution.

#### Acceptance Criteria

1. THE ISR_Engine SHALL serve each Collection_Page as a statically generated page with a revalidation interval of 60 seconds
2. WHEN a request arrives for a Collection_Page, THE Server_Component SHALL fetch products for that category from the API_Backend using the slug parameter
3. THE Collection_Page SHALL render the product grid, hero banner, and breadcrumb navigation as server-rendered HTML
4. WHEN a user interacts with filters or pagination, THE Collection_Page SHALL delegate filtering and pagination state to a nested Client_Component
5. THE ISR_Engine SHALL pre-generate static paths for the known parent categories: boot-nam, boot-nu, phu-kien, outfit

### Requirement 3: Convert Product Detail Pages to Server Components with ISR

**User Story:** As a potential customer sharing a product link on social media, I want the product page to have pre-rendered metadata and content, so that social platforms display rich previews with product images and prices.

#### Acceptance Criteria

1. THE ISR_Engine SHALL serve each Product_Detail_Page as a statically generated page with a revalidation interval of 60 seconds
2. WHEN a request arrives for a Product_Detail_Page, THE Server_Component SHALL fetch product data and variants from the API_Backend using the slug parameter
3. THE Product_Detail_Page SHALL render product name, images, price, and description as server-rendered HTML
4. WHEN a user interacts with size/color selectors or the add-to-cart button, THE Product_Detail_Page SHALL delegate those interactions to nested Client_Components
5. IF the API_Backend returns a 404 for a product slug, THEN THE Product_Detail_Page SHALL return a Next.js `notFound()` response

### Requirement 4: Convert Blog Pages to Server Components with ISR

**User Story:** As a content marketer, I want blog posts to be fully indexed by search engines with proper metadata, so that organic traffic from informational queries reaches the store.

#### Acceptance Criteria

1. THE ISR_Engine SHALL serve the Blog_Page listing with a revalidation interval of 300 seconds
2. THE ISR_Engine SHALL serve individual blog post pages at `/blog/[slug]` with a revalidation interval of 300 seconds
3. WHEN a request arrives for a blog post page, THE Server_Component SHALL fetch the full blog post content from the API_Backend
4. IF the API_Backend returns a 404 for a blog slug, THEN THE Blog_Page SHALL return a Next.js `notFound()` response

### Requirement 5: Generate Dynamic SEO Metadata for All Pages

**User Story:** As a store owner, I want every page to have unique, descriptive title tags and meta descriptions, so that search engine result pages display compelling snippets that drive clicks.

#### Acceptance Criteria

1. THE Metadata_Generator SHALL produce a unique `<title>` tag for each page following the pattern: `{Page Title} | Duky Store`
2. THE Metadata_Generator SHALL produce a unique `<meta name="description">` tag for each page with content relevant to that page
3. WHEN generating metadata for a Product_Detail_Page, THE Metadata_Generator SHALL include the product name, price, and a short description in the title and description tags
4. WHEN generating metadata for a Collection_Page, THE Metadata_Generator SHALL include the collection name and a summary of available products
5. THE Metadata_Generator SHALL produce Open Graph tags (og:title, og:description, og:image, og:url, og:type) for every public page
6. THE Metadata_Generator SHALL produce Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image) for every public page
7. WHEN generating metadata for a Product_Detail_Page, THE Metadata_Generator SHALL set og:image to the product thumbnail URL

### Requirement 6: Add JSON-LD Structured Data

**User Story:** As a store owner, I want product pages to display rich results in Google (price, availability, ratings), so that search listings stand out and attract more clicks.

#### Acceptance Criteria

1. THE Structured_Data_Renderer SHALL output a valid `Product` schema (schema.org) JSON-LD block on every Product_Detail_Page
2. THE Structured_Data_Renderer SHALL include name, description, image, sku, brand, and offers (price, currency, availability) in the Product schema
3. THE Structured_Data_Renderer SHALL output a valid `BreadcrumbList` schema JSON-LD block on Collection_Pages and Product_Detail_Pages
4. THE Structured_Data_Renderer SHALL output a valid `WebSite` schema JSON-LD block with a SearchAction on the Homepage
5. THE Structured_Data_Renderer SHALL output a valid `Article` schema JSON-LD block on individual blog post pages
6. WHEN a product has a sale price, THE Structured_Data_Renderer SHALL include both the original price and the sale price in the offers array

### Requirement 7: Generate Dynamic Sitemap

**User Story:** As a store owner, I want search engines to discover all product, collection, and blog pages automatically, so that new content gets indexed quickly without manual submission.

#### Acceptance Criteria

1. THE Sitemap_Generator SHALL produce a valid XML sitemap at `/sitemap.xml`
2. THE Sitemap_Generator SHALL include all published product URLs with their `lastModified` dates
3. THE Sitemap_Generator SHALL include all collection URLs (boot-nam, boot-nu, phu-kien, outfit)
4. THE Sitemap_Generator SHALL include all published blog post URLs with their `lastModified` dates
5. THE Sitemap_Generator SHALL include static pages: homepage, contact, policy, gallery
6. THE Sitemap_Generator SHALL set appropriate `changeFrequency` and `priority` values (homepage: daily/1.0, products: weekly/0.8, collections: weekly/0.9, blog: weekly/0.6)

### Requirement 8: Generate Robots.txt

**User Story:** As a store owner, I want to control which pages search engines crawl, so that crawl budget is spent on valuable pages and private routes are excluded.

#### Acceptance Criteria

1. THE Robots_Generator SHALL produce a valid `robots.txt` at the site root
2. THE Robots_Generator SHALL allow all crawlers to access public pages (homepage, collections, products, blog, contact, policy, gallery)
3. THE Robots_Generator SHALL disallow crawling of private routes: `/login`, `/signup`, `/user`, `/cart`, `/checkout`
4. THE Robots_Generator SHALL include a reference to the sitemap URL

### Requirement 9: On-Demand Revalidation Endpoint

**User Story:** As a store admin, I want product page caches to update instantly when I modify a product in the admin panel, so that customers always see current prices and availability without waiting for the ISR timer.

#### Acceptance Criteria

1. THE Revalidation_Endpoint SHALL expose a POST route at `/api/revalidate`
2. WHEN a valid revalidation request is received, THE Revalidation_Endpoint SHALL trigger ISR revalidation for the specified path or tag
3. THE Revalidation_Endpoint SHALL accept a JSON body containing `path` (string) or `tag` (string) to identify what to revalidate
4. IF the request does not include a valid secret token in the `Authorization` header, THEN THE Revalidation_Endpoint SHALL return a 401 Unauthorized response
5. WHEN revalidation is triggered for a product, THE Revalidation_Endpoint SHALL revalidate both the product detail page and any collection pages that include that product
6. WHEN revalidation completes successfully, THE Revalidation_Endpoint SHALL return a 200 response with `{ revalidated: true }`

### Requirement 10: Optimize Page Load Performance

**User Story:** As a mobile user on a slow connection, I want the page to load quickly and become interactive fast, so that I can browse products without frustration.

#### Acceptance Criteria

1. THE Homepage SHALL lazy-load below-fold sections (BootMaleSection, BootFemaleSection, GuideSection, NewsSection, FAQSection, PreFooter) using dynamic imports or Suspense boundaries
2. WHEN a below-fold section enters the viewport, THE Homepage SHALL load and render that section
3. THE Server_Component pages SHALL avoid importing client-side libraries (motion, gsap) in the server-rendered shell to reduce the initial JavaScript bundle
4. THE Homepage SHALL load above-fold content (hero banner, trust items, category section) without lazy loading to ensure fast Largest Contentful Paint
5. WHILE images are loading, THE pages SHALL display appropriately sized placeholder elements to prevent Cumulative Layout Shift
