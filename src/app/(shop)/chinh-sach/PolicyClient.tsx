"use client";

import React from "react";
import { Header, Footer } from "@/components/layout";
import { useCart } from "@/context/CartContext";

interface PolicyClientProps {
  children: React.ReactNode;
}

export function PolicyClient({ children }: PolicyClientProps) {
  const { cartCount } = useCart();

  return (
    <>
      <Header cartCount={cartCount} />
      <main id="main-content">
        {children}
      </main>
      <Footer />

      <style jsx>{`
        :global(.policy-page) {
          margin-top: 80px;
          padding: 40px 2rem 60px;
        }

        :global(.policy-container) {
          max-width: 1000px;
          margin: 0 auto;
          background: var(--bg-card);
          border-radius: var(--radius-section);
          padding: 48px 56px;
          border: 1px solid var(--border-card);
          box-shadow: var(--card-shadow);
        }

        :global(.policy-title) {
          font-family: var(--font-main);
          font-size: 28px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        :global(.policy-intro) {
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.8;
          margin-bottom: 32px;
          font-style: italic;
        }

        :global(.policy-section) {
          margin-bottom: 28px;
        }

        :global(.policy-section-title) {
          font-family: var(--font-main);
          font-size: 20px;
          font-weight: 700;
          color: #000000ff;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }

        :global(.policy-section-content) {
          font-family: var(--font-main);
          font-size: 14px;
          color: var(--text-main);
          line-height: 1.8;
        }

        :global(.policy-list) {
          list-style: disc;
          padding-left: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        :global(.policy-list-item) {
          font-family: var(--font-main);
          font-size: 14px;
          color: var(--text-main);
          line-height: 1.7;
        }

        @media (max-width: 768px) {
          :global(.policy-container) {
            padding: 28px 20px;
          }
          :global(.policy-title) {
            font-size: 22px;
          }
          :global(.policy-section-title) {
            font-size: 17px;
          }
        }
      `}</style>
    </>
  );
}
