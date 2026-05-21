'use client';

import React from 'react';
import LoginSection from '@/components/shop/login/LoginSection';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center relative p-6">
      {/* Login Section Container */}
      <LoginSection />

      <style jsx>{`
        main {
          background-image: url('/assets/background.png');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
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
