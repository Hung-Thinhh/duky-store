export interface CollectionSeo {
  slug: string;
  title: string;
  description: string;
  heroImage: string;
  heroTitle: string;
  heroDescription: string;
  metaTitle: string;
  metaDescription: string;
  contentIntro: string;
}

export const COLLECTIONS: Record<string, CollectionSeo> = {
  "boot-nam": {
    slug: "boot-nam",
    title: "Giay Boot Nam Cao Cap",
    description:
      "Bo suu tap giay boot nam cao cap, de phoi do va phu hop nhieu phong cach.",
    heroImage: "/assets/banner_boot_nam.png",
    heroTitle: "GIAY BOOT NAM CAO CAP",
    heroDescription:
      "Thiet ke nam tinh, chat lieu ben dep va form dang de mang hang ngay.",
    metaTitle: "Giay Boot Nam Cao Cap",
    metaDescription:
      "Mua giay boot nam cao cap tai Duky Store: boot da, combat boot, chelsea boot va cac mau giay de phoi do cho nam.",
    contentIntro:
      "Bo suu tap giay boot nam Duky Store tap trung vao form dang de mang, chat lieu ben dep va kha nang phoi do linh hoat cho di lam, di choi va su kien.",
  },
  "boot-nu": {
    slug: "boot-nu",
    title: "Giay Boot Nu Cao Cap",
    description:
      "Bo suu tap giay boot nu cao cap, ton dang va de phoi voi nhieu outfit.",
    heroImage: "/assets/banner_boot_nu.png",
    heroTitle: "GIAY BOOT NU CAO CAP",
    heroDescription:
      "Ton dang trong tung buoc di voi cac mau boot nu thanh lich va ca tinh.",
    metaTitle: "Giay Boot Nu Cao Cap",
    metaDescription:
      "Kham pha giay boot nu cao cap tai Duky Store: boot co ngan, boot cao co, boot mui nhon va cac mau ton dang de phoi do.",
    contentIntro:
      "Danh muc giay boot nu gom nhieu kieu dang tu thanh lich den ca tinh, phu hop di lam, di choi va tao diem nhan cho outfit hang ngay.",
  },
  "phu-kien": {
    slug: "phu-kien",
    title: "Phu Kien Thoi Trang",
    description:
      "Phu kien thoi trang giup hoan thien outfit voi giay boot va ao khoac da.",
    heroImage: "/assets/phu_kien.png",
    heroTitle: "PHU KIEN THOI TRANG",
    heroDescription:
      "Hoan thien phong cach voi nhung chi tiet nho nhung co diem nhan.",
    metaTitle: "Phu Kien Thoi Trang",
    metaDescription:
      "Mua phu kien thoi trang tai Duky Store: tat, that lung, ca vat, non va cac mon phu kien de phoi voi giay boot.",
    contentIntro:
      "Phu kien Duky Store duoc chon de di cung giay boot, ao khoac da va cac outfit hang ngay, giup tong the gon gon va co diem nhan hon.",
  },
  outfit: {
    slug: "outfit",
    title: "Outfit Phoi Do",
    description:
      "Goi y outfit phoi do cung giay boot, ao khoac da va phu kien Duky Store.",
    heroImage: "/assets/out_fit.png",
    heroTitle: "OUTFIT PHOI DO",
    heroDescription:
      "Goi y cach ket hop san pham Duky Store thanh nhung set do co phong cach rieng.",
    metaTitle: "Outfit Phoi Do Voi Giay Boot",
    metaDescription:
      "Tham khao outfit phoi do voi giay boot, ao khoac da va phu kien Duky Store cho nam nu.",
    contentIntro:
      "Trang outfit tap hop cac goi y phoi do voi giay boot, ao khoac da va phu kien, giup khach hang de hinh dung cach mac san pham trong thuc te.",
  },
};

export const COLLECTION_SLUGS = Object.keys(COLLECTIONS);

export function getCollectionSeo(slug: string) {
  return COLLECTIONS[slug] || null;
}
