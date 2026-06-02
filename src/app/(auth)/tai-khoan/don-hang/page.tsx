import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { OrderClient } from "./OrderClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Lịch sử đơn hàng",
    description: "Xem và kiểm tra trạng thái đơn hàng của bạn tại Duky Store.",
    path: "/tai-khoan/don-hang",
  });
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <OrderClient />
    </Suspense>
  );
}
