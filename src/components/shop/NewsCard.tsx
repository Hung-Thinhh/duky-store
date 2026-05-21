"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface NewsCardProps {
  id: string;
  image: string;
  date: {
    day: string;
    month: string;
  };
  category: string;
  title: string;
  slug: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  image,
  date,
  category,
  title,
  slug,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-[1.5rem] aspect-[3/4] cursor-pointer"
    >
      {/* Background Image */}
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Date Badge (Top Left) */}
      <div className="absolute top-4 left-4 z-20">
        <div className="flex flex-col items-center justify-center w-15 h-15 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md text-white shadow-xl">
          <span className="content text-2xl font-bold leading-none">{date.day}</span>
          <span className="content text-xs font-medium uppercase tracking-wider mt-1 opacity-80">
            {date.month}
          </span>
        </div>
      </div>

      {/* Content (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col items-start space-y-4">
        {/* Category Tag */}
        <span className="badge-sub text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">
          {category}
        </span>

        {/* Title */}
        <h3 className="sub-title text-white text-xl md:text-2xl font-semibold leading-snug line-clamp-2 group-hover:text-white/90 transition-colors">
          {title}
        </h3>

        {/* Action Link */}
        <Link
          href={`/news/${slug}`}
          className="content flex items-center gap-2 text-white text-sm font-semibold tracking-wider group/link"
        >
          <span className="relative overflow-hidden inline-block py-1">
            ĐỌC NGAY
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white transform -translate-x-full transition-transform duration-300 group-hover/link:translate-x-0" />
          </span>
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover/link:translate-x-1"
          />
        </Link>
      </div>
    </motion.div>
  );
};
