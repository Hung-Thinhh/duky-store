"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { BlogPost } from "@/types/blog";

interface BlogCardProps {
  post: BlogPost;
  variant?: "featured" | "default";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getDateParts(dateStr: string | null): { day: string; month: string } {
  if (!dateStr) return { day: "--", month: "---" };
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const months = [
    "Th1",
    "Th2",
    "Th3",
    "Th4",
    "Th5",
    "Th6",
    "Th7",
    "Th8",
    "Th9",
    "Th10",
    "Th11",
    "Th12",
  ];
  const month = months[date.getMonth()];
  return { day, month };
}

export function BlogCard({ post, variant = "default" }: BlogCardProps) {
  const coverUrl = post.coverMedia?.secureUrl || post.coverMedia?.url;
  const dateParts = getDateParts(post.publishedAt);

  if (variant === "featured") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group block relative overflow-hidden rounded-2xl bg-gray-900 aspect-[16/9] md:aspect-[21/9]"
      >
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={post.coverMedia?.altText || post.title}
            fill
            className="object-contain opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
            sizes="(max-width: 768px) 100vw, 900px"
            priority
          />
        )}
        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 text-center min-w-[52px]">
          <span className="block text-lg font-bold text-white leading-tight">
            {dateParts.day}
          </span>
          <span className="block text-[10px] font-semibold uppercase text-gray-300 tracking-wider">
            {dateParts.month}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          {post.categories.length > 0 && (
            <span className="inline-block px-2 py-1 my-2 text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white rounded-full mb-3">
              {post.categories[0].name}
            </span>
          )}
          <h2 className="content text-xl md:text-3xl font-bold text-white mb-3 line-clamp-2 group-hover:underline decoration-2 underline-offset-4">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-sm md:text-base text-gray-200 line-clamp-2 mb-4 max-w-2xl">
              {post.excerpt}
            </p>
          )}
        </div>
      </Link>
    );
  }
 
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={post.coverMedia?.altText || post.title}
            fill
            className="object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        {/* Date Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-xl px-3.5 py-2 text-center min-w-[56px]">
          <span className="block text-xl font-bold text-white leading-tight">
            {dateParts.day}
          </span>
          <span className="block text-[11px] font-semibold uppercase text-gray-300 tracking-wider">
            {dateParts.month}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-4 flex-1">
        <div>
          {/* Categories */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {post.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="content text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-black mb-2 leading-snug">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
