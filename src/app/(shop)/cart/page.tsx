import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { CartClient } from "./CartClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Giỏ hàng",
    description: "Giỏ hàng của bạn tại Duky Store. Xem lại các sản phẩm đã chọn trước khi thanh toán.",
    path: "/cart",
  });
}

export default function CartPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
      <CartClient />
    </Suspense>
  );
}
