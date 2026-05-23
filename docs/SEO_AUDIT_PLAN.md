# Duky Store SEO Audit & Optimization Plan

Ngày audit: 2026-05-22
Repo: `Duky_store`
Môi trường kiểm tra: `npm run build`, `npx next start -p 3002`

## Tiến độ triển khai

### 2026-05-22 - Đã hoàn thành Phase 1

Đã làm:
- Thêm helper SEO dùng chung tại `src/lib/seo.ts`.
- Sửa root metadata trong `src/app/layout.tsx`:
  - title template.
  - default title/description đúng ngành hàng.
  - keywords, robots mặc định, Open Graph, Twitter metadata.
- Tách homepage từ client-only page sang server page + client component:
  - `src/app/(shop)/page.tsx`
  - `src/app/(shop)/ShopPageClient.tsx`
- Tách products listing từ client-only page sang server page + client component:
  - `src/app/(shop)/products/page.tsx`
  - `src/app/(shop)/products/ProductsPageClient.tsx`
- Thêm metadata/canonical cho:
  - `/`
  - `/products`
  - `/contact`
  - `/gallery`
  - `/policy`
- Thêm `noindex, follow` cho:
  - `/cart`
  - `/checkout`
  - `/checkout/success`
  - `/login`
  - `/signup`
  - `/user/**`
- Bỏ `typescript.ignoreBuildErrors` khỏi `next.config.js`; build hiện chạy TypeScript thật.

Kết quả verify:
- `npm run build` pass.
- `/` có title, description, canonical riêng.
- `/products` có title, description, canonical riêng.
- `/contact` có title, description, canonical riêng.
- `/cart`, `/checkout`, `/login`, `/user` có `noindex, follow`.
- `/sitemap.xml` vẫn trả về 419 URL.

### 2026-05-22 - Đã hoàn thành Phase 2 nền tảng Product SEO

Đã làm:
- Tách product detail từ client-only page sang server page + client component.
- Sau quyết định URL thuần Việt, implementation thật nằm tại:
  - `src/app/(shop)/san-pham/[slug]/page.tsx`
  - `src/app/(shop)/san-pham/[slug]/ProductDetailPageClient.tsx`
- Thêm `generateMetadata` cho product detail:
  - title theo sản phẩm/SEO data.
  - description fallback theo sản phẩm.
  - canonical self-reference theo route `/products/{slug}` tại thời điểm Phase 2.
  - robots theo trạng thái sản phẩm/SEO data.
  - Open Graph và Twitter image từ thumbnail sản phẩm.
- Thêm JSON-LD:
  - `Product`.
  - `Offer`.
  - `Brand`.
  - `BreadcrumbList`.
- Mở rộng type `Product` để nhận SEO fields từ backend nếu có.
- Ghi chú sau quyết định Phase 5: anh chọn URL thuần Việt `/san-pham/{slug}` làm canonical chuẩn. Phase 5 đã đổi lại canonical/sitemap/internal links theo hướng này.

Kết quả verify ban đầu với `/products/boot-nu-zip-10cm`:
- Title: `Boot nữ zip 10cm | Duky Store`.
- Description riêng theo sản phẩm.
- Robots: `index, follow`.
- Canonical lúc đó: `https://dukystore.com/products/boot-nu-zip-10cm`.
- Có `og:title`.
- Có `application/ld+json`.
- Có 1 H1 sản phẩm.

### 2026-05-22 - Đã hoàn thành Phase 3 Collection/Category SEO

Đã làm:
- Tách collection page từ client-only page sang server page + client component:
  - `src/app/(shop)/collections/[slug]/page.tsx`
  - `src/app/(shop)/collections/[slug]/CollectionPageClient.tsx`
- Tạo nguồn dữ liệu SEO category dùng chung:
  - `src/lib/collection-seo.ts`
- Thêm `generateMetadata` cho 4 collection:
  - `/collections/boot-nam`
  - `/collections/boot-nu`
  - `/collections/phu-kien`
  - `/collections/outfit`
