"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Navpages } from "@/components/shop/Navpages";
import { useCart } from "@/context/CartContext";
import { FAQOnly } from "@/components/shop/home/FAQOnly";

interface BannerContent {
  image: string;
  alt: string;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
}

const CONTACT_BANNER: BannerContent = {
  image: "/assets/banner_contact.webp",
  alt: "Liên hệ - Duky Store",
  badge: "CONTACT US",
  titleLine1: "LIÊN HỆ",
  titleLine2: "DUKY STORE",
  description:
    "Bạn đang cần sự hỗ trợ? Hãy liên hệ với Duky Store — chúng tôi luôn sẵn sàng giúp đỡ bạn.",
};

interface StorePhoto {
  caption: string;
  image: string;
}

const STORE_PHOTOS: StorePhoto[] = [
  {
    caption: "Không gian mặt tiền sang trọng tại cửa hàng Duky Store",
    image: "/assets/cua_hang_1.webp",
  },
  {
    caption: "Khu vực trưng bày các sản phẩm giày da cao cấp",
    image: "/assets/cua_hang_2.webp",
  },
  {
    caption: "Góc trải nghiệm sản phẩm và thử giày rộng rãi",
    image: "/assets/cua_hang_3.webp",
  },
  {
    caption: "Không gian mua sắm hiện đại và chuyên nghiệp",
    image: "/assets/cua_hang_4.webp",
  },
  {
    caption: "Nhiều mẫu giày boot nam nữ, giày da cao cấp",
    image: "/assets/cua_hang_5.webp",
  },
];

const STORE_SECTION_HEADER = {
  title: "Cửa hàng DUKY STORE",
  subtitle:
    "Ghé thăm cửa hàng của chúng tôi để trải nghiệm không gian mua sắm hiện đại, sang trọng và nhận sự tư vấn tận tình nhất từ đội ngũ nhân viên chuyên nghiệp.",
};

