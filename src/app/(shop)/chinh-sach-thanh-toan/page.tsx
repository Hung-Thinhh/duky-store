import React from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PolicyClient } from "@/app/(shop)/chinh-sach/PolicyClient";
import { getPolicyContent } from "@/utils/markdown";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Chính sách thanh toán",
    description: "Các hình thức thanh toán được chấp nhận tại Duky Store bao gồm COD (thanh toán khi nhận hàng) và chuyển khoản ngân hàng.",
    path: "/chinh-sach-thanh-toan",
  });
}

export default function PaymentPolicyPage() {
  const content = getPolicyContent("Chinh_sach_thanh_toan.md");
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
