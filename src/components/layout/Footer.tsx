"use client";
import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, ChevronRight, MessageCircle, UserPlus, Diamond } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BannerPage } from './BannerPage';

export const Footer = () => {
  return (
    <footer id="footer" className="w-full">
      
      {/* Top Section - Light Gray */}
      <div className="bg-black pt-4 text-white py-16 px-4 md:px-8">
        <div className="container-custom mx-auto">
          <div className="flex flex-row gap-4 justify-between w-full">
            
            {/* Left Block - 5 columns */}
            <div className="w-[70%] flex flex-row divide-x divide-gray-800 overflow-x-auto pb-0">
              
              {/* Col 1: Logo */}
              <div className="flex-shrink-0 flex flex-col items-center md:items-start text-center md:text-left pr-4 lg:pr-8">
                <Image 
                  src="/assets/logo_footer.png" // Đảm bảo đường dẫn ảnh đúng
                  alt="Duky Store"
                  width={110}
                  height={110}
                  className="object-contain mb-3 pb-2"
                />

                {/* Thông tin */}
                <p className="content text-[13px] text-white font-medium leading-relaxed max-w-[350px] py-1.5">
                  Duky Store là điểm đến lý tưởng cho những tín đồ thời trang yêu thích phong cách mạnh mẽ, cá tính với các mẫu giày boot da nam nữ độc đáo và trendy. Mua sắm an tâm với chính sách bảo hành 12 tháng và đổi trả linh hoạt.
                </p>

                {/* Liên hệ  */}
                <div className="flex-[1.5] px-4 lg:px-8 pt-4 sm:pt-0">
                  {/* <h4 className="font-bold text-[18px] mb-4 uppercase tracking-wider text-white">Liên Hệ</h4> */}
                  <ul className="space-y-2">
                    <li>
                      <div className="flex content text-[13px] items-start gap-4 py-1.5 text-[12px] text-white leading-snug">
                        <MapPin size={14} className="shrink-0 mt-0.5 text-white" />
                        <span>122 Nguyễn Hiền, KDC 91B, P. Tân An, TP. Cần Thơ</span>
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
                  <div className="flex pt-2 gap-3 mt-6 justify-center items-start md:justify-start">
                    <Link href="https://zalo.me/0939654574" target='_blank' rel='noopener noreferrer' className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-300 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                      <Image 
                        src="/assets/icons/Zalo.png" 
                        alt="Zalo" 
                        width={20} 
                        height={20} 
                        className="object-contain"
                      />
                    </Link>
                    <Link href="https://www.instagram.com/duky.store/?g=5" target='_blank' rel='noopener noreferrer' className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-300 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                      <Image 
                        src="/assets/icons/Instagram.png" 
                        alt="Instagram" 
                        width={20} 
                        height={20} 
                        className="object-contain"
                      />
                    </Link>
                    <Link href="https://www.tiktok.com/@duky.store" target='_blank' rel='noopener noreferrer'className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-300 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                      <Image 
                        src="/assets/icons/Tiktok.png" 
                        alt="Tiktok" 
                        width={20} 
                        height={20} 
                        className="object-contain"
                      />
                    </Link>
                  </div>
              </div>

              {/* Col 2: Truy cập */}
              <div className="flex-1 px-4 lg:px-8 pt-4 sm:pt-0">
                <h4 className="font-bold text-[18px] mb-4 uppercase tracking-wider text-white">Truy Cập</h4>
                <ul className="space-y-2">
                  {[
                    { label: 'Trang chủ', href: '/' },
                    { label: 'Sản phẩm', href: '/products' },
                    { label: 'Giày boot nam', href: '/collections/boot-nam' },
                    { label: 'Giày boot nữ', href: '/collections/boot-nu' },
                    { label: 'Phụ kiện', href: '/collections/phu-kien' },
                    { label: 'Unisex', href: '/collections/unisex' },
                    { label: 'Phối đồ', href: '/gallery' },
                    { label: 'Kinh nghiệm', href: '/blog' },
                    { label: 'Liên hệ', href: '/contact' },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="inline-flex items-center justify-start content text-[13px] py-1.5 text-gray-300 hover:text-white hover:scale-105 hover:translate-x-1 origin-left transition-all duration-300">
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3: Chính sách */}
              <div className="flex-1 px-4 lg:px-8 pt-4 sm:pt-0">
                <h4 className="font-bold text-[18px] mb-4 uppercase tracking-wider text-white">Chính Sách</h4>
                <ul className="space-y-2">
                  {[
                    { name: 'Chính sách bảo mật', href: '/policy' },
                    { name: 'Quy định sử dụng', href: '/policy' },
                    { name: 'Chính sách vận chuyển', href: '/policy' },
                    { name: 'Chính sách bảo hành', href: '/policy' },
                    { name: 'Chính sách đổi trả hàng', href: '/policy' },
                  ].map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="inline-flex items-center justify-start text-[13px] py-1.5 text-gray-300 hover:text-white hover:scale-105 hover:translate-x-1 origin-left transition-all duration-300">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Block - Fanpage Banner */}
            <div className="w-[30%] flex justify-end shrink-0">
              <BannerPage className="p-2 h-[250px]"/>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Section - Dark */}
      <div className="bg-black text-white py-6 px-4">
        <div className="container-custom mx-auto flex flex-row justify-center items-center gap-4 text-[13px] text-gray-400">
          <p>© 2026 Duky Store. All rights reserved.</p>
          <span className="text-gray-600">|</span>
          <div className="flex items-center gap-2">
            <Diamond size={16} className="text-white" />
            <p>Designed by Duky Agency</p>
          </div>
        </div>
      </div>
    </footer>
  );
};