import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { OrderDetailClient } from "./OrderDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return buildMetadata({
    title: `Chi tiết đơn hàng #${id}`,
    description: `Chi tiết thông tin, trạng thái đơn đặt hàng #${id} tại Duky Store.`,
    path: `/tai-khoan/don-hang/${id}`,
  });
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <OrderDetailClient id={id} />
    </Suspense>
  );
}
