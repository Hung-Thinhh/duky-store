"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Gift, Award, Truck, ShieldCheck, Lock } from "lucide-react";
import { NEWS_DATA } from "@/data/news";
import { NewsCard } from "../NewsCard";

export const NewsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleItems = 3; // Number of items to show at once on desktop

  return (
    <section className="pt-24 pb-8 px-6 overflow-hidden">
      <div className="container-custom">
        <div className="glass-effect p-6 md:p-8 rounded-[40px] shadow-2xl relative overflow-hidden mt-8">
            <div className="flex flex-row lg:flex-row gap-12 items-start">
            {/* Left Content: Header & Info */}
            <div className="w-[30%] lg:w-[30%] space-y-8 top-10 lg:sticky ">
                <div className="space-y-4">
                <span className="badge-title text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">
                    Tin tức
                </span>
                <h2 className="content text-3xl md:text-3xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
                    Cập nhật xu hướng <br /> mới nhất
                </h2>
                <p className="content text-gray-500 text-sm md:text-base max-w-xs">
                    Khám phá những xu hướng thời trang mới nhất, mẹo phối đồ và câu chuyện từ Duky Store.
                </p>
                </div>

                <Link
                href="/blog"
                className="content group inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-neutral-900 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-1 active:scale-95"
                >
                XEM TẤT CẢ
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </div>

            {/* Right Content: Slider Container */}
            <div className="w-[70%] lg:w-[70%] relative overflow-hidden group/slider">
                {/* Slider Track */}
                <motion.div 
                    animate={{ 
                        x: `calc(-${currentIndex} * (100% + 24px) / ${visibleItems})` 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex gap-6 pb-4"
                >
                    {NEWS_DATA.map((news) => (
                    <div 
                        key={news.id} 
                        className="w-[calc((100%-48px)/3)] flex-shrink-0 snap-start"
                    >
                        <NewsCard {...news} />
                    </div>
                    ))}
                </motion.div>

                {/* Navigation Arrows */}
                {/* Left Arrow */}
                <AnimatePresence>
                    {currentIndex > 0 && (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onClick={() => setCurrentIndex(prev => prev - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center justify-center text-black opacity-100 lg:!opacity-0 lg:group-hover/slider:!opacity-100 lg:group-hover/slider:translate-x-2 transition-all duration-300 hover:bg-gray-100 hover:scale-110 active:scale-95 z-40 cursor-pointer"
                        >
                            <ChevronLeft size={22} strokeWidth={2.5} />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Right Arrow */}
                <AnimatePresence>
                    {currentIndex < NEWS_DATA.length - visibleItems && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onClick={() => setCurrentIndex(prev => prev + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center justify-center text-black opacity-100 lg:!opacity-0 lg:group-hover/slider:!opacity-100 lg:group-hover/slider:-translate-x-2 transition-all duration-300 hover:bg-gray-100 hover:scale-110 active:scale-95 z-40 cursor-pointer"
                        >
                            <ChevronRight size={22} strokeWidth={2.5} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            </div>
        </div>

        {/* Newsletter & Trust Section - Separate Glass Container */}
        <div className="glass-effect p-6 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden mt-8">
            <div className="flex flex-row lg:flex-row gap-6 items-center relative z-10">
                {/* Background Pattern Decoration */}
                <div className="absolute -bottom-12 -right-12 opacity-[0.05] pointer-events-none">
                    <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="200" cy="200" r="199.5" stroke="black" strokeDasharray="10 10"/>
                        <circle cx="200" cy="200" r="150" stroke="black" strokeDasharray="10 10"/>
                        <circle cx="200" cy="200" r="100" stroke="black" strokeDasharray="10 10"/>
                        <circle cx="200" cy="200" r="50" stroke="black" strokeDasharray="10 10"/>
                    </svg>
                </div>

                {/* Left Content: Newsletter Form */}
                <div className="w-full lg:w-[25%] space-y-8">
                    <div className="space-y-4">
                        <span className="badge-title text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">
                            Duky Store
                        </span>
                        <h2 className="content text-3xl md:text-3xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
                            Ưu đãi dành riêng <br /> cho bạn
                        </h2>
                        <p className="content text-gray-500 text-sm md:text-base max-w-sm">
                            Đăng ký nhận bản tin để không bỏ lỡ ưu đãi độc quyền và sản phẩm mới nhất.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="max-w-[450px] flex flex-row sm:flex-row gap-3 p-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-black/5 focus-within:bg-white focus-within:border-black/10 transition-all duration-300">
                            <input 
                                type="email" 
                                placeholder="Nhập email của bạn" 
                                className="content flex-1 bg-transparent px-6 py-4 text-sm focus:outline-none autofill:shadow-[inset_0_0_0px_1000px_white] autofill:text-fill-black"
                            />
                            <button className="content bg-black text-white px-8 py-4 rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer">
                                ĐĂNG KÝ
                            </button>
                        </div>
                        <div className="content flex items-center gap-2 text-[10px] text-gray-400 px-4">
                            <Lock size={12} />
                            <span>Chúng tôi cam kết bảo mật thông tin của bạn.</span>
                        </div>
                    </div>
                </div>

                {/* Right Content: Trust Cards Grid */}
                <div className="w-full lg:w-[75%] grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { icon: <Gift size={38} strokeWidth={1} />, title: "ƯU ĐÃI ĐỘC QUYỀN", desc: "Nhận mã giảm giá và ưu đãi chỉ dành riêng cho thành viên." },
                        { icon: <Award size={38} strokeWidth={1} />, title: "SẢN PHẨM MỚI", desc: "Cập nhật sớm nhất các bộ sưu tập và sản phẩm mới." },
                        { icon: <Truck size={38} strokeWidth={1} />, title: "MIỄN PHÍ GIAO HÀNG", desc: "Miễn phí giao hàng cho đơn hàng từ 1.000.000đ." },
                        { icon: <ShieldCheck size={38} strokeWidth={1} />, title: "ĐỔI TRẢ DỄ DÀNG", desc: "Đổi trả trong 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất." },
                    ].map((feature, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -12 }}
                            className="bg-linear-to-br from-[#1a1a1a]/95 to-[#333333]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-5 md:p-6 rounded-[40px] border border-white/10 shadow-premium-black hover:shadow-2xl transition-all duration-500 group min-h-[220px]"
                        >
                            <div className="text-white mb-6 transition-transform duration-300 group-hover:scale-110">
                                {feature.icon}
                            </div>
                            <div className="space-y-3 text-center w-full">
                                <h4 className="text-[11px] md:text-[12px] font-bold tracking-wider text-white uppercase leading-tight">
                                    {feature.title}
                                </h4>
                                <p className="content text-[10px] md:text-[11px] text-white/60 leading-relaxed px-1">
                                    {feature.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
