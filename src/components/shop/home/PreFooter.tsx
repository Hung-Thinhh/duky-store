"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, MessageCircle } from "lucide-react";

export const PreFooter = () => {
  return (
    <section className="pb-2 px-6 overflow-hidden">
      <div className="container-custom">
        <div className="glass-effect relative overflow-hidden rounded-[40px] md:rounded-[60px] shadow-2xl mt-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-0 p-8 md:p-16 lg:p-24 relative z-10">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-start space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
                  Sẵn sàng tìm đôi boot <br className="hidden md:block" />
                  hợp phong cách của bạn?
                </h2>
                <p className="content text-base md:text-lg text-gray-500 max-w-md">
                  Khám phá các mẫu boot da nam nữ đang có sẵn tại Duky Store Cần Thơ.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="group bg-black content text-white px-8 py-4 rounded-full text-sm font-bold flex items-center gap-3 hover:bg-neutral-900 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-1 active:scale-95"
                >
                  Mua ngay
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="https://zalo.me/0939654574"
                  target="_blank"
                  rel='noopener noreferrer'
                  className="group content bg-white/50 backdrop-blur-md border border-black/10 text-black px-8 py-4 rounded-full text-sm font-bold flex items-center gap-3 hover:bg-gray-100 hover:border-black/20 transition-all duration-300 hover:-translate-y-1 active:scale-95"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    <Image 
                      src="/assets/icons/Zalo.png" 
                      alt="Zalo" 
                      width={28} 
                      height={28} 
                      className="object-contain"
                    />
                  </div>
                  Liên hệ Zalo
                </Link>
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative aspect-[4/3] lg:aspect-auto lg:h-[400px] w-full"
            >
              <Image
                src="/assets/prefooter.png"
                alt="Prefooter Visual"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
                className="object-contain lg:object-right-bottom"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
