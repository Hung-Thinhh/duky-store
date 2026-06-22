import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { QuenMatKhauClient } from "@/app/(auth)/quen-mat-khau/QuenMatKhauClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Quên mật khẩu",
    description: "Nhập email của bạn để nhận liên kết đặt lại mật khẩu tài khoản Duky Store.",
    path: "/quen-mat-khau",
  });
}

export default function QuenMatKhauPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <QuenMatKhauClient />
    </Suspense>
  );
}
