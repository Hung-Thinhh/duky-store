'use client';

import React from 'react';
import SignUpSection from '@/components/shop/login/SignUpSection';

export default function SignUpPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center relative p-6">
      {/* SignUp Section Container */}
      <SignUpSection />

      <style jsx>{`
        main {
          background-image: url('/assets/background.png');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
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
