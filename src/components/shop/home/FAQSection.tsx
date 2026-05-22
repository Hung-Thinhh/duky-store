"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Minus, 
  MapPin, 
  Clock, 
  Phone, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  Map
} from "lucide-react";
import { FAQ_DATA } from "@/data/faq";

const DarkAccordionItem = ({ id, question, answer, isOpen, onClick }: { 
  id: number,
  question: string, 
  answer: string, 
  isOpen: boolean, 
  onClick: () => void 
}) => {
  return (
    <motion.div 
      whileHover={{ x: 8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="border-b border-white/10 last:border-0"
    >
      <button
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left group focus:outline-none cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-xs font-medium w-4">{id}.</span>
          <span className={`text-sm md:text-base font-medium transition-colors duration-300 ${isOpen ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
            {question}
          </span>
        </div>
        <div className={`flex-shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-45 text-white' : 'rotate-0 text-white/60 group-hover:text-white'}`}>
          <Plus size={20} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 pl-8 text-white/50 text-xs md:text-sm leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const FAQSection = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section className="pt-24 px-6 overflow-hidden">
      <div className="container-custom">
        <div className="glass-effect p-4 md:p-8 rounded-[40px] border border-white/40 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6 lg:gap-8 items-stretch ">
          
            {/* Left Content: Info Card */}
            <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-[24px] shadow-2xl border border-white/40 flex flex-col justify-between space-y-8">
              <div className="space-y-2">
                <span className="badge-title text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">
                  STORE LOCATION
                </span>
                <h3 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
                  Ghé Duky Store tại Cần Thơ để thử boot trực tiếp
                </h3>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center text-black/60 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <p className="content text-xs md:text-sm text-gray-600 leading-relaxed">
                    <span className="font-bold text-black">Địa chỉ:</span> số 122 Nguyễn Hiền, KDC 91B, P. Tân An, TP. Cần Thơ
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center text-black/60 shrink-0">
                    <Clock size={18} />
                  </div>
                  <p className="content text-xs md:text-sm text-gray-600">
                    <span className="font-bold text-black">Giờ mở cửa:</span> 09:00 - 21:00
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center text-black/60 shrink-0">
                    <Phone size={18} />
                  </div>
                  <p className="content text-xs md:text-sm text-gray-600">
                    <span className="font-bold text-black">Hotline:</span> 0939.654.574
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center text-black/60 shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <p className="content text-xs md:text-sm text-gray-600">
                    <span className="font-bold text-black">Zalo:</span> 0939.654.574
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center text-black/60 shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <p className="content text-xs md:text-sm text-gray-600">
                    <span className="font-bold text-black">Chính sách:</span> Miễn phí hàng trả trong 3 ngày.
                  </p>
                </div>
              </div>

              <a 
                href="https://www.google.com/maps/place/122+%C4%90.+Nguy%E1%BB%85n+Hi%E1%BB%81n,+Khu+d%C3%A2n+c%C6%B0+91B,+T%C3%A2n+An,+C%E1%BA%A7n+Th%C6%A1+94000,+Vietnam/@10.023035,105.755797,1823m/data=!3m1!1e3!4m6!3m5!1s0x31a088487f863ae3:0x704afb4eb3949570!8m2!3d10.0230345!4d105.7557973!16s%2Fg%2F11sp94nd66?hl=vi"
                target="_blank"
                rel="noopener noreferrer"
                className="content group w-[300px] inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-4 rounded-full text-xs font-bold hover:bg-neutral-900 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-black/20"
              >
                Chỉ đường đến cửa hàng
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>

            {/* Right Content: Map Card */}
            <div className="relative group overflow-hidden rounded-[24px] shadow-2xl min-h-[400px] lg:min-h-full">
              <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.8475850937517!2d105.7557973!3d10.0230345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a088487f863ae3%3A0x704afb4eb3949570!2s122%20%C4%90.%20Nguy%E1%BB%85n%20Hi%E1%BB%81n%2C%20Khu%20d%C3%A2n%20c%C6%B0%2091B%2C%20T%C3%A2n%20An%2C%20C%E1%BA%A7n%20Th%C6%A1%2094000%2C%20Vietnam!5e0!3m2!1svi!2s!4v1715584523456!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-102"
                ></iframe>
            </div>
          </div>
        </div>

        {/* Bottom: FAQ Section */}
        <div className="relative mt-8">
          {/* Glossy Effect Border */}
          <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 to-transparent rounded-[40px] pointer-events-none z-10" />
          
          <div className="bg-black/90 backdrop-blur-2xl p-8 md:p-12 rounded-[40px] border overflow-hidden">
            {/* Glossy light effect */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent blur-[1px]" />
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-start relative z-20">
              {/* Left: Content Header */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <span className="badge-title text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">
                    FAQ
                  </span>
                  <h2 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-white leading-tight tracking-tight">
                    Câu hỏi <br className="hidden md:block" /> thường gặp
                  </h2>
                </div>
                <p className="content text-white/50 text-sm md:text-base leading-relaxed max-w-sm">
                  Những thông tin khách hàng quan tâm để mua sắm tự tin hơn tại Duky Store.
                </p>
              </div>

              {/* Right: FAQ Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                {FAQ_DATA.map((item) => (
                  <DarkAccordionItem
                    key={item.id}
                    id={item.id}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openId === item.id}
                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* Subtle bottom shine */}
            <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};
