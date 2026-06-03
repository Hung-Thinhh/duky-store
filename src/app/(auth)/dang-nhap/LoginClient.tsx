"use client";

import React from "react";
import LoginSection from "@/components/shop/login/LoginSection";

export function LoginClient() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center relative p-6">
      <LoginSection />

      <style jsx>{`
        main {
        }

        @media (max-width: 640px) {
          main {
            padding: 12px !important;
          }
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </main>
  );
}
