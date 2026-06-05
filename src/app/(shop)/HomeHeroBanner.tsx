"use client";

import { Truck, RotateCcw, Headphones, ShieldCheck } from "lucide-react";
import { HeroSlider } from "@/components/shop/home/HeroSlider";
import { HERO_SLIDES } from "@/data/heroSlider";
import type { TrustItem, SlideConfig } from "@/types/heroSlider";

const trustItems: TrustItem[] = [
  {
    icon: <Truck size={22} />,
    title: "Giao hàng toàn quốc",
    desc: "Nhanh chóng – An toàn",
  },
  {
    icon: <RotateCcw size={22} />,
    title: "Đổi size dễ dàng",
    desc: "Trong vòng 7 ngày",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Bảo hành chính hãng",
    desc: "Hỗ trợ đến 12 tháng",
  },
  {
    icon: <Headphones size={22} />,
    title: "Tư vấn nhanh 24/7",
    desc: "Qua Zalo / Hotline",
  },
];

/**
 * Client component wrapper for HeroSlider with trust items.
 * Trust items contain React elements (icons) which are not serializable
 * across the server/client boundary, so they must be defined in a client component.
 */
export function HomeHeroBanner({
  initialSlides,
}: {
  initialSlides?: SlideConfig[];
}) {
  return (
    <HeroSlider
      slides={initialSlides ?? HERO_SLIDES}
      trustItems={trustItems}
      autoScroll={true} // Đổi thành false nếu bạn muốn tắt tự động cuộn (auto-scroll) banner
      autoScrollInterval={6000}
    />
  );
}
