import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { AddressClient } from "./AddressClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Sổ địa chỉ",
    description: "Quản lý danh sách địa chỉ giao nhận hàng của bạn tại Duky Store.",
    path: "/user/address",
  });
}

export default function AddressPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <AddressClient />
    </Suspense>
  );
}
