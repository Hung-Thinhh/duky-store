import React, { Suspense } from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { ContactClient } from "./ContactClient";

interface BannerContent {
  image: string;
  alt: string;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
}

const CONTACT_BANNER: BannerContent = {
  image: "/assets/banner-contact.webp",
  alt: "Liên hệ - Duky Store",
  badge: "CONTACT US",
  titleLine1: "LIÊN HỆ",
  titleLine2: "DUKY STORE",
  description:
    "Bạn đang cần sự hỗ trợ? Hãy liên hệ với Duky Store — chúng tôi luôn sẵn sàng giúp đỡ bạn.",
};

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Liên hệ",
    description:
      "Liên hệ với cửa hàng giày boot Duky Store tại Cần Thơ. Địa chỉ, số điện thoại, bản đồ và form liên hệ hỗ trợ trực tiếp.",
    path: "/lien-he",
  });
}

export default function ContactPage() {
  return (
    <>
      {/* Hero Banner (Rendered on Server for LCP) */}
      <section
        className="relative w-full"
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
      >
        <Image
          src={CONTACT_BANNER.image}
          alt={CONTACT_BANNER.alt}
          width={1920}
          height={1080}
          sizes="100vw"
          className="w-full h-[260px] sm:h-[320px] md:h-auto object-cover"
          priority
        />
        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20">
            <div className="space-y-2 md:space-y-3 max-w-sm sm:max-w-md">
              <span className="inline-block text-[10px] md:text-xs font-medium tracking-widest text-gray-600 uppercase">
                {CONTACT_BANNER.badge}
              </span>
              <h1 className="leading-[1.1] tracking-tighter text-gray-900">
                <span className="block text-[24px] sm:text-[36px] md:text-[52px] lg:text-[64px] font-semibold">
                  {CONTACT_BANNER.titleLine1}
                </span>
                <span className="block text-[20px] sm:text-[30px] md:text-[44px] lg:text-[56px] font-medium italic -mt-1 md:-mt-2">
                  <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1 md:ml-2">
                    {CONTACT_BANNER.titleLine2}
                  </span>
                </span>
              </h1>
              <div className="flex items-start gap-2 md:gap-3 max-w-[170px] sm:max-w-sm">
                <div className="w-6 sm:w-8 h-px bg-gray-900 mt-2 shrink-0" />
                <p className="text-[11px] md:text-sm text-gray-600 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
                  {CONTACT_BANNER.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
        <ContactClient />
      </Suspense>
    </>
  );
}