export default function ContactPage() {
  const { cartCount } = useCart();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <>
      <Header cartCount={cartCount} />

      {/* Hero Banner */}
      <section
        className="relative w-full"
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
      >
        <Image
          src={CONTACT_BANNER.image}
          alt={CONTACT_BANNER.alt}
          width={1920}
          height={1080}
          sizes="100vw"
          className="w-full h-[260px] sm:h-[320px] md:h-auto object-cover"
          priority
        />
        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20">
            <div className="space-y-2 md:space-y-3 max-w-sm sm:max-w-md">
              <span className="inline-block text-[10px] md:text-xs font-medium tracking-widest text-zinc-400 uppercase">
                {CONTACT_BANNER.badge}
              </span>
              <h1 className="leading-[1.1] tracking-tighter text-white">
                <span className="block text-[24px] sm:text-[36px] md:text-[52px] lg:text-[64px] font-semibold">
                  {CONTACT_BANNER.titleLine1}
                </span>
                <span className="block text-[20px] sm:text-[30px] md:text-[44px] lg:text-[56px] font-medium italic -mt-1 md:-mt-2">
                  <span className="font-montserrat not-italic font-semibold tracking-wide text-white inline-block ml-1 md:ml-2">
                    {CONTACT_BANNER.titleLine2}
                  </span>
                </span>
              </h1>
              <div className="flex items-start gap-2 md:gap-3 max-w-[170px] sm:max-w-sm">
                <div className="w-6 sm:w-8 h-px bg-white mt-2 shrink-0" />
                <p className="text-[11px] md:text-sm text-zinc-300 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
                  {CONTACT_BANNER.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-page">
        <Navpages
          items={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]}
        />

        {/* Company Store Section */}
        <div className="store-section">
          <div className="store-header">
            <h2 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-black leading-tight tracking-tight py-2">
              {STORE_SECTION_HEADER.title}
            </h2>
            <p className="store-subtitle">{STORE_SECTION_HEADER.subtitle}</p>
          </div>

          <div className="store-grid store-grid-top">
            {STORE_PHOTOS.slice(0, 2).map((photo, index) => (
              <div key={index} className="store-card">
                <div className="store-img-wrap">
                  <Image
                    src={photo.image}
                    alt={photo.caption}
                    width={600}
                    height={375}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="store-img"
                    priority
                  />
                </div>
                <div className="store-info">
                  <h3 className="store-photo-caption">{photo.caption}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="store-grid store-grid-bottom">
            {STORE_PHOTOS.slice(2).map((photo, index) => (
              <div key={index} className="store-card">
                <div className="store-img-wrap">
                  <Image
                    src={photo.image}
                    alt={photo.caption}
                    width={400}
                    height={300}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="store-img"
                  />
                </div>
                <div className="store-info">
                  <h3 className="store-photo-caption">{photo.caption}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="contact-layout">
          {/* Left: Contact Info */}
          <div className="contact-info">
            <div className="info-card">
              <div className="info-card-header">
                <h2 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-black leading-tight tracking-tight">
                  Thông tin liên hệ
                </h2>
              </div>
              <p className="info-card-desc">
                Liên hệ với chúng tôi qua các kênh dưới đây hoặc gửi tin nhắn
                trực tiếp.
              </p>

              <div className="info-list">
                <div className="info-item">
                  <div className="info-icon">
                    <MapPin size={18} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Địa chỉ</span>
                    <span className="info-value">
                      122 Nguyễn Hiền, KDC 91B, P. Tân An, TP. Cần Thơ
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <Phone size={18} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Số điện thoại</span>
                    <span className="info-value">0939.654.574</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <Mail size={18} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Email</span>
                    <span className="info-value">dukystore.info@gmail.com</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <Clock size={18} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Giờ làm việc</span>
                    <span className="info-value">
                      9:00 - 18:00 (Thứ 2 - Thứ 7)
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="social-links">
                <a
                  href="https://zalo.me/0939654574"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn social-btn--zalo"
                  aria-label="Zalo"
                >
                  <Image
                    src="/assets/icons/Zalo.png"
                    alt="Zalo"
                    width={22}
                    height={22}
                  />
                </a>
                <a
                  href="https://www.instagram.com/duky.store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn social-btn--instagram"
                  aria-label="Instagram"
                >
                  <Image
                    src="/assets/icons/Instagram.png"
                    alt="Instagram"
                    width={22}
                    height={22}
                  />
                </a>
                <a
                  href="https://www.tiktok.com/@duky.store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn social-btn--tiktok"
                  aria-label="TikTok"
                >
                  <Image
                    src="/assets/icons/Tiktok.png"
                    alt="TikTok"
                    width={22}
                    height={22}
                  />
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="map-card">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.0!2d105.7558!3d10.0230!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a088487f863ae3%3A0x704afb4eb3949570!2s122%20%C4%90.%20Nguy%E1%BB%85n%20Hi%E1%BB%81n%2C%20KDC%2091B%2C%20T%C3%A2n%20An%2C%20C%E1%BA%A7n%20Th%C6%A1!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: 16, minHeight: 300 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Duky Store Location"
              />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQOnly className="contact-faq" />
      </section>

      <Footer />

      <style jsx>{`
        .contact-page {
          max-width: 1440px;
          margin: 0 auto;
          padding: 32px 2rem 56px;
        }

        .contact-faq {
          padding-left: 0 !important;
          padding-right: 0 !important;
          margin-bottom: 0 !important;
        }
        .contact-faq :global(.container-custom) {
          padding-left: 0 !important;
          padding-right: 0 !important;
          max-width: 100% !important;
        }

        .contact-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .contact-title {
          font-family: var(--font-accent);
          font-size: 32px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .contact-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          max-width: 500px;
          margin: 0 auto;
        }

        /* ─── Store Section ─── */
        .store-section {
          max-width: 1200px;
          margin: 0 auto 32px;
        }

        .store-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .store-title {
          font-family: var(--font-accent);
          font-size: 28px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .store-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .store-grid {
          display: grid;
          gap: 24px;
        }

        .store-grid-top {
          grid-template-columns: repeat(2, 1fr);
          margin-bottom: 24px;
        }

        .store-grid-bottom {
          grid-template-columns: repeat(3, 1fr);
        }

        .store-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--card-shadow);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .store-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .store-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #f0f0f0;
        }

        .store-grid-top .store-img-wrap {
          aspect-ratio: 16 / 10;
        }

        :global(.store-img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .store-card:hover :global(.store-img) {
          transform: scale(1.06);
        }

        .store-info {
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 56px;
        }

        .store-photo-caption {
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-main);
          text-align: center;
          line-height: 1.4;
        }

        .contact-layout {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* ─── Info Card ─── */
        .contact-info {
          display: grid;
          grid-template-columns: 0.8fr 1.4fr;
          gap: 20px;
        }

        .info-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-section);
          padding: 28px;
          box-shadow: var(--card-shadow);
        }

        .info-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          color: var(--text-main);
        }

        .info-card-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        .info-card-desc {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
          flex-shrink: 0;
        }

        .info-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .info-label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .info-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
        }

        .social-links {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--border-subtle);
        }

        .social-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: var(--transition-fast);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .social-btn:hover {
          transform: scale(1.12);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .social-btn--zalo {
          background: #0068ff;
        }

        .social-btn--facebook {
          background: #1877f2;
        }

        .social-btn--instagram {
          background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af);
        }

        .social-btn--tiktok {
          background: #010101;
        }

        .map-card {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--card-shadow);
          height: 100%;
          min-height: 300px;
        }

        /* ─── Form Card ─── */
        .contact-form-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-section);
          padding: 32px;
          box-shadow: var(--card-shadow);
        }

        .form-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .form-desc {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        .form-success {
          padding: 12px 16px;
          border-radius: 10px;
          background: #dcfce7;
          color: #16a34a;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-main);
        }

        .form-input {
          padding: 11px 14px;
          border: 1px solid var(--border-input);
          border-radius: 10px;
          font-size: 13px;
          font-family: var(--font-main);
          color: var(--text-main);
          outline: none;
          transition: var(--transition-fast);
          background: #fff;
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .form-input:focus {
          border-color: var(--text-main);
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #1a1a1a, #3a3a3a);
          color: #fff;
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          align-self: flex-start;
        }

        .form-submit-btn:hover {
          background: linear-gradient(135deg, #000000, #2a2a2a);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .contact-info {
            grid-template-columns: 1fr;
          }
          .store-grid-top,
          .store-grid-bottom {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .contact-page {
            padding: 24px 1rem 60px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .contact-title {
            font-size: 24px;
          }

          .store-grid-top,
          .store-grid-bottom {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .store-grid-top {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </>
  );
}
