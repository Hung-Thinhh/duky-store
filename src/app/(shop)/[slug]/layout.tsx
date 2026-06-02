"use client";

import React from "react";
import { Header, Footer } from "@/components/layout";
import { useCart } from "@/context/CartContext";

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cartCount } = useCart();

  return (
    <>
      <Header cartCount={cartCount} />
      <main className="pt-24 pb-32">
        {children}
      </main>
      <Footer />
    </>
  );
}
