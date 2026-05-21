"use client";

import React, { useState, useMemo } from "react";
import { Ruler, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { SHOE_SIZES, SizeData } from "@/data/sizes";

const CalcSize = () => {
  const [footLength, setFootLength] = useState<string>("");
  
  const results = useMemo(() => {
    const length = parseFloat(footLength);
    if (isNaN(length) || length < 1) return [];

    const minCm = SHOE_SIZES[0].cm;
    const maxCm = SHOE_SIZES[SHOE_SIZES.length - 1].cm;

    if (length < minCm || length > maxCm) {
      return null;
    }

    const index = SHOE_SIZES.findIndex((item) => item.cm >= length);
    
    if (index === -1) {
      return [SHOE_SIZES[SHOE_SIZES.length - 1]];
    }

    const currentMatch = SHOE_SIZES[index];
    
    if (currentMatch.cm === length) {
      return [currentMatch];
    }

    // Nếu nằm giữa 2 size, hiện cả 2
    if (index > 0) {
      return [SHOE_SIZES[index - 1], currentMatch];
    }

    return [currentMatch];
  }, [footLength]);

  return (
    <div className="w-full py-2">
      <div className="bg-white rounded-[2rem] border border-border-subtle shadow-sm p-6 md:p-8">
        <div className="flex flex-row lg:flex-row items-center justify-between gap-8 lg:gap-16">
          
          {/* Section 1: Input */}
          <div className="flex">
            <div className="relative w-[300px]">
              <div className="flex items-center rounded-3xl px-6 py-5 bg-white border border-gray-400 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_40px_-12px_rgba(0,0,0,0.12)] hover:border-black transition-all duration-500">
                <Ruler className="w-8 h-8 text-slate-400 mx-2" />
                <div className="flex-1">
                   <p className="content text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                    Nhập chiều dài (cm)
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.1"
                    placeholder="22 - 26.5"
                    value={footLength}
                    onChange={(e) => {
                      let val = e.target.value;
                      // Chỉ lấy tối đa 1 chữ số sau dấu thập phân
                      if (val.includes(".")) {
                        const parts = val.split(".");
                        if (parts[1].length > 1) {
                          val = `${parts[0]}.${parts[1].slice(0, 1)}`;
                        }
                      }
                      
                      const numVal = parseFloat(val);
                      if (val === "" || (numVal >= 1 && numVal <= 100)) {
                        setFootLength(val);
                      }
                    }}
                    className="w-full bg-transparent outline-none text-xl font-black text-slate-900 placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Summary Result */}
          <div className="shrink-0 flex flex-col items-center justify-center min-w-[180px]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Size đề xuất</p>
            {results === null ? (
               <div className="text-center animate-in shake duration-300">
                 <span className="text-2xl font-bold text-red-500 tracking-tight">
                   Không có size
                 </span>
                 <div className="flex items-center gap-2 mt-1 text-red-400/70 justify-center">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-tight">Vượt quá giới hạn</span>
                 </div>
               </div>
            ) : results.length > 0 ? (
               <div className="text-center animate-in zoom-in duration-300">
                 <span className="text-5xl font-black text-emerald-600 tracking-tighter block leading-none">
                   {results.length === 1 ? `${results[0].size}` : `${results[0].size} - ${results[1].size}`}
                 </span>
                 <div className="flex items-center gap-2 mt-1 text-emerald-600/70 justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-tight">
                      {results.length === 1 ? "Size phù hợp" : "Khoảng size phù hợp"}
                    </span>
                 </div>
               </div>
             ) : (
               <span className="text-5xl font-black text-gray-100 tracking-tighter">--</span>
             )}

             <p className="mt-4 text-[10px] text-gray-400 font-medium italic text-center">
               * Chỉ mang tính chất tham khảo
             </p>
          </div>
          
          {/* Section 3: Result Table */}
          <div className="w-full lg:max-w-[400px]">
             <div className="overflow-hidden rounded-[1.5rem] border border-gray-400 bg-white shadow-[0_8px_25px_-10px_rgba(0,0,0,0.05)]">
               <table className="w-full text-sm text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-50/50">
                     <th className="px-6 py-4 border-b border-gray-400 font-bold text-gray-900">Size</th>
                     <th className="px-6 py-4 border-b border-gray-400 font-bold text-gray-900 text-center">Chiều dài chân (cm)</th>
                   </tr>
                 </thead>
                 <tbody>
                   {results === null ? (
                     <tr className="bg-white">
                       <td colSpan={2} className="px-6 py-8 text-center text-red-400 font-bold italic">
                         Hiện không có size phù hợp
                       </td>
                     </tr>
                   ) : results.length > 0 ? (
                     results.map((item, idx) => (
                       <tr key={item.size} className="bg-white animate-in fade-in duration-500 slide-in-from-bottom-2" style={{ animationDelay: `${idx * 100}ms` }}>
                         <td className="px-6 py-4 border-b border-gray-400 font-black text-xl text-emerald-600">{item.size}</td>
                         <td className="px-6 py-4 border-b border-gray-400 text-center font-bold text-gray-900">{item.cm} cm</td>
                       </tr>
                     ))
                   ) : (
                     <tr className="bg-white">
                       <td colSpan={2} className="px-6 py-8 text-center text-gray-300 italic font-medium">
                         Vui lòng nhập chiều dài bàn chân
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>

          

        </div>
      </div>
    </div>
  );
};

export default CalcSize;
