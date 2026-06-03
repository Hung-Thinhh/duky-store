"use client";

import React from "react";
import SignUpSection from "@/components/shop/login/SignUpSection";

export function SignUpClient() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center relative p-6">
      <SignUpSection />

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
