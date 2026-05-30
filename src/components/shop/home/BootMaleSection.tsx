"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Award } from "lucide-react";
import { BannerProduct, Slide } from "../BannerProduct";
import { ProductCard } from "../ProductCard";
import { useProductsByCategories } from "@/hooks/useProductsByCategories";
import { Product, getProductImageUrl } from "@/types/product";

const trustBadges = [
  {
    icon: <Star size={18} className="text-gray-600" />,
    value: "50+",
    label: "Mẫu boot nam",
  },
  {
    icon: <ShieldCheck size={18} className="text-gray-600" />,
    value: "100%",
    label: "Da thật cao cấp",
  },
  {
    icon: <Award size={18} className="text-gray-600" />,
    value: "12 Tháng",
    label: "Bảo hành chính hãng",
  },
];

function getSlideLabel(product: Product): string {
  if (product.isNewArrival) return "NEW ARRIVAL";
  if (product.isBestSeller) return "BEST SELLER";
  if (product.isFeatured) return "FEATURED STYLE";
  return "BOOT NAM";
}

function getSlideDescription(product: Product): string {
  const fromLegacyDesc = product.desc?.trim();
  if (fromLegacyDesc) return fromLegacyDesc;
  return "Thiết kế chuẩn form, chất liệu cao cấp và dễ phối cho mọi outfit.";
}

export const BootMaleSection: React.FC = () => {
  const { products, loading } = useProductsByCategories("boot-nam", 12);

  const maleSlides = useMemo<Slide[]>(() => {
    return products
      .filter((product) => Boolean(product.slug))
      .slice(0, 3)
      .map((product, index) => ({
        id: index + 1,
        label: getSlideLabel(product),
        title: product.name,
        description: getSlideDescription(product),
        image: getProductImageUrl(product),
        ctaText: "Khám phá chi tiết",
        ctaHref: `/products/${product.slug}`,
      }));
  }, [products]);

  return (
    <section className="pt-24 pb-8 px-6 overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8">
          {/* Left Content */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
                BST Boot Nam
              </h2>
              <div className="w-16 h-[1.5px] bg-gray-300" />
              <div className="space-y-1">
                <p className="text-sm md:text-base text-gray-600 font-medium">
                  Bản lĩnh trong từng bước đi.
                </p>
                <p className="text-sm md:text-base text-gray-500">
                  Phong cách nam tính, form chuẩn, dễ phối mọi outfit.
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="glass-effect p-4 rounded-2xl border border-white/50 flex flex-row gap-2 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
                    {badge.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">
                      {badge.value}
                    </p>
                    <p className="text-[10px] content text-gray-500 uppercase tracking-tight font-medium">
                      {badge.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Banner */}
          <div className="lg:col-span-7">
            {loading ? (
              <div
                className="glass-effect rounded-[2.5rem] border border-white/40 animate-pulse bg-white/30"
                style={{ aspectRatio: "778 / 352" }}
              />
            ) : maleSlides.length > 0 ? (
              <BannerProduct slides={maleSlides} />
            ) : (
              <div
                className="glass-effect rounded-[2.5rem] border border-white/40 p-10 flex items-center"
                style={{ aspectRatio: "778 / 352" }}
              >
                <p className="text-gray-600">
                  Chưa có sản phẩm Boot Nam để hiển thị.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-100 rounded-2xl p-3"
                  >
                    <div className="aspect-square rounded-xl bg-gray-200 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))
              : products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>

        {/* button */}
        <div className="mt-8 justify-center items-center flex">
          <Link
            href="/collections/boot-nam"
            className="group glass-effect text-black px-10 py-4 btn text-sm font-semibold flex items-center gap-3 hover:bg-neutral-900 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-1 active:scale-95"
          >
            Xem thêm
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};
