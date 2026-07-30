import React from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PolicyClient } from "@/app/(shop)/chinh-sach/PolicyClient";
import { getPolicyContent } from "@/utils/markdown";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Chính sách giá cả",
    description: "Chính sách giá cả hàng hóa, thuế VAT và cách xử lý sai lệch giá tại Duky Store.",
    path: "/chinh-sach-gia",
  });
}

export default function PricePolicyPage() {
  const content = getPolicyContent("Chinh_sach_gia.md");
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
