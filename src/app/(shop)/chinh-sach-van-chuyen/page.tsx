import React from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PolicyClient } from "@/app/(shop)/chinh-sach/PolicyClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Chính sách vận chuyển",
    description: "Chính sách vận chuyển, giao nhận và kiểm hàng khi mua sắm giày da cao cấp tại Duky Store.",
    path: "/chinh-sach-van-chuyen",
  });
}

export default function ShippingPolicyPage() {
  return (
    <PolicyClient>
      <main className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">CHÍNH SÁCH VẬN CHUYỂN & GIAO NHẬN</h1>
          <p className="policy-intro">
            Để mang lại sự an tâm tuyệt đối và trải nghiệm mua sắm tốt nhất, Duky Store áp dụng quy trình giao hàng chuyên nghiệp, nhanh chóng và hỗ trợ đồng kiểm trên toàn quốc.
          </p>

          <div className="policy-section">
            <h2 className="policy-section-title">1. Phạm Vi Giao Hàng</h2>
            <p className="policy-section-content">
              Duky Store hỗ trợ giao hàng tận nơi tới tất cả các tỉnh thành trên toàn quốc (63 tỉnh/thành phố). Chúng tôi hợp tác với các đơn vị vận chuyển uy tín hàng đầu như Giao Hàng Tiết Kiệm (GHTK), Giao Hàng Nhanh (GHN), và Viettel Post để đảm bảo hàng hóa được vận chuyển an toàn.
            </p>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">2. Thời Gian Giao Hàng Dự Kiến</h2>
            <p className="policy-section-content">
              Thời gian nhận hàng phụ thuộc vào vị trí địa lý của quý khách:
            </p>
            <ul className="policy-list" style={{ marginTop: "10px" }}>
              <li className="policy-list-item"><strong>Khu vực nội ô Cần Thơ:</strong> Giao nhanh trong vòng 24 giờ hoặc hẹn giờ giao theo yêu cầu.</li>
              <li className="policy-list-item"><strong>Khu vực trung tâm (Hà Nội, TP. Hồ Chí Minh, Đà Nẵng):</strong> Thời gian giao nhận từ 2 đến 3 ngày làm việc.</li>
              <li className="policy-list-item"><strong>Các tỉnh thành khác:</strong> Thời gian giao nhận từ 3 đến 5 ngày làm việc (trừ ngày Chủ nhật và ngày lễ).</li>
            </ul>
            <p className="policy-section-content" style={{ marginTop: "10px" }}>
              * Lưu ý: Trong các dịp lễ Tết, chương trình siêu sale hoặc do điều kiện thời tiết/thiên tai bất khả kháng, thời gian giao hàng có thể bị chậm trễ hơn so với dự kiến.
            </p>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">3. Cước Phí Vận Chuyển</h2>
            <p className="policy-section-content">
              Mức phí vận chuyển sẽ phụ thuộc vào nhà cung cấp dịch vụ vận chuyển. Phí này không bao gồm trong giá bán sản phẩm. Khách hàng tự thanh toán phí vận chuyển cho đơn vị vận chuyển khi nhận hàng.
            </p>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">4. Chính Sách Đồng Kiểm (Kiểm Hàng Trước Khi Thanh Toán)</h2>
            <p className="policy-section-content">
              Duky Store hỗ trợ tối đa cho khách hàng với chính sách đồng kiểm:
            </p>
            <ul className="policy-list" style={{ marginTop: "10px" }}>
              <li className="policy-list-item">Khách hàng được quyền mở hộp kiểm tra ngoại quan sản phẩm (đúng mẫu, đúng size, không bị lỗi trầy xước da) trước khi ký nhận và thanh toán tiền cho nhân viên giao hàng.</li>
              <li className="policy-list-item">Nếu sản phẩm nhận được không đúng như đơn đặt hàng hoặc bị lỗi, khách hàng có quyền từ chối nhận hàng và không phải thanh toán bất kỳ chi phí nào.</li>
              <li className="policy-list-item">Duky Store khuyến khích quý khách hàng quay lại video quá trình mở hộp sản phẩm để làm tư liệu đối chiếu và được xử lý đổi hàng nhanh chóng nhất nếu phát sinh sự cố.</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">5. Trách Nhiệm Với Hàng Hóa</h2>
            <p className="policy-section-content">
              Duky Store chịu toàn bộ trách nhiệm về rủi ro hao hụt, hỏng hóc hoặc mất mát sản phẩm trong suốt quá trình vận chuyển từ kho của chúng tôi đến tay quý khách hàng. Quý khách vui lòng kiểm tra kỹ tình trạng hộp giày khi nhận. Nếu phát hiện hộp bị rách nát, ướt sũng hoặc có dấu hiệu bị cạy mở trước đó, vui lòng phản hồi ngay cho bộ phận CSKH để được hỗ trợ giải quyết kịp thời.
            </p>
          </div>
        </div>
      </main>
    </PolicyClient>
  );
}