- Thêm H1 text thật trên hero, không còn chỉ có chữ nằm trong ảnh.
- Thêm đoạn intro category dưới breadcrumb để tăng nội dung indexable.
- Thêm JSON-LD cho collection:
  - `CollectionPage`.
  - `BreadcrumbList`.
  - `ItemList` khi API trả được sản phẩm đầu danh mục.
- Thêm `generateStaticParams` để Next prerender 4 collection route.
- Cập nhật `src/app/sitemap.ts` để sitemap chứa 4 collection URL.

Kết quả verify với `/collections/boot-nu`:
- Title: `Giay Boot Nu Cao Cap | Duky Store`.
- Description riêng theo category.
- Robots: `index, follow`.
- Canonical: `https://dukystore.com/collections/boot-nu`.
- Có `og:title`.
- Có `application/ld+json`.
- Có H1 thật: `GIAY BOOT NU CAO CAP`.
- Sitemap tăng từ 419 URL lên 423 URL, có đủ:
  - `https://dukystore.com/collections/boot-nam`
  - `https://dukystore.com/collections/boot-nu`
  - `https://dukystore.com/collections/phu-kien`
  - `https://dukystore.com/collections/outfit`
- Unknown collection trả 404.

### 2026-05-22 - Đã hoàn thành Phase 4 Blog H1/content cleanup

Đã làm:
- Thêm helper xử lý HTML bài viết:
  - `src/lib/blog-content.ts`
- Trước khi render nội dung blog bằng `dangerouslySetInnerHTML`, HTML được xử lý qua `sanitizeBlogHtml`.
- Các H1 trong `post.content` được chuyển thành H2 để page chỉ còn H1 chính là title bài viết.
- Gỡ các khối/tag nguy hiểm cơ bản trong content:
  - `script`
  - `style`
  - `iframe`
  - `object`
  - `embed`
  - form controls
- Gỡ event handler attributes như `onclick`, `onerror`.
- Gỡ URL nguy hiểm trong `href`/`src` như `javascript:`, `vbscript:`, `data:text/html`.
- Gỡ inline `style` từ content để tránh HTML import phá layout.
- Metadata description/schema text cũng dùng text đã qua cleanup để tránh script/style text lọt vào description.

Kết quả verify với `/blog/boot-nu-cho-phai-dep`:
- Trước audit từng thấy 2 H1.
- Sau fix: `h1=1`.
- Content heading trong bài được chuyển thành H2.
- Title, description, canonical và JSON-LD vẫn còn.
- Test sanitizer bằng HTML giả:
  - `<h1>` -> `<h2>`.
  - `<script>` bị bỏ.
  - `onerror` bị bỏ.
  - `javascript:` bị bỏ.

### 2026-05-22 - Đã cập nhật định hướng Phase 5 theo URL thuần Việt

Quyết định:
- URL listing sản phẩm vẫn là `/products`.
- URL detail sản phẩm chuẩn SEO/canonical là `/san-pham/{slug}`.
- URL `/products/{slug}` chỉ là route cũ/kỹ thuật và redirect permanent về `/san-pham/{slug}`.

Đã làm:
- Thêm route detail tiếng Việt:
  - `src/app/(shop)/san-pham/[slug]/page.tsx`
- Chuyển implementation thật của product detail từ `products/[slug]` sang `san-pham/[slug]`.
- Xóa route page `products/[slug]`; route này hiện chỉ còn redirect bằng `next.config.js`.
- Đổi canonical product detail sang:
  - `https://dukystore.com/san-pham/{slug}`
- Đổi sitemap product detail sang `/san-pham/{slug}`.
- Đổi internal links sản phẩm sang `/san-pham/{slug}` ở:
  - Product card.
  - Search tool.
  - Recommend section.
  - Checkout quick-buy item link.
  - Collection `ItemList` schema.
- Thêm redirect permanent trong `next.config.js`:
  - `/products/:slug` -> `/san-pham/:slug`

