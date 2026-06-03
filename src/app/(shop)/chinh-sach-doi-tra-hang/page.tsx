import React from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PolicyClient } from "@/app/(shop)/chinh-sach/PolicyClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Chính sách đổi trả hàng",
    description: "Chính sách đổi trả hàng và hỗ trợ đổi size miễn phí trong vòng 7 ngày kể từ lúc nhận sản phẩm tại Duky Store.",
    path: "/chinh-sach-doi-tra-hang",
  });
}

export default function ReturnPolicyPage() {
  return (
    <PolicyClient>
      <main className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">CHÍNH SÁCH ĐỔI TRẢ & HOÀN TIỀN</h1>
          <p className="policy-intro">
            Duky Store luôn đặt lợi ích của khách hàng lên hàng đầu. Nếu sản phẩm nhận được không vừa size, không đúng như mong đợi hoặc bị lỗi sản xuất, chúng tôi hỗ trợ đổi trả linh hoạt trong vòng 7 ngày.
          </p>

          <div className="policy-section">
            <h2 className="policy-section-title">1. Thời Gian Hỗ Trợ Đổi Trả</h2>
            <p className="policy-section-content">
              Khách hàng có quyền yêu cầu đổi size hoặc trả hàng hoàn tiền trong vòng tối đa <strong>7 ngày</strong> kể từ ngày ký nhận sản phẩm từ nhân viên chuyển phát. Sau thời gian này, chúng tôi rất tiếc không thể hỗ trợ đổi trả (ngoại trừ các lỗi nằm trong diện bảo hành 12 tháng).
            </p>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">2. Điều Kiện Để Được Đổi Trả</h2>
            <p className="policy-section-content">
              Sản phẩm gửi lại đổi trả phải đáp ứng đầy đủ các tiêu chuẩn sau để đảm bảo quyền lợi của cả hai bên:
            </p>
            <ul className="policy-list" style={{ marginTop: "10px" }}>
              <li className="policy-list-item">Sản phẩm phải còn mới 100%, chưa qua sử dụng (đế giày sạch sẽ, không bị mài mòn, không có vết nhăn nứt gấp da do mang đi lại).</li>
              <li className="policy-list-item">Sản phẩm còn đầy đủ hộp giày nguyên vẹn của Duky Store, thẻ tag giá, hóa đơn mua hàng và các quà tặng đi kèm (nếu có).</li>
              <li className="policy-list-item">Có video mở hộp sản phẩm từ lúc nhận hàng làm bằng chứng đối chiếu đối với các trường hợp báo lỗi vỡ nứt gãy hoặc thiếu hàng.</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">3. Chính Sách Đổi Size (Hỗ Trợ Không Vừa Size)</h2>
            <p className="policy-section-content">
              Nếu quý khách thử giày và thấy rộng hoặc chật, Duky Store hỗ trợ đổi size khác của cùng một mẫu mã:
            </p>
            <ul className="policy-list" style={{ marginTop: "10px" }}>
              <li className="policy-list-item">Duky Store miễn phí công xử lý đổi hàng. Quý khách vui lòng thanh toán chi phí vận chuyển 2 chiều cho bên giao nhận.</li>
              <li className="policy-list-item">Trong trường hợp size cần đổi đã hết hàng, quý khách có thể chọn đổi sang một mẫu sản phẩm khác có giá trị tương đương hoặc cao hơn (thanh toán thêm phần chênh lệch giá).</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">4. Chính Sách Hoàn Tiền (Trả Hàng)</h2>
            <p className="policy-section-content">
              Duky Store áp dụng chính sách trả hàng hoàn tiền 100% đối với các trường hợp lỗi bắt nguồn từ phía chúng tôi:
            </p>
            <ul className="policy-list" style={{ marginTop: "10px" }}>
              <li className="policy-list-item">Sản phẩm bị lỗi nghiêm trọng từ nhà sản xuất ngay khi mở hộp (trầy xước da nặng, rách da, bung chỉ viền móng đế, hỏng zip...).</li>
              <li className="policy-list-item">Giao sai hoàn toàn mẫu mã, sai màu sắc hoặc sai size so với thông tin trên đơn hàng đã đặt.</li>
              <li className="policy-list-item"><strong>Phương thức hoàn tiền:</strong> Hoàn trả qua chuyển khoản ngân hàng ngay khi Duky Store nhận lại sản phẩm hoàn trả và xác nhận tình trạng đáp ứng đủ điều kiện ở mục 2. Thời gian hoàn tiền từ 24h - 48h.</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2 className="policy-section-title">5. Hướng Dẫn Các Bước Đổi Trả</h2>
            <ul className="policy-list" style={{ marginTop: "10px" }}>
              <li className="policy-list-item"><strong>Bước 1:</strong> Liên hệ bộ phận hỗ trợ khách hàng qua Hotline/Zalo: 0939.654.574, cung cấp số điện thoại đặt hàng kèm lý do muốn đổi/trả.</li>
              <li className="policy-list-item"><strong>Bước 2:</strong> Gửi gói hàng đổi trả bao gồm sản phẩm, hộp giày và quà tặng về địa chỉ: <i>Duky Store - 122 Nguyễn Hiền, KDC 91B, P. Tân An, TP. Cần Thơ</i>.</li>
              <li className="policy-list-item"><strong>Bước 3:</strong> Khi nhận được hàng gửi về, Duky Store sẽ kiểm tra và thực hiện gửi ngay sản phẩm size mới/mẫu mới cho quý khách, hoặc tiến hành chuyển khoản hoàn tiền cho quý khách theo quy định.</li>
            </ul>
          </div>
        </div>
      </main>
    </PolicyClient>
  );
}
