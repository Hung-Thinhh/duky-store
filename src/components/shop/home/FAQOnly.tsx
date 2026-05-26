"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
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

export const FAQOnly = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section className="px-6 pb-12 overflow-hidden mb-8">
      <div className="container-custom">
        <div className="relative">
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
