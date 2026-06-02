import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { UserDashboardClient } from "./UserDashboardClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Tài khoản của tôi",
    description: "Trang thông tin tài khoản cá nhân và quản lý hoạt động tại Duky Store.",
    path: "/tai-khoan",
  });
}

export default function UserDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <UserDashboardClient />
    </Suspense>
  );
}
