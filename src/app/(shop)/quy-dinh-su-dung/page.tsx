import React from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PolicyClient } from "@/app/(shop)/chinh-sach/PolicyClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Quy định sử dụng",
    description: "Quy định sử dụng website Duky Store. Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ mua sắm tại cửa hàng.",
    path: "/quy-dinh-su-dung",
  });
}

const POLICY_DATA = {
  title: "QUY ĐỊNH SỬ DỤNG WEBSITE DUKY STORE",
  intro:
    "Chào mừng quý khách đến với website https://dukystore.com/. Việc quý khách truy cập và sử dụng website này đồng nghĩa với việc quý khách đã chấp nhận và đồng ý với các Quy định và Điều kiện dưới đây. Vui lòng đọc kỹ toàn bộ quy định trước khi sử dụng dịch vụ.",
  sections: [
    {
      title: "1. Định Nghĩa",
      items: [
        "Duky Store: Do Công ty TNHH Duky Group, chủ sở hữu và vận hành website.",
        "Website: Là trang điện tử https://dukystore.com/.",
        "Người dùng/Khách hàng: Là cá nhân, tổ chức, truy cập mua sắm trên Website.",
      ],
    },
    {
      title: "2. Quy Định Về Tài Khoản",
      items: [
        "Khi đăng ký tài khoản, Người dùng cam kết cung cấp thông tin cá nhân chính xác, đầy đủ và hợp pháp.",
        "Người dùng có trách nhiệm tự bảo mật tài khoản và mật khẩu của mình. Duky Store không chịu trách nhiệm đối với bất kỳ thiệt hại nào phát sinh do Người dùng không tuân thủ quy định này.",
        "Duky Store có quyền khóa hoặc chấm dứt tài khoản của Người dùng nếu phát hiện có sự vi phạm các quy định này.",
      ],
    },
    {
      title: "3. Quy Định Về Mua Hàng và Thanh Toán",
      items: [
        "Việc đặt hàng trên Website được coi là lời đề nghị mua hàng từ phía Người dùng. Duky Store chỉ chính thức xác nhận đơn hàng sau khi liên hệ và xác nhận thông tin đơn hàng với Người dùng.",
        "Người dùng cam kết tuân thủ Chính sách Thanh toán và Chính sách Vận chuyển đã được công bố trên Website.",
        "Duky Store có quyền từ chối hoặc hủy đơn hàng của Người dùng trong các trường hợp: sản phẩm hết hàng, thông tin thanh toán không hợp lệ, hoặc nghi ngờ có hành vi gian lận.",
      ],
    },
    {
      title: "4. Quyền Sở Hữu Trí Tuệ",
      items: [
        "Tất cả nội dung trên Website, bao gồm hình ảnh sản phẩm, thiết kế, logo, văn bản và các nội dung khác, đều là tài sản thuộc sở hữu của Duky Store và được bảo hộ bởi luật sở hữu trí tuệ Việt Nam.",
        "Nghiêm cấm sao chép, sử dụng, phát hành hoặc phân phối bất kỳ nội dung nào từ Website mà không có sự đồng ý bằng văn bản của Duky Store.",
      ],
    },
    {
      title: "5. Miễn Trừ Trách Nhiệm",
      items: [
        "Duky Store không đảm bảo Website sẽ hoạt động liên tục, không lỗi hoặc không có virus.",
        "Duky Store không chịu trách nhiệm đối với bất kỳ thiệt hại trực tiếp hoặc gián tiếp nào phát sinh từ việc sử dụng hoặc không thể sử dụng Website hoặc các sản phẩm được mua từ Website.",
      ],
    },
    {
      title: "6. Thay Đổi Quy Định",
      content:
        "Duky Store có quyền thay đổi, chỉnh sửa hoặc cập nhật các Quy định này bất cứ lúc nào mà không cần báo trước. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên Website.",
    },
  ],
};

export default function TermsOfUsePage() {
  return (
    <PolicyClient>
      <main className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">{POLICY_DATA.title}</h1>
          <p className="policy-intro">{POLICY_DATA.intro}</p>

          {POLICY_DATA.sections.map((section, index) => (
            <div key={index} className="policy-section">
              <h2 className="policy-section-title">{section.title}</h2>
              {section.content && (
                <p className="policy-section-content">{section.content}</p>
              )}
              {section.items && (
                <ul className="policy-list">
                  {section.items.map((item, i) => (
                    <li key={i} className="policy-list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </main>
    </PolicyClient>
  );
}
