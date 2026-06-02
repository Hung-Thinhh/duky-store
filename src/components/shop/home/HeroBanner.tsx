"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrustItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface HeroBannerProps {
  badge?: string;
  title?: React.ReactNode;
  description?: string;
  backgroundImage?: string;
  primaryBtn?: { text: string; link: string };
  secondaryBtn?: { text: string; link: string };
  trustItems?: TrustItem[];
  className?: string;
}

export const HeroBanner = ({
  badge = "SUMMER COLLECTION",
  title,
  description,
  backgroundImage = "/assets/banner_hero.png",
  primaryBtn = { text: "KHÁM PHÁ NGAY", link: "/san-pham" },
  secondaryBtn = { text: "XEM LOOKBOOK", link: "/thu-vien" },
  trustItems = [],
  className,
}: HeroBannerProps) => {
  return (
    <section
      id="hero"
      className={cn(
        "relative overflow-hidden min-h-[85vh] lg:h-screen flex flex-col justify-center",
        className,
      )}
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center lg:object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent hidden lg:block" />
      </div>

      <div className="w-full relative pt-20 md:pt-32 lg:pt-0 px-12 md:px-10 lg:px-[100px]">
        <div className="max-w-2xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4"
          >
            {/* Badge */}
            <span className="inline-block badge-title text-sm font-medium tracking-widest text-text-muted uppercase">
              {badge}
            </span>

            {/* Title */}
            <h1 className="leading-[1.1] tracking-tighter text-text-main">
              {title || (
                <>
                  <span className="block text-[56px] md:text-[80px] lg:text-[100px] font-semibold">
                    BOOT
                  </span>
                  <span className="block text-[48px] md:text-[70px] lg:text-[90px] font-medium italic -mt-4 md:-mt-6">
                    MÙA HÈ{" "}
                    <span className="font-montserrat not-italic font-semibold tracking-wide bg-linear-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-2 md:ml-4">
                      2026
                    </span>
                  </span>
                </>
              )}
            </h1>

            {/* Separator & Description */}
            <div className="flex items-start gap-4 max-w-md">
              <div className="w-10 h-px bg-text-main mt-3 shrink-0" />
              <p className="text-base md:text-base text-text-muted leading-relaxed font-light">
                {description ||
                  "Bứt phá phong cách – Khẳng định chất riêng cùng những thiết kế boot hiện đại nhất."}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href={primaryBtn.link}>
                <Button
                  variant="premium-black"
                  className="px-10 py-4 text-[11px] font-black tracking-widest group"
                >
                  {primaryBtn.text}
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Button>
              </Link>
              <Link href={secondaryBtn.link}>
                <Button
                  variant="premium-glass"
                  className="px-10 py-4 text-[11px] font-black tracking-widest"
                >
                  {secondaryBtn.text}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust Bar - Floating Pill */}
      {trustItems.length > 0 && (
        <div className="absolute bottom-8 left-0 right-0 z-10 px-6 flex justify-center">
          <div className="max-w-fit">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="glass-effect p-2 md:p-4 rounded-full shadow-2xl border-white/40"
            >
              <div className="flex flex-row items-center justify-center divide-x divide-black/5 overflow-x-auto no-scrollbar py-2 md:py-4">
                {trustItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 flex items-center gap-4 px-6 md:px-10 first:pl-8 last:pr-8"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/50 flex items-center justify-center text-text-main shrink-0 shadow-sm">
                      {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-main text-xs md:text-main font-semibold text-text-main leading-tight whitespace-nowrap">
                        {item.title}
                      </p>
                      <p className="text-main text-xs md:text-main text-text-muted mt-0.5 whitespace-nowrap opacity-80">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </section>
  );
};
