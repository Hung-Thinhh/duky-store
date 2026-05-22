'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Award } from 'lucide-react';
import { BannerProduct, Slide } from '../BannerProduct';
import { ProductCard } from '../ProductCard';
import { useProductsByCategories } from '@/hooks/useProductsByCategories';

const trustBadges = [
  {
    icon: <Star size={18} className="text-gray-600" />,
    value: "50+",
    label: "Mẫu boot nữ"
  },
  {
    icon: <ShieldCheck size={18} className="text-gray-600" />,
    value: "100%",
    label: "Da thật cao cấp"
  },
  {
    icon: <Award size={18} className="text-gray-600" />,
    value: "12 Tháng",
    label: "Bảo hành chính hãng"
  }
];

const femaleSlides: Slide[] = [
  {
    id: 1,
    label: "NEW COLLECTION",
    title: "Elegant Stiletto Boot",
    description: "Sự quyến rũ trong từng đường nét, nâng tầm vóc dáng.",
    image: "/assets/boot_slide_nu.png",
    ctaText: "Khám phá ngay"
  },
  {
    id: 2,
    label: "CHIC STYLE",
    title: "Minimalist Suede Boot",
    description: "Chất liệu da lộn mềm mại, mang lại cảm giác nhẹ nhàng.",
    image: "/assets/boot_slide_nu.png",
    ctaText: "Khám phá ngay"
  },
  {
    id: 3,
    label: "TRENDING NOW",
    title: "Chic Platform Boot",
    description: "Phong cách hiện đại, trẻ trung và đầy tự tin.",
    image: "/assets/boot_slide_nu.png",
    ctaText: "Khám phá ngay"
  }
];

export const BootFemaleSection: React.FC = () => {
  const { products, loading } = useProductsByCategories("boot-nu", 12);

  return (
    <section 
      className="pt-24 pb-8 px-6 overflow-hidden"
    >
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8">
          
          {/* Left Content */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
                BST Boot Nữ
              </h2>
              <div className="w-16 h-[1.5px] bg-gray-300" />
              <div className="space-y-1">
                <p className="text-sm md:text-base text-gray-600 font-medium">
                  Tôn dáng trong từng bước đi.
                </p>
                <p className="text-sm md:text-base text-gray-500">
                  Phong cách nữ tính, cá tính và hiện đại.
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {trustBadges.map((badge, index) => (
                <div 
                  key={index} 
                  className="glass-effect p-4 rounded-2xl border border-white/50 flex flex-row gap-2 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
                    {badge.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">{badge.value}</p>
                    <p className="content text-[10px] text-gray-500 uppercase tracking-tight font-medium">
                      {badge.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Banner */}
          <div className="lg:col-span-7">
            <BannerProduct slides={femaleSlides} />
          </div>

        </div>

        {/* Product Grid */}
        <div className="mt-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-2xl p-3">
                  <div className="aspect-square rounded-xl bg-gray-200 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))
            ) : (
              products.map((product) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                />
              ))
            )}
          </div>
        </div>

        {/* button */}
        <div className="mt-8 justify-center items-center flex">
          <Link 
            href="/collections/boot-nu"
            className="group glass-effect text-black px-10 py-4 btn text-sm font-semibold flex items-center gap-3 hover:bg-neutral-900 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-1 active:scale-95"
          >
            Xem thêm
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};