Kết quả verify:
- `npm run build` pass.
- Build có route `ƒ /san-pham/[slug]`.
- Build không còn route page `ƒ /products/[slug]`.
- Request `/products/boot-nu-zip-10cm` trả permanent redirect tới `/san-pham/boot-nu-zip-10cm`.

Ghi chú test:
- Local API `http://localhost:4000/api/v1` không chạy tại thời điểm test nên chưa verify được HTML detail `/san-pham/boot-nu-zip-10cm` và sitemap product URLs bằng dữ liệu live trong lượt này.

Việc còn lại:
- Phase 5: chạy lại sitemap/detail verification khi backend API local hoạt động, và kiểm tra thêm redirect URL cũ nếu còn dạng khác.
- Phase 6: Core Web Vitals.
- Phase 7: Organization/LocalBusiness/WebSite schema.
- Phase 8: SEO regression tests.

## Tóm tắt

Trạng thái hiện tại: đã hoàn thành nền Phase 1, Product SEO Phase 2, Collection SEO Phase 3, Blog cleanup Phase 4 và đã chuyển định hướng product canonical sang `/san-pham/{slug}`. Còn cần verify full bằng backend API live, rồi xử lý performance.

Điểm đã có:
- `robots.txt` hoạt động và trỏ về sitemap.
- `sitemap.xml` hoạt động, local audit trả về 419 URL gồm static pages, product pages và blog pages.
- Blog detail đã có `generateMetadata`, canonical, Open Graph, Twitter metadata và JSON-LD `BlogPosting` + `BreadcrumbList`.
- Blog detail đã cleanup HTML content để page chỉ còn 1 H1.
- Product detail đã có metadata động server-side, canonical, Open Graph, Twitter metadata, Product JSON-LD và Breadcrumb JSON-LD.
- Collection/category pages đã có metadata riêng, canonical, H1 thật, intro content, JSON-LD và sitemap URLs.
- Cart, checkout, login, signup và user pages đã có `noindex, follow`.
- Ảnh chính đa số dùng `next/image`, có `alt`, có `priority` cho hero/LCP.

Vấn đề lớn cần xử lý:
- Một số page còn lại cần rà soát metadata riêng khi mở rộng nội dung/keyword.
- `images.remotePatterns` cho phép `https://**`, quá rộng, khó kiểm soát hiệu năng và nguồn ảnh.
- Chưa có schema Organization, WebSite/SearchAction và ItemList/Breadcrumb đầy đủ cho category.
- Chưa có kiểm thử SEO tự động để bắt thiếu title/canonical/schema trước deploy.

## Bằng chứng đã kiểm tra

- Build production pass: `npm run build`, có chạy TypeScript thật.
- Server local port 3001 bị bận, đã kiểm tra bằng `npx next start -p 3002`.
- `/robots.txt` trả về:
  - `User-Agent: *`
  - `Allow: /`
  - `Sitemap: https://dukystore.com/sitemap.xml`
- `/sitemap.xml` trả về 423 URL sau khi thêm collection routes.
- Product detail canonical chuẩn hiện là `/san-pham/{slug}`; `/products/{slug}` redirect permanent về `/san-pham/{slug}`.
- `/products` và `/contact` hiện có metadata riêng; `/checkout` có `noindex, follow`.
- `/collections/boot-nu` hiện có title/description/canonical/JSON-LD/H1 riêng.
- `/blog/boot-nu-cho-phai-dep` có title, description, canonical, OG, JSON-LD và sau cleanup chỉ còn 1 H1.

## Phase 1 - Sửa nền SEO blocking

Mục tiêu: đảm bảo page quan trọng có metadata đúng và page không cần SEO không bị index.

Việc cần làm:
- Tạo helper SEO dùng chung:
  - `siteUrl()`
  - `absoluteUrl()`
  - `cleanText()`
  - `truncateMeta()`
  - `buildCanonical()`
  - JSON-LD script component an toàn.
- Sửa root metadata:
  - Title template: `%s | Duky Store`
  - Default title tiếng Việt đúng ngành hàng.
  - Default description không dùng câu placeholder/landing-page/glassmorphism.
  - Thêm `openGraph`, `twitter`, `robots` mặc định.
