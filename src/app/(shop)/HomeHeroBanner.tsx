"use client";

import {
  Truck,
  RotateCcw,
  Headphones,
  ShieldCheck,
} from "lucide-react";
import { HeroBanner } from "@/components/shop";

// TODO: Replace with API call when backend is ready
// Example: const bannerData = await fetch("/api/banners/home").then(res => res.json());
const MOCK_HERO_BANNER = {
  badge: "SUMMER COLLECTION",
  titleLine1: "BOOT",
  titleLine2: "MÙA HÈ",
  titleHighlight: "2026",
  description: "Bứt phá phong cách – Khẳng định chất riêng cùng những thiết kế boot hiện đại nhất.",
  backgroundImage: "/assets/banner_hero.png",
  primaryBtn: { text: "KHÁM PHÁ NGAY", link: "/products" },
  secondaryBtn: { text: "XEM LOOKBOOK", link: "/gallery" },
};

const trustItems = [
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
 * Client component wrapper for HeroBanner with trust items.
 * Trust items contain React elements (icons) which are not serializable
 * across the server/client boundary, so they must be defined in a client component.
 */
export function HomeHeroBanner() {
  return (
    <HeroBanner
      badge={MOCK_HERO_BANNER.badge}
      description={MOCK_HERO_BANNER.description}
      backgroundImage={MOCK_HERO_BANNER.backgroundImage}
      primaryBtn={MOCK_HERO_BANNER.primaryBtn}
      secondaryBtn={MOCK_HERO_BANNER.secondaryBtn}
      trustItems={trustItems}
    />
  );
}
