"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Truck,
  RotateCcw,
  Headphones,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { Header, Footer } from "@/components/layout";
import {
  HeroBanner,
  CategorySection,
  BootMaleSection,
  BootFemaleSection,
  GuideSection,
  PreFooter,
  NewsSection,
  FAQSection,
} from "@/components/shop";
import { useCart } from "@/context/CartContext";

export default function ShopPage() {
  const { cart, cartCount, toast, updateQuantity, removeFromCart } = useCart();

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

  return (
    <>
      <Header cartCount={cartCount} />
      <HeroBanner trustItems={trustItems} />
      <CategorySection />
      <BootMaleSection />
      <BootFemaleSection />
      <GuideSection />
      <NewsSection />
      <FAQSection />
      <PreFooter />
      <Footer />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-10 left-half minus-translate-x-half glass-effect px-8 py-4 rounded-full z-[100] flex items-center gap-4 shadow-2xl"
          >
            <div className="bg-accent-gold rounded-full p-1.5 text-white shadow-lg">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-xs font-bold tracking-widest text-text-main uppercase">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
