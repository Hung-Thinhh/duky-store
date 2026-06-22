"use client";

import React, { Suspense } from "react";
import DatLaiMatKhauSection from "../../../components/shop/login/DatLaiMatKhauSection";

export function DatLaiMatKhauClient() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center relative p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[580px] w-full max-w-[940px] bg-white/40 backdrop-blur-lg border border-white/50 rounded-[40px] shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a96e]"></div>
        </div>
      }>
        <DatLaiMatKhauSection />
      </Suspense>

      <style jsx>{`
        main {
        }

        @media (max-width: 640px) {
          main {
            padding: 12px !important;
          }
        }
      `}</style>
    </main>
  );
}