- Thêm `noindex, follow` cho:
  - `/cart`
  - `/checkout`
  - `/checkout/success`
  - `/login`
  - `/signup`
  - `/user/**`
- Thêm canonical cho static commercial pages:
  - `/`
  - `/products`
  - `/blog`
  - `/gallery`
  - `/contact`
  - `/policy`
- Bỏ `ignoreBuildErrors: true` sau khi fix type errors liên quan.

Kết quả mong muốn:
- Không còn page thương mại dùng metadata mặc định sai ngữ cảnh.
- Trang tài khoản/checkout không bị index.
- Build vẫn pass khi bật type checking.

## Phase 2 - Product SEO chuẩn e-commerce

Mục tiêu: sản phẩm có thể rank và hiển thị rich result.

Việc cần làm:
- Tách product detail thành server wrapper + client detail component tại `/san-pham/[slug]`.
- Implement `generateMetadata` cho product:
  - Title từ `product.seo.metaTitle` hoặc `product.name`.
  - Description từ SEO DB, mô tả sản phẩm, hoặc fallback theo category/price.
  - Canonical `/products/{slug}`.
  - OG/Twitter image từ product thumbnail.
  - `robots` theo trạng thái publish/visibility nếu backend có field.
- Thêm Product JSON-LD:
  - `Product`
  - `Offer`
  - `price`
  - `priceCurrency: VND`
  - `availability`
  - `image`
  - `sku`
  - `brand: Duky Store`
- Thêm Breadcrumb JSON-LD cho product.
- Đảm bảo sản phẩm không có slug, unpublished, draft, private không vào sitemap.

Kết quả mong muốn:
- `/san-pham/{slug}` có title riêng, description riêng, canonical, OG image, Product schema.

## Phase 3 - Category/Collection SEO

Mục tiêu: category page như boot nam, boot nữ, phụ kiện, outfit có khả năng rank theo nhóm keyword.

Việc cần làm:
- Tách `/collections/[slug]` thành server page + client grid.
- Thêm `generateMetadata` dựa theo `COLLECTION_META` hoặc API category SEO.
- Render H1 text thật trên page, không chỉ nằm trong ảnh hero.
- Thêm mô tả category 150-300 chữ dưới hero hoặc trên grid.
- Thêm ItemList JSON-LD cho danh sách sản phẩm đầu trang.
- Thêm canonical `/collections/{slug}`.
- Cập nhật sitemap thêm các collection canonical URL.

Kết quả mong muốn:
- Category page có title/description/H1/canonical/schema riêng.
- Sitemap có collection pages.

## Phase 4 - Blog SEO cleanup

Mục tiêu: giữ phần blog đang tốt, sửa lỗi cấu trúc heading và content cũ.

Việc cần làm:
- Sanitize hoặc transform HTML bài viết từ DB:
  - H1 trong `post.content` đổi thành H2/H3 khi page đã có H1 riêng.
  - Chặn script/event handler không mong muốn.
- Audit duplicate/cannibalization trong blog:
  - Nhiều bài cùng chủ đề `cách phối đồ boot`, `bảo quản giày da`, `top boot 2024`.
  - Gộp hoặc canonical hóa các bài quá trùng.
- Refresh bài cũ 2022-2024:
  - Update năm, sản phẩm liên quan, internal links.
  - Thêm author/profile và ngày cập nhật rõ.
- Thêm Article schema kiểm tra qua Rich Results Test.

Kết quả mong muốn:
- Mỗi blog detail chỉ có 1 H1.
- Blog không kéo chất lượng site xuống vì nội dung cũ/trùng.

## Phase 5 - Sitemap, robots, redirects

Mục tiêu: index đúng URL cần index, không lãng phí crawl budget.

