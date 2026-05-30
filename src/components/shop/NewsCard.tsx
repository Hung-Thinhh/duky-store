"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

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
    <Link href={`/blog/${slug}`} className="block">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="group relative overflow-hidden rounded-[1.5rem] aspect-[3/4] cursor-pointer"
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent opacity-85 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute top-4 left-4 z-20">
          <div className="flex flex-col items-center justify-center w-15 h-15 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md text-white shadow-xl">
            <span className="content text-2xl font-bold leading-none">{date.day}</span>
            <span className="content text-xs font-medium uppercase tracking-wider mt-1 opacity-80">
              {date.month}
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col items-start space-y-3">
          <span className="badge-sub text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">
            {category}
          </span>

          <h3 className="content text-white text-lg md:text-xl font-semibold leading-tight line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)] group-hover:text-white transition-colors">
            {title}
          </h3>
        </div>
      </motion.article>
    </Link>
  );
};
