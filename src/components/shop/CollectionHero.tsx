'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight, Play, ShieldCheck, Award, RotateCcw, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionHeroProps {
  label: string;
  title: string;
  description: string;
  image: string;
  ctaPrimary: string;
  ctaSecondary: string;
  className?: string;
}

const trustBadges = [
  { icon: ShieldCheck, text: 'Da bò thật 100%' },
  { icon: Award, text: 'Bảo hành 12 tháng' },
  { icon: RotateCcw, text: 'Đổi trả 7 ngày' },
  { icon: Truck, text: 'Giao hàng toàn quốc' },
];

export const CollectionHero: React.FC<CollectionHeroProps> = ({
  label,
  title,
  description,
  image,
  ctaPrimary,
  ctaSecondary,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden glass-effect rounded-[2.5rem] border border-white/40',
        'flex flex-col md:flex-row items-center',
        className
      )}
    >
      {/* Left Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full md:w-1/2 px-8 py-10 md:px-12 md:py-16 z-10"
      >
        <span className="uppercase tracking-[0.2em] text-xs text-[#c8a47a] font-semibold block mb-3">
          {label}
        </span>

        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-[1.1] mb-4 whitespace-pre-line">
          {title}
        </h1>

        <p className="text-sm text-gray-500 whitespace-pre-line max-w-[320px] leading-relaxed mb-8">
          {description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-neutral-900 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-1 active:scale-95">
            {ctaPrimary}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="border border-gray-300 px-6 py-3 rounded-full text-sm flex items-center gap-2 hover:bg-gray-50 transition-all duration-300">
            <Play className="w-4 h-4" />
            {ctaSecondary}
          </button>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300" />
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400" />
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500" />
          </div>
          <span className="text-xs text-green-600 font-medium">
            2.000+ khách hàng tin tưởng lựa chọn
          </span>
        </div>
      </motion.div>

      {/* Right Image */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[400px] order-first md:order-none"
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority
        />
      </motion.div>

      {/* Trust Badges Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:block bg-white rounded-2xl shadow-lg p-4 z-20"
      >
        <div className="flex flex-col gap-3">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div key={index} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#c8a47a]" />
                </div>
                <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                  {badge.text}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
