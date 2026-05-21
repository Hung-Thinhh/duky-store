# Requirements Document

## Introduction

Tính năng "Kiểm tra điều kiện trước khi thêm vào giỏ hàng" đảm bảo rằng người dùng phải chọn đầy đủ thuộc tính sản phẩm (size, màu sắc) và sản phẩm phải còn hàng trước khi thêm vào giỏ hàng hoặc thanh toán nhanh. Đồng thời, tính năng này kết nối giỏ hàng frontend với backend API để đồng bộ dữ liệu giỏ hàng qua sessionId.

## Glossary

- **Hệ_thống_Validation**: Module kiểm tra điều kiện trước khi thực hiện hành động thêm giỏ hàng hoặc thanh toán nhanh
- **CartContext**: React Context quản lý trạng thái giỏ hàng trên frontend
- **Backend_Cart_API**: API endpoint POST /cart/items trên NestJS backend xử lý thêm sản phẩm vào giỏ hàng
- **InfoSection**: Component hiển thị thông tin sản phẩm, bao gồm bộ chọn size/màu/số lượng và nút hành động
- **Variant**: Biến thể sản phẩm được xác định bởi tổ hợp size và màu sắc, có thông tin tồn kho riêng
- **SessionId**: UUID duy nhất được tạo và lưu trong localStorage để định danh giỏ hàng của khách (guest cart)
- **Toast**: Thông báo ngắn hiển thị tạm thời trên giao diện để phản hồi kết quả hành động

## Requirements

### Requirement 1: Kiểm tra điều kiện khi thêm vào giỏ hàng

**User Story:** Là người mua hàng, tôi muốn hệ thống kiểm tra đầy đủ điều kiện trước khi thêm sản phẩm vào giỏ hàng, để tôi không thêm sản phẩm thiếu thông tin hoặc hết hàng.

#### Acceptance Criteria

1. WHEN người dùng nhấn nút "Thêm vào giỏ hàng" mà chưa chọn size (đối với sản phẩm có nhiều size), THEN Hệ_thống_Validation SHALL hiển thị thông báo lỗi "Vui lòng chọn size" ngay cạnh bộ chọn size
2. WHEN người dùng nhấn nút "Thêm vào giỏ hàng" mà chưa chọn màu (đối với sản phẩm có nhiều màu), THEN Hệ_thống_Validation SHALL hiển thị thông báo lỗi "Vui lòng chọn màu" ngay cạnh bộ chọn màu
3. WHEN người dùng nhấn nút "Thêm vào giỏ hàng" và Variant tương ứng có availableQuantity bằng 0, THEN Hệ_thống_Validation SHALL hiển thị thông báo lỗi "Sản phẩm đã hết hàng"
4. WHEN người dùng nhấn nút "Thêm vào giỏ hàng" và số lượng yêu cầu vượt quá availableQuantity của Variant, THEN Hệ_thống_Validation SHALL hiển thị thông báo lỗi cho biết số lượng tồn kho không đủ
5. WHEN tất cả điều kiện validation đều hợp lệ (size đã chọn, màu đã chọn, tồn kho đủ), THEN Hệ_thống_Validation SHALL gọi Backend_Cart_API để thêm sản phẩm vào giỏ hàng
6. WHEN Backend_Cart_API trả về thành công, THEN Hệ_thống_Validation SHALL hiển thị Toast thông báo "Đã thêm vào giỏ hàng"

### Requirement 2: Kiểm tra điều kiện khi thanh toán nhanh

**User Story:** Là người mua hàng, tôi muốn thanh toán nhanh một sản phẩm mà vẫn được kiểm tra đầy đủ điều kiện, để tôi có thể mua hàng nhanh chóng mà không gặp lỗi.

#### Acceptance Criteria

1. WHEN người dùng nhấn nút "Thanh toán nhanh" mà chưa chọn size hoặc màu, THEN Hệ_thống_Validation SHALL hiển thị thông báo lỗi tương tự như khi thêm vào giỏ hàng
2. WHEN người dùng nhấn nút "Thanh toán nhanh" và Variant hết hàng hoặc số lượng không đủ, THEN Hệ_thống_Validation SHALL hiển thị thông báo lỗi tương ứng
3. WHEN tất cả điều kiện validation hợp lệ và người dùng nhấn "Thanh toán nhanh", THEN Hệ_thống_Validation SHALL điều hướng đến trang checkout với thông tin sản phẩm/variant đã chọn
4. WHEN trang checkout nhận được thông tin từ thanh toán nhanh, THEN trang checkout SHALL hiển thị đúng một sản phẩm với variant, số lượng và giá đã chọn

### Requirement 3: Kết nối giỏ hàng Frontend với Backend API

**User Story:** Là người mua hàng, tôi muốn giỏ hàng được lưu trữ trên server, để tôi không mất giỏ hàng khi đóng trình duyệt hoặc chuyển thiết bị.

#### Acceptance Criteria

1. WHEN CartContext được khởi tạo lần đầu và chưa có sessionId trong localStorage, THEN CartContext SHALL tạo một UUID mới và lưu vào localStorage
2. WHEN CartContext được khởi tạo và đã có sessionId trong localStorage, THEN CartContext SHALL sử dụng sessionId hiện có
3. WHEN trang web được tải, THEN CartContext SHALL gọi Backend_Cart_API (GET /cart?sessionId=...) để đồng bộ trạng thái giỏ hàng từ server
4. WHEN hàm addToCart được gọi, THEN CartContext SHALL gọi Backend_Cart_API (POST /cart/items) với sessionId, productId, variantId và quantity
5. WHEN Backend_Cart_API trả về lỗi (ví dụ: hết hàng, sản phẩm không tồn tại), THEN CartContext SHALL hiển thị Toast thông báo lỗi với nội dung từ server

### Requirement 4: Trải nghiệm người dùng khi có lỗi

**User Story:** Là người mua hàng, tôi muốn nhận được phản hồi rõ ràng khi có lỗi validation, để tôi biết cần làm gì để hoàn tất hành động.

#### Acceptance Criteria

1. THE Hệ_thống_Validation SHALL hiển thị thông báo lỗi inline ngay cạnh bộ chọn tương ứng (size hoặc màu) thay vì chỉ dùng alert hoặc toast
2. WHILE Variant được chọn có availableQuantity bằng 0, THE InfoSection SHALL vô hiệu hóa (disable) nút "Thêm vào giỏ hàng" và nút "Thanh toán nhanh"
3. WHILE chưa có Variant nào được chọn (chưa chọn size hoặc màu), THE InfoSection SHALL hiển thị trạng thái mặc định cho nút mà không vô hiệu hóa
4. WHEN Backend_Cart_API trả về lỗi, THEN Hệ_thống_Validation SHALL hiển thị Toast thông báo lỗi với nội dung mô tả cụ thể từ response
5. WHEN thêm vào giỏ hàng thành công, THEN Hệ_thống_Validation SHALL hiển thị Toast thông báo thành công và cập nhật số lượng giỏ hàng trên header
