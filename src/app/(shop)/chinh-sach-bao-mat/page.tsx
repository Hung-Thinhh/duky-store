import React from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PolicyClient } from "@/app/(shop)/chinh-sach/PolicyClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Chính sách bảo mật",
    description: "Chính sách bảo mật thông tin cá nhân của khách hàng tại Duky Store. Chúng tôi cam kết bảo vệ quyền riêng tư của bạn.",
    path: "/chinh-sach-bao-mat",
  });
}

export default function PrivacyPolicyPage() {
  return (
    <PolicyClient>
      <main className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">CHÍNH SÁCH BẢO MẬT THÔNG TIN</h1>
          <p className="policy-intro">
            Duky Store cam kết bảo vệ thông tin riêng tư của khách hàng. Vui lòng đọc kỹ chính sách bảo mật dưới đây để hiểu hơn về những cam kết mà chúng tôi thực hiện nhằm tôn trọng và bảo vệ quyền lợi của người truy cập.
          </p>

          <div className="policy-section">
            <h2 className="policy-section-title">1. Mục Đích Thu Thập Thông Tin Cá Nhân</h2>
            <p className="policy-section-content">
              Duky Store thu thập thông tin cá nhân của khách hàng nhằm phục vụ các mục đích sau:
            </p>
            <ul className="policy-list" style={{ marginTop: "10px" }}>
              <li className="policy-list-item">Xử lý và xác nhận đơn hàng khi khách hàng mua sắm tại Website.</li>
              <li className="policy-list-item">Giao hàng đến đúng địa chỉ yêu cầu của khách hàng.</li>
              <li className="policy-list-item">Cung cấp dịch vụ chăm sóc khách hàng, hỗ trợ đổi size, bảo hành sản phẩm.</li>
              <li className="policy-list-item">Thông báo về các chương trình khuyến mãi, ưu đãi mới nếu được sự đồng ý của khách hàng.</li>
              <li className="policy-list-item">Nâng cao chất lượng dịch vụ website và trải nghiệm người dùng.</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">2. Phạm Vi Thu Thập Thông Tin</h2>
            <p className="policy-section-content">
              Các thông tin cá nhân được thu thập bao gồm: Họ và tên, số điện thoại, địa chỉ giao hàng, địa chỉ email và các thông tin liên quan đến thanh toán. Chúng tôi chỉ thu thập các thông tin này khi khách hàng tự nguyện cung cấp trong quá trình đặt hàng hoặc đăng ký tài khoản.
            </p>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">3. Thời Gian Lưu Trữ Thông Tin</h2>
            <p className="policy-section-content">
              Thông tin cá nhân của khách hàng sẽ được lưu trữ và bảo mật trên hệ thống của Duky Store cho đến khi có yêu cầu hủy bỏ từ phía khách hàng. Trong mọi trường hợp, thông tin cá nhân khách hàng sẽ được bảo mật tuyệt đối.
            </p>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">4. Chia Sẻ Thông Tin Khách Hàng</h2>
            <p className="policy-section-content">
              Duky Store cam kết không bán, không chia sẻ thông tin dẫn đến việc tiết lộ thông tin cá nhân của khách hàng vì mục đích thương mại. Chúng tôi chỉ cung cấp thông tin cho các bên thứ ba liên quan trực tiếp đến việc giao hàng (các đơn vị vận chuyển như GHTK, GHN, Viettel Post...) hoặc khi có yêu cầu bằng văn bản từ các cơ quan pháp luật có thẩm quyền.
            </p>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">5. Quyền Của Khách Hàng Đối Với Thông Tin Cá Nhân</h2>
            <p className="policy-section-content">
              Khách hàng có quyền yêu cầu Duky Store kiểm tra, cập nhật, điều chỉnh hoặc hủy bỏ thông tin cá nhân của mình bằng cách đăng nhập vào tài khoản trên website hoặc liên hệ trực tiếp với bộ phận chăm sóc khách hàng qua Hotline/Zalo: 0939.654.574.
            </p>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">6. Cam Kết Bảo Mật</h2>
            <p className="policy-section-content">
              Chúng tôi luôn áp dụng các biện pháp kỹ thuật và an ninh tốt nhất để bảo vệ thông tin cá nhân khách hàng khỏi việc truy cập trái phép, sử dụng sai mục đích hoặc tiết lộ ngoài ý muốn. Duky Store khuyến cáo khách hàng nên tự bảo mật mật khẩu tài khoản của mình và không chia sẻ tài khoản cho người khác.
            </p>
          </div>
        </div>
      </main>
    </PolicyClient>
  );
}
