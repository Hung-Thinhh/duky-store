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
    title: "Giày Boot Nam Cao Cấp",
    description:
      "Bộ sưu tập giày boot nam cao cấp, dễ phối đồ và phù hợp nhiều phong cách.",
    heroImage: "/assets/boot_nam.webp",
    heroTitle: "GIÀY BOOT\nNAM CAO CẤP",
    heroDescription:
      "Thiết kế nam tính, chất liệu bền đẹp và form dáng dễ mang hàng ngày.",
    kicker: "MEN'S COLLECTION",
    metaTitle: "Giày Boot Nam Cao Cấp",
    metaDescription:
      "Mua giày boot nam cao cấp tại Duky Store: boot da, combat boot, chelsea boot và các mẫu giày dễ phối đồ cho nam.",
    contentIntro:
      "Bộ sưu tập giày boot nam Duky Store tập trung vào form dáng dễ mang, chất liệu bền đẹp và khả năng phối đồ linh hoạt cho đi làm, đi chơi và sự kiện.",
  },
  "boot-nu": {
    slug: "boot-nu",
    title: "Giày Boot Nữ Cao Cấp",
    description:
      "Bộ sưu tập giày boot nữ cao cấp, tôn dáng và dễ phối với nhiều outfit.",
    heroImage: "/assets/boot_nu.webp",
    heroTitle: "GIÀY BOOT\nNỮ CAO CẤP",
    heroDescription:
      "Tôn dáng trong từng bước đi với các mẫu boot nữ thanh lịch và cá tính.",
    kicker: "WOMEN'S COLLECTION",
    metaTitle: "Giày Boot Nữ Cao Cấp",
    metaDescription:
      "Khám phá giày boot nữ cao cấp tại Duky Store: boot cổ ngắn, boot cao cổ, boot mũi nhọn và các mẫu tôn dáng dễ phối đồ.",
    contentIntro:
      "Danh mục giày boot nữ gồm nhiều kiểu dáng từ thanh lịch đến cá tính, phù hợp đi làm, đi chơi và tạo điểm nhấn cho outfit hàng ngày.",
  },
  "phu-kien": {
    slug: "phu-kien",
    title: "Phụ Kiện Thời Trang",
    description:
      "Phụ kiện thời trang giúp hoàn thiện outfit với giày boot và áo khoác da.",
    heroImage: "/assets/phu_kien.webp",
    heroTitle: "PHỤ KIỆN\nCAO CẤP",
    heroDescription:
      "Hoàn thiện phong cách với những chi tiết nhỏ nhưng có điểm nhấn.",
    kicker: "ACCESSORIES",
    metaTitle: "Phụ Kiện Thời Trang",
    metaDescription:
      "Mua phụ kiện thời trang tại Duky Store: tất, thắt lưng, cà vạt, nón và các món phụ kiện dễ phối với giày boot.",
    contentIntro:
      "Phụ kiện Duky Store được chọn để đi cùng giày boot, áo khoác da và các outfit hàng ngày, giúp tổng thể gọn gàng và có điểm nhấn hơn.",
  },
  unisex: {
    slug: "unisex",
    title: "Unisex",
    description:
      "Gợi ý outfit phối đồ cùng giày boot, áo khoác da và phụ kiện Duky Store.",
    heroImage: "/assets/out_fit.webp",
    heroTitle: "UNISEX\nPHỐI ĐỒ",
    heroDescription:
      "Gợi ý cách kết hợp sản phẩm Duky Store thành những set đồ có phong cách riêng.",
    kicker: "UNISEX",
    metaTitle: "Outfit Phối Đồ Với Giày Boot",
    metaDescription:
      "Tham khảo outfit phối đồ với giày boot, áo khoác da và phụ kiện Duky Store cho nam nữ.",
    contentIntro:
      "Trang outfit tập hợp các gợi ý phối đồ với giày boot, áo khoác da và phụ kiện, giúp khách hàng dễ hình dung cách mặc sản phẩm trong thực tế.",
  },
};

export const COLLECTION_SLUGS = Object.keys(COLLECTIONS);

export function getCollectionSeo(slug: string) {
  return COLLECTIONS[slug] || null;
}
