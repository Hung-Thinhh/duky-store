import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { LoginClient } from "./LoginClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Đăng nhập",
    description: "Đăng nhập tài khoản Duky Store để quản lý đơn hàng và nhận các ưu đãi hấp dẫn.",
    path: "/dang-nhap",
  });
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <LoginClient />
    </Suspense>
  );
}
