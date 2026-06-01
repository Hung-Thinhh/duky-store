import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { SignUpClient } from "./SignUpClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Đăng ký tài khoản",
    description: "Đăng ký thành viên mới tại Duky Store để trải nghiệm mua sắm nhanh chóng và tích lũy điểm thưởng.",
    path: "/signup",
  });
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <SignUpClient />
    </Suspense>
  );
}
