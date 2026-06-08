"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";

import {
  Product,
  getProductImageUrl,
  getDisplayPrice,
  hasDiscount,
} from "@/types/product";
import { Card } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (p: Product) => void;
  badge?: string;
  rating?: number;
  reviewsCount?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (p: Product) => void;
  href?: string;
  variant?: "default" | "bestSeller";
  priority?: boolean;
  className?: string;
}

export const ProductCard = ({
  product,
  onAddToCart,
  badge,
  rating,
  reviewsCount,
  isFavorite = false,
  onToggleFavorite,
  href,
  variant = "default",
  priority = false,
  className,
}: ProductCardProps) => {
  const price = getDisplayPrice(product);
  const priceText = formatCurrency(price);
  const imageUrl = getProductImageUrl(product);
  const productHref = href || `/san-pham/${product.slug}`;

  const handleAddToCart: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      // Navigate to product detail page for variant selection
      window.location.href = productHref;
    }
  };

  const handleToggleFavorite: React.MouseEventHandler<HTMLButtonElement> = (
    e,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(product);
  };

  const isBestSeller = variant === "bestSeller" || product.isBestSeller;
  const displayBadge =
    badge || (isBestSeller ? "BEST" : product.isNewArrival ? "NEW" : undefined);
  const isSoldOut =
    product.status === "SOLD_OUT" ||
    product.inventory?.soldOut ||
    product.stockSummary?.soldOut ||
    product.allVariantsSoldOut ||
    (product.variants &&
      product.variants.length > 0 &&
      product.variants.every((v: any) => v.inventory?.soldOut));

  const Media = (
    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50/50 cursor-pointer">
      <Image
        src={imageUrl}
        alt={product.image?.altText || product.name}
        fill
        priority={priority}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />
      {/* Top Bar - Float over image */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
        {displayBadge ? (
          <span className="badge-title px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-semibold rounded-full pointer-events-auto shadow-sm">
            {displayBadge}
          </span>
        ) : (
          <div />
        )}
        {isSoldOut && (
          <span className="px-2 py-1 bg-red-600/90 text-white text-[10px] font-semibold rounded-full pointer-events-auto shadow-sm tracking-wider">
            Hết hàng
          </span>
        )}
      </div>
    </div>
  );

  const Body = (
    <div className="flex flex-col gap-1 p-2">
      <h3
        className="content product-card__name text-sm text-black font-bold truncate leading-tight cursor-pointer"
        title={product.name}
      >
        {product.name}
      </h3>
      <div className="flex items-center gap-2 mt-0.5">
        <p className="text-sm text-black font-bold">{priceText}</p>
        {hasDiscount(product) && (
          <p className="text-xs text-gray-600 line-through">
            {formatCurrency(product.originalPrice ?? product.price ?? 0)}
          </p>
        )}
      </div>
      {typeof rating === "number" && (
        <div className="flex items-center gap-1 text-[10px] text-gray-600 mt-1">
          <Star size={12} className="fill-gray-600 text-gray-600" />
          <span>
            {rating.toFixed(1)}{" "}
            {typeof reviewsCount === "number" && `(${reviewsCount})`}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <Card
      className={cn(
        "group relative w-full bg-[#fcfcfc] rounded-2xl border border-gray-100 p-2 sm:p-3 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1",
        className,
      )}
    >
      <Link
        href={productHref}
        className="flex-1 flex flex-col focus-visible:outline-none"
      >
        {Media}
        <div className="relative flex-1">{Body}</div>
      </Link>

      {/* Cart Button */}
      {/* <button
        type="button"
        onClick={handleAddToCart}
        className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 w-10 h-10 bg-black rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-gray-800 hover:scale-110 active:scale-95 shadow-md z-20 cursor-pointer"
      >
        <ShoppingBag size={18} strokeWidth={2.5} />
      </button> */}
    </Card>
  );
};
