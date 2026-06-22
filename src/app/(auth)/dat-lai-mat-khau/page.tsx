import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { DatLaiMatKhauClient } from "@/app/(auth)/dat-lai-mat-khau/DatLaiMatKhauClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Đặt lại mật khẩu",
    description: "Nhập mật khẩu mới cho tài khoản Duky Store của bạn.",
    path: "/dat-lai-mat-khau",
  });
}

export default function DatLaiMatKhauPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <DatLaiMatKhauClient />
    </Suspense>
  );
}
