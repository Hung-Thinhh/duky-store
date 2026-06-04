"use client";
import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  ChevronRight,
  MessageCircle,
  UserPlus,
  Diamond,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BannerPage } from "./BannerPage";

export const Footer = () => {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-footer-row {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          width: 100%;
        }
        .custom-footer-left {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .custom-footer-col1 {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          width: 100%;
        }
        .custom-footer-logo-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .custom-footer-col1-contact {
          width: 100%;
          padding-top: 1rem;
        }
        .custom-footer-col1-socials {
          display: flex;
          padding-top: 0.5rem;
          gap: 0.75rem;
          margin-top: 1.5rem;
          justify-content: flex-start;
          align-items: start;
        }
        .custom-footer-col2, .custom-footer-col3 {
          flex: 1;
          width: 100%;
          padding-top: 1rem;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        .custom-footer-right {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: start;
          padding-top: 1rem;
        }
        .custom-footer-bottom {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-align: center;
        }
        .custom-footer-divider {
          display: none;
        }
        @media (min-width: 768px) {
          .custom-footer-row {
            flex-direction: row;
            justify-content: space-between;
            gap: 1rem;
          }
          .custom-footer-left {
            width: 70%;
            flex-direction: row;
            gap: 0;
            overflow-x: auto;
          }
          .custom-footer-left > div + div {
            border-left: 1px solid rgba(255, 255, 255, 0.1);
          }
          .custom-footer-col1 {
            flex-shrink: 0;
            width: auto;
            padding-right: 2rem;
          }
          .custom-footer-col1-contact {
            flex: 1.5;
            padding-left: 0;
            padding-right: 0;
            width: auto;
          }
          .custom-footer-col1-socials {
            justify-content: flex-start;
          }
          .custom-footer-col2, .custom-footer-col3 {
            padding-top: 0;
            padding-left: 2rem;
            padding-right: 2rem;
          }
          .custom-footer-right {
            width: 30%;
            justify-content: flex-end;
            padding-top: 0;
          }
          .custom-footer-bottom {
            flex-direction: row;
            gap: 1rem;
          }
          .custom-footer-divider {
            display: inline;
          }
        }
      `,
        }}
      />
      <footer id="footer" className="w-full">
        {/* Top Section - Light Gray */}
        <div className="bg-black pt-4 text-white py-16 px-4 md:px-8">
          <div className="container-custom mx-auto">
            <div className="custom-footer-row">
              {/* Left Block - 5 columns */}
              <div className="custom-footer-left">
                {/* Col 1: Logo */}
                <div className="custom-footer-col1">
                  <div className="custom-footer-logo-wrapper">
                    <Image
                      src="/assets/logo_footer.webp"
                      alt="Duky Store"
                      width={110}
                      height={110}
                      className="object-contain mb-3 pb-2"
                    />
                  </div>

                  {/* Thông tin */}
                  <p className="content text-[13px] text-white font-medium leading-relaxed max-w-[350px] py-1.5">
                    Duky Store là điểm đến lý tưởng cho những tín đồ thời trang
                    yêu thích phong cách mạnh mẽ, cá tính với các mẫu giày boot
                    da nam nữ độc đáo và trendy. Mua sắm an tâm với chính sách
                    bảo hành 12 tháng và đổi trả linh hoạt.
                  </p>

                  {/* Liên hệ  */}
                  <div className="custom-footer-col1-contact">
                    <ul className="space-y-2">
                      <li>
                        <div className="flex content text-[13px] items-start gap-4 py-1.5 text-[12px] text-white leading-snug">
                          <MapPin
                            size={14}
                            className="shrink-0 mt-0.5 text-white"
                          />
                          <span>
                            122 Nguyễn Hiền, KDC 91B, P. Tân An, TP. Cần Thơ
                          </span>
                        </div>
                      </li>
                      <li>
                        <div className="flex content text-[13px] items-center gap-4 py-1.5 text-[12px] text-white">
                          <Phone size={14} className="shrink-0 text-white" />
                          <span>0939.654.574</span>
                        </div>
                      </li>
                      <li>
                        <div className="flex contenttext-[13px]items-center gap-4 py-1.5 text-[12px] text-white break-all">
                          <Mail size={14} className="shrink-0 text-white" />
                          <span>dukystore.info@gmail.com</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Social Icons */}
                  <div className="custom-footer-col1-socials">
                    <Link
                      href="https://zalo.me/0939654574"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-300 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <Image
                        src="/assets/icons/Zalo.svg"
                        alt="Zalo"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </Link>
                    <Link
                      href="https://www.instagram.com/duky.store/?g=5"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-300 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <Image
                        src="/assets/icons/Instagram.svg"
                        alt="Instagram"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </Link>
                    <Link
                      href="https://www.tiktok.com/@duky.store"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-300 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <Image
                        src="/assets/icons/Tiktok.svg"
                        alt="Tiktok"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </Link>
                  </div>
                </div>

                {/* Col 2: Truy cập */}
                <div className="custom-footer-col2">
                  <h4 className="font-bold text-[18px] mb-4 uppercase tracking-wider text-white">
                    Truy Cập
                  </h4>
                  <ul className="space-y-2">
                    {[
                      { label: "Trang chủ", href: "/" },
                      { label: "Sản phẩm", href: "/san-pham" },
                      { label: "Giày boot nam", href: "/boot-nam" },
                      { label: "Giày boot nữ", href: "/boot-nu" },
                      { label: "Phụ kiện", href: "/phu-kien" },
                      { label: "Unisex", href: "/unisex" },
                      { label: "Phối đồ", href: "/thu-vien" },
                      { label: "Kinh nghiệm", href: "/blog" },
                      { label: "Liên hệ", href: "/lien-he" },
                    ].map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="inline-flex items-center justify-start content text-[13px] py-1.5 text-gray-300 hover:text-white hover:scale-105 hover:translate-x-1 origin-left transition-all duration-300"
                        >
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Col 3: Chính sách */}
                <div className="custom-footer-col3">
                  <h4 className="font-bold text-[18px] mb-4 uppercase tracking-wider text-white">
                    Chính Sách
                  </h4>
                  <ul className="space-y-2">
                    {[
                      {
                        name: "Chính sách bảo mật",
                        href: "/chinh-sach-bao-mat",
                      },
                      { name: "Quy định sử dụng", href: "/quy-dinh-su-dung" },
                      {
                        name: "Chính sách vận chuyển",
                        href: "/chinh-sach-van-chuyen",
                      },
                      {
                        name: "Chính sách bảo hành",
                        href: "/chinh-sach-bao-hanh",
                      },
                      {
                        name: "Chính sách đổi trả hàng",
                        href: "/chinh-sach-doi-tra-hang",
                      },
                    ].map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="inline-flex items-center justify-start text-[13px] py-1.5 text-gray-300 hover:text-white hover:scale-105 hover:translate-x-1 origin-left transition-all duration-300"
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Block - Fanpage Banner */}
              <div className="custom-footer-right">
                <BannerPage className="p-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Dark */}
        <div className="bg-black text-white py-6 px-4">
          <div className="custom-footer-bottom text-[13px] text-gray-400">
            <p>© 2026 Duky Store. All rights reserved.</p>
            <span className="custom-footer-divider text-gray-600">|</span>
            <div className="flex items-center gap-2">
              <Diamond size={16} className="text-white" />
              <p>Designed by Duky Agency</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
