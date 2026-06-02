import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { CheckoutClient } from "./CheckoutClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Thanh toán",
    description: "Trang thanh toán đơn hàng tại Duky Store. Vui lòng nhập thông tin giao hàng và chọn phương thức thanh toán.",
    path: "/checkout",
  });
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <CheckoutClient />
    </Suspense>
  );
}
