"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  imageSrc: string;
  href?: string;
  className?: string;
}

/**
 * CategoryCard Component
 *
 * A premium minimalist card for product categories.
 * Features:
 * - 24px border radius as requested.
 * - Serif font for titles (Playfair Display style via font-serif/font-accent).
 * - Subtle hover lift effect and image scaling.
 * - Clean layout with text on left and product image on right.
 */
export const CategoryCard = ({
  title,
  imageSrc,
  href = "#",
  className,
}: CategoryCardProps) => {
  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={{
        rest: { y: 0, scale: 1 },
        hover: { y: -6, scale: 1.01 },
      }}
      transition={{ type: "spring", stiffness: 320, damping: 26, mass: 0.6 }}
      className={cn(
        "group relative w-full aspect-[324/203] overflow-hidden glass-effect border border-white/40 p-5 md:p-6 flex flex-row items-center justify-between cursor-pointer will-change-transform transition-all duration-100 ease-out hover:bg-white/80 hover:shadow-[0_26px_70px_rgba(0,0,0,0.14)] rounded-[24px]",
        className,
      )}
    >
      <Link
        href={href}
        aria-label={title}
        className="absolute inset-0 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-[20px]"
      >
        <span className="sr-only">{title}</span>
      </Link>

      {/* Left Content Section */}
      <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-[56%] pr-3">
        <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-text-main leading-snug tracking-tight">
          {title}
        </h3>

        {/* Divider + CTA (added vertical padding for readability) */}
        <div className="mt-4 md:mt-5 space-y-4">
          <div className="w-8 h-px bg-text-main/25 group-hover:w-12 transition-all duration-300 ease-out" />
          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-text-main/60 group-hover:text-text-main transition-colors duration-300">
            <span className="tracking-wide">Xem ngay</span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform duration-300 ease-out"
            />
          </div>
        </div>
      </div>

      {/* Right Image Section */}
      <div className="absolute right-0 bottom-0 top-0 w-[56%] md:w-[58%] flex items-end justify-end pointer-events-none z-0">
        <motion.div
          variants={{
            rest: { scale: 1, y: 0 },
            hover: { scale: 1.05, y: -2 },
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 22,
            mass: 0.55,
          }}
          className="relative w-full h-full transform-gpu will-change-transform"
        >
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="category-card-image object-contain object-right-bottom drop-shadow-[0_26px_40px_rgba(0,0,0,0.22)]"
            sizes="(max-width: 768px) 60vw, 40vw"
          />
        </motion.div>
      </div>

      {/* Subtle overlay: helps text readability while keeping image side transparent */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-r from-white/[0.20] via-white/[0.10] to-white/[0.00] group-hover:from-white/[0.24] group-hover:via-white/[0.12] transition-colors duration-300 ease-out" />
    </motion.div>
  );
};
