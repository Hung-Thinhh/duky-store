export interface CollectionSeo {
  slug: string;
  title: string;
  description: string;
  heroImage: string;
  heroTitle: string;
  heroDescription: string;
  kicker: string;
  metaTitle: string;
  metaDescription: string;
  contentIntro: string;
}

export const COLLECTIONS: Record<string, CollectionSeo> = {
  "boot-nam": {
    slug: "boot-nam",
    title: "Giày Boot Nam Cần Thơ - Giày Da Chất Lượng Cao",
    description:
      "Bộ sưu tập giày boot nam Cần Thơ chất lượng cao, dễ phối đồ và phù hợp nhiều phong cách.",
    heroImage: "/assets/boot_nam.webp",
    heroTitle: "GIÀY BOOT\nNAM CAO CẤP",
    heroDescription:
      "Thiết kế nam tính, chất liệu bền đẹp và form dáng dễ mang hàng ngày.",
    kicker: "MEN'S COLLECTION",
    metaTitle: "Giày Boot Nam Cần Thơ - Giày Da Chất Lượng Cao",
    metaDescription:
      "Mua giày boot nam Cần Thơ chất lượng cao tại Duky Store: boot da, combat boot, chelsea boot và các mẫu giày da nam tính.",
    contentIntro:
      "Bộ sưu tập giày boot nam Duky Store tập trung vào form dáng dễ mang, chất liệu bền đẹp và khả năng phối đồ linh hoạt cho đi làm, đi chơi và sự kiện.",
  },
  "boot-nu": {
    slug: "boot-nu",
    title: "Giày Boot Nữ Cần Thơ - Giày Da Chất Lượng Cao",
    description:
      "Bộ sưu tập giày boot nữ Cần Thơ chất lượng cao, tôn dáng và dễ phối với nhiều outfit.",
    heroImage: "/assets/boot_nu.webp",
    heroTitle: "GIÀY BOOT\nNỮ CAO CẤP",
    heroDescription:
      "Tôn dáng trong từng bước đi với các mẫu boot nữ thanh lịch và cá tính.",
    kicker: "WOMEN'S COLLECTION",
    metaTitle: "Giày Boot Nữ Cần Thơ - Giày Da Chất Lượng Cao",
    metaDescription:
      "Khám phá giày boot nữ Cần Thơ chất lượng cao tại Duky Store: boot cổ ngắn, boot cao cổ, boot mũi nhọn và các mẫu tôn dáng dễ phối đồ.",
    contentIntro:
      "Danh mục giày boot nữ gồm nhiều kiểu dáng từ thanh lịch đến cá tính, phù hợp đi làm, đi chơi và tạo điểm nhấn cho outfit hàng ngày.",
  },
  "phu-kien": {
    slug: "phu-kien",
    title: "Phụ Kiện Giày Boot & Giày Da Cần Thơ",
    description:
      "Phụ kiện thời trang chất lượng cao giúp hoàn thiện outfit với giày boot và áo khoác da.",
    heroImage: "/assets/phu_kien.webp",
    heroTitle: "PHỤ KIỆN\nCAO CẤP",
    heroDescription:
      "Hoàn thiện phong cách với những chi tiết nhỏ nhưng có điểm nhấn.",
    kicker: "ACCESSORIES",
    metaTitle: "Phụ Kiện Giày Boot & Giày Da Cần Thơ - Duky Store",
    metaDescription:
      "Mua phụ kiện thời trang chất lượng cao tại Duky Store Cần Thơ: tất, thắt lưng da bò, ví da và các món phụ kiện chăm sóc giày boot.",
    contentIntro:
      "Phụ kiện Duky Store được chọn để đi cùng giày boot, áo khoác da và các outfit hàng ngày, giúp tổng thể gọn gàng và có điểm nhấn hơn.",
  },
  unisex: {
    slug: "unisex",
    title: "Thời Trang Unisex & Phối Đồ Giày Boot Cần Thơ",
    description:
      "Gợi ý outfit phối đồ unisex thời thượng cùng giày boot và áo khoác da chất lượng cao tại Duky Store Cần Thơ.",
    heroImage: "/assets/out_fit.webp",
    heroTitle: "UNISEX\nPHỐI ĐỒ",
    heroDescription:
      "Gợi ý cách kết hợp sản phẩm Duky Store thành những set đồ có phong cách riêng.",
    kicker: "UNISEX",
    metaTitle: "Thời Trang Unisex & Phối Đồ Giày Boot Cần Thơ",
    metaDescription:
      "Tham khảo outfit phối đồ unisex cá tính với giày boot, áo khoác da chất lượng cao tại Duky Store Cần Thơ.",
    contentIntro:
      "Trang outfit tập hợp các gợi ý phối đồ với giày boot, áo khoác da và phụ kiện, giúp khách hàng dễ hình dung cách mặc sản phẩm trong thực tế.",
  },
};

export const COLLECTION_SLUGS = Object.keys(COLLECTIONS);

export function getCollectionSeo(slug: string) {
  return COLLECTIONS[slug] || null;
}
