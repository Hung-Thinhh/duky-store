import React from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PolicyClient } from "@/app/(shop)/chinh-sach/PolicyClient";
import { getPolicyContent } from "@/utils/markdown";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Chính sách bảo mật",
    description: "Chính sách bảo mật thông tin cá nhân tại Duky Store. Chúng tôi cam kết bảo vệ tuyệt đối quyền riêng tư và dữ liệu giao dịch của quý khách hàng.",
    path: "/chinh-sach-bao-mat",
  });
}

export default function PrivacyPolicyPage() {
  const content = getPolicyContent("Chinh_sach_bao_mat.md");
  return (
    <PolicyClient>
      <main className="policy-page">
        <div className="policy-container">
          {content}
        </div>
      </main>
    </PolicyClient>
  );
}