Việc cần làm:
- Sitemap chỉ chứa canonical, indexable URL.
- Thêm collection pages vào sitemap.
- Không đưa cart/checkout/auth/user vào sitemap.
- Nếu backend có `Redirect`, tạo middleware/server route xử lý 301 từ URL cũ sang URL mới.
- Với quyết định URL thuần Việt, chuẩn hiện tại là:
  - `/san-pham/{slug}` cho product detail.
  - `/products` cho product listing.
  - `/products/{slug}` redirect permanent về `/san-pham/{slug}`.
- Nếu có dữ liệu `SitemapEntry`/`RobotsRule` từ backend, quyết định rõ:
  - FE tự generate từ API.
  - Hoặc backend quản trị SEO và FE consume.
- Thêm fallback khi API sitemap lỗi:
  - Không được silently trả sitemap chỉ có static routes mà không log cảnh báo.

Kết quả mong muốn:
- Sitemap sạch, đầy đủ, và phản ánh đúng trạng thái indexable.

## Phase 6 - Performance SEO/Core Web Vitals

Mục tiêu: cải thiện LCP, CLS, INP cho trang bán hàng.

Việc cần làm:
- Kiểm tra LCP trên:
  - `/`
  - `/products`
  - `/san-pham/{slug}`
  - `/collections/boot-nu`
- Rà soát hero images:
  - Đúng dimensions/aspect ratio.
  - Không dùng ảnh quá lớn.
  - Ưu tiên WebP/AVIF.
- Giới hạn `remotePatterns`, không dùng wildcard `https://**`.
- Audit animation/motion ở homepage để tránh INP/CPU cao.
- Bổ sung cache headers/CDN cho ảnh nếu deploy qua object storage.

Kết quả mong muốn:
- LCP < 2.5s, INP < 200ms, CLS < 0.1 trên mobile thực tế.

## Phase 7 - Local business and trust SEO

Mục tiêu: tăng tín hiệu tin cậy cho thương hiệu bán lẻ.

Việc cần làm:
- Thêm Organization/LocalBusiness JSON-LD ở root:
  - name
  - logo
  - URL
  - social profiles
  - phone
  - address nếu có
- Thêm WebSite JSON-LD + SearchAction nếu search URL ổn định.
- Contact page thêm metadata riêng và LocalBusiness schema.
- Policy page bổ sung title/description chuẩn, nội dung đổi trả/bảo hành/giao hàng rõ.

Kết quả mong muốn:
- Google hiểu Duky Store là thương hiệu/shop thật, không chỉ là catalog.

## Phase 8 - SEO regression tests

Mục tiêu: deploy không làm rơi title/canonical/schema.

Việc cần làm:
- Thêm script audit local:
  - Build app.
  - Start server.
  - Check các URL mẫu có title, description, canonical, H1.
  - Check noindex cho auth/checkout/user pages.
  - Check JSON-LD parse được.
- Thêm test URL mẫu:
  - `/`
  - `/products`
  - `/san-pham/boot-nu-zip-10cm`
  - `/collections/boot-nu`
  - `/blog/boot-nu-cho-phai-dep`
  - `/cart`
  - `/checkout`

Kết quả mong muốn:
- Có checklist tự động trước khi deploy.

## Thứ tự ưu tiên đề xuất

1. Phase 1: root/static/noindex/type-check.
2. Phase 2: product detail SEO.
3. Phase 3: collection/category SEO.
4. Phase 5: sitemap/redirect cleanup.
5. Phase 4: blog heading/content cleanup.
6. Phase 6: Core Web Vitals.
7. Phase 7: local business trust.
8. Phase 8: regression tests.

## Definition of Done

- Mỗi indexable URL có title riêng, meta description riêng, canonical self-reference.
- Product pages có Product/Offer JSON-LD hợp lệ.
- Blog pages có Article/BlogPosting JSON-LD hợp lệ và chỉ 1 H1.
- Collection pages có H1 text, mô tả category, canonical và nằm trong sitemap.
- Non-SEO pages có `noindex`.
- Sitemap chỉ chứa URL indexable/canonical.
- `npm run build` pass với type checking bật.
- Rich Results Test pass cho product và blog mẫu.
- PageSpeed/Core Web Vitals đạt ngưỡng tốt trên mobile cho các page chính.
