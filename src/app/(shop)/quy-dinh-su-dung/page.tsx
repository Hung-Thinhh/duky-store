import React from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PolicyClient } from "@/app/(shop)/chinh-sach/PolicyClient";
import { getMergedPoliciesContent } from "@/utils/markdown";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Quy định sử dụng",
    description: "Chi tiết quy định sử dụng website và các điều khoản dịch vụ tại Duky Store. Quý khách vui lòng đọc kỹ trước khi mua sắm để đảm bảo quyền lợi tốt nhất.",
    path: "/quy-dinh-su-dung",
  });
}

export default function TermsOfUsePage() {
  const content = getMergedPoliciesContent([
    "Dieu_kien_va_han_che_cung_cap.md",
    "Hinh_thuc_ho_tro_truc_tuyen.md",
    "Phuong_thuc_giai_quyet_khieu_nai.md"
  ]);

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
