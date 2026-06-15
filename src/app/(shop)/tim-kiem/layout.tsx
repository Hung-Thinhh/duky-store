"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import dynamic from "next/dynamic";
import { useCart } from "@/context/CartContext";

const Footer = dynamic(
  () => import("@/components/layout/Footer").then((m) => m.Footer),
  { ssr: true },
);

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cartCount } = useCart();

  return (
    <>
      <Header cartCount={cartCount} />
      <main className="pb-32">{children}</main>
      <Footer />
    </>
  );
}
