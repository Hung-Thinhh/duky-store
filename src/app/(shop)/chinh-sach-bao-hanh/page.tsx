import React from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PolicyClient } from "@/app/(shop)/chinh-sach/PolicyClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Chính sách bảo hành",
    description: "Chính sách bảo hành sản phẩm giày da cao cấp trong vòng 12 tháng tại Duky Store.",
    path: "/chinh-sach-bao-hanh",
  });
}

export default function WarrantyPolicyPage() {
  return (
    <PolicyClient>
      <main className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">CHÍNH SÁCH BẢO HÀNH SẢN PHẨM</h1>
          <p className="policy-intro">
            Duky Store luôn tự hào về chất lượng của từng sản phẩm giày boot da bán ra. Để khẳng định uy tín thương hiệu, chúng tôi cung cấp dịch vụ bảo hành 12 tháng chuyên nghiệp cho tất cả các dòng sản phẩm giày da.
          </p>

          <div className="policy-section">
            <h2 className="policy-section-title">1. Thời Hạn Bảo Hành</h2>
            <p className="policy-section-content">
              Tất cả các sản phẩm giày boot da, giày da nam/nữ mua tại Duky Store (qua website hoặc mua trực tiếp) đều được bảo hành miễn phí trong vòng <strong>12 tháng</strong> kể từ ngày quý khách nhận hàng thành công.
            </p>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">2. Phạm Vi Bảo Hành (Lỗi Được Bảo Hành)</h2>
            <p className="policy-section-content">
              Duky Store hỗ trợ bảo hành các lỗi kỹ thuật phát sinh từ phía nhà sản xuất hoặc chất lượng vật liệu trong điều kiện sử dụng bình thường:
            </p>
            <ul className="policy-list" style={{ marginTop: "10px" }}>
              <li className="policy-list-item">Bong keo đế giày, hở đế, tách lớp đế.</li>
              <li className="policy-list-item">Đứt chỉ may, bung đường chỉ viền, chỉ lót bên trong.</li>
              <li className="policy-list-item">Hỏng khóa kéo (zip kéo bên hông/sau), đứt khóa gài, gãy móc khóa kim loại do chất lượng phụ kiện.</li>
              <li className="policy-list-item">Đế cao su bị nứt gãy tự nhiên (không do tác động lực cắt từ ngoại vật sắc nhọn).</li>
              <li className="policy-list-item">Bề mặt da thật bị nổ da, bong tróc lớp sơn phủ tự nhiên do lỗi thuộc tính da.</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">3. Các Trường Hợp Không Được Bảo Hành</h2>
            <p className="policy-section-content">
              Chúng tôi rất tiếc phải từ chối bảo hành đối với các trường hợp hư hỏng do tác nhân bên ngoài hoặc bảo quản không đúng cách:
            </p>
            <ul className="policy-list" style={{ marginTop: "10px" }}>
              <li className="policy-list-item">Sản phẩm bị trầy xước, rách da do va quẹt, vấp ngã hoặc động vật cào/cắn trong quá trình sử dụng.</li>
              <li className="policy-list-item">Giày bị hư hỏng nghiêm trọng do ngập nước, đi mưa lâu ngày không sấy khô kịp thời hoặc phơi trực tiếp dưới ánh nắng gắt dẫn đến da bị co cứng, biến dạng.</li>
              <li className="policy-list-item">Sản phẩm bị biến màu hoặc hỏng bề mặt da do tiếp xúc với các loại hóa chất mạnh, cồn, xăng dầu, thuốc tẩy.</li>
              <li className="policy-list-item">Khách hàng tự ý thay đổi kết cấu giày, sửa chữa tại các cơ sở làm giày khác ngoài Duky Store.</li>
              <li className="policy-list-item">Hết thời hạn bảo hành 12 tháng quy định (sau thời hạn này, Duky Store vẫn hỗ trợ sửa chữa giày có tính phí ưu đãi cho khách hàng thân thiết).</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">4. Quy Trình Nhận Bảo Hành</h2>
            <p className="policy-section-content">
              Khi sản phẩm gặp lỗi cần bảo hành, quý khách vui lòng thực hiện các bước sau:
            </p>
            <ul className="policy-list" style={{ marginTop: "10px" }}>
              <li className="policy-list-item"><strong>Bước 1:</strong> Liên hệ qua Zalo/Hotline 0939.654.574 để gửi hình ảnh/video mô tả lỗi sản phẩm. Nhân viên CSKH sẽ tư vấn và xác nhận lỗi có thuộc diện bảo hành hay không.</li>
              <li className="policy-list-item"><strong>Bước 2:</strong> Gửi sản phẩm về cửa hàng theo thông tin: <i>Duky Store - 122 Nguyễn Hiền, KDC 91B, P. Tân An, TP. Cần Thơ</i>. Quý khách vui lòng đính kèm mẩu giấy ghi thông tin SĐT đặt hàng bên trong hộp giày.</li>
              <li className="policy-list-item"><strong>Bước 3:</strong> Kỹ thuật viên của Duky Store sẽ sửa chữa bảo hành (may lại chỉ, dán keo chuyên dụng, thay khóa kéo...). Thời gian xử lý thông thường từ 3 đến 7 ngày làm việc.</li>
              <li className="policy-list-item"><strong>Bước 4:</strong> Cửa hàng gửi trả giày đã bảo hành về tận nhà cho quý khách hàng. Cước phí vận chuyển gửi trả sau bảo hành sẽ do Duky Store chi trả.</li>
            </ul>
          </div>
        </div>
      </main>
    </PolicyClient>
  );
}
