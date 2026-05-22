import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchProductBySlug, fetchProductVariants } from '@/lib/api';
import { buildMetadata } from '@/lib/metadata';
import { buildProductJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { getDisplayPrice, getAllProductImageUrls, hasDiscount } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await fetchProductBySlug(slug);
    const price = getDisplayPrice(product);
    const imageUrl = product.thumbnailMedia?.secureUrl || product.thumbnailMedia?.url || undefined;

    return buildMetadata({
      title: product.name,
      description: `${product.name} - ${formatCurrency(price)}${product.desc ? `. ${product.desc}` : ''}`,
      path: `/products/${slug}`,
      image: imageUrl,
      type: 'product',
    });
  } catch {
    return buildMetadata({
      title: 'Sản phẩm',
      description: 'Chi tiết sản phẩm tại Duky Store',
      path: `/products/${slug}`,
    });
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product;
  let variants;

  try {
    [product, variants] = await Promise.all([
      fetchProductBySlug(slug),
      fetchProductVariants(slug),
    ]);
  } catch (err: unknown) {
    // If the API returns a 404, show the not found page
    if (err instanceof Error && err.message.includes('404')) {
      notFound();
    }
    throw err;
  }

  if (!product) {
    notFound();
  }

  // Build structured data
  const productJsonLd = buildProductJsonLd(product);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Sản phẩm', url: '/products' },
    { name: product.name, url: `/products/${slug}` },
  ]);

  // Server-rendered SEO content
  const displayPrice = getDisplayPrice(product);
  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const productImages = getAllProductImageUrls(product);
  const productHasDiscount = hasDiscount(product);

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* SEO-critical server-rendered content (visible to crawlers) */}
      <article itemScope itemType="https://schema.org/Product" className="sr-only" aria-hidden="true">
        <h1 itemProp="name">{product.name}</h1>
        {product.desc && <p itemProp="description">{product.desc}</p>}
        <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <meta itemProp="priceCurrency" content="VND" />
          <span itemProp="price" content={String(displayPrice)}>
            {formatCurrency(displayPrice)}
          </span>
          {productHasDiscount && (
            <span>Giá gốc: {formatCurrency(originalPrice)}</span>
          )}
          <link itemProp="availability" href="https://schema.org/InStock" />
        </div>
        {productImages.map((imgUrl, idx) => (
          <meta key={idx} itemProp="image" content={imgUrl} />
        ))}
        {product.sku && <meta itemProp="sku" content={product.sku} />}
      </article>

      {/* Interactive client component */}
      <ProductDetailClient product={product} variants={variants.data} />
    </>
  );
}
