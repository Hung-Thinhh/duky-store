import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { SettingClient } from "./SettingClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Cài đặt tài khoản",
    description: "Quản lý thông tin tài khoản, thay đổi mật khẩu và tùy chọn nhận thông báo tại Duky Store.",
    path: "/tai-khoan/cai-dat",
  });
}

export default function SettingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <SettingClient />
    </Suspense>
  );
}
