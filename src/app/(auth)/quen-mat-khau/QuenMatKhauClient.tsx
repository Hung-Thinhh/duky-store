"use client";

import React from "react";
import QuenMatKhauSection from "../../../components/shop/login/QuenMatKhauSection";

export function QuenMatKhauClient() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center relative p-6">
      <QuenMatKhauSection />

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
