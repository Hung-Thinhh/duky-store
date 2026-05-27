import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, UserPlus } from "lucide-react";

interface BannerPageProps {
  className?: string;
}

export const BannerPage = ({ className }: BannerPageProps) => {
  return (
    <div
      className={`w-full max-w-[400px] bg-white rounded-[25px] shadow-md border border-gray-200 p-3 flex flex-col ${
        className || ""
      }`}
    >
      {/* 1. Banner Image - Thêm rounded-xl để bo góc ảnh bên trong */}
      <div className="relative aspect-[2/1] w-full bg-gray-100 rounded-xl overflow-hidden">
        <Image
          src="/assets/page_img.jpg" // Đảm bảo đường dẫn này đúng
          alt="Duky Collection"
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
      </div>

      {/* 2. Fanpage Content Bottom */}
      <div className="pt-2 pb-1 flex items-center justify-between gap-3 px-1">
        {/* Left: Info */}
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          {/* Avatar - Thêm -mt-8 nếu muốn avatar đè lên banner như Facebook thật */}
          <div className="w-14 h-14 bg-white rounded-full border-4 border-white shadow-sm overflow-hidden relative shrink-0 -mt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://graph.facebook.com/Giaybootda.Namnu.CanTho.Dukystore/picture?type=large"
              alt="Duky Store Avatar"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <h5 className="font-bold text-[14px] text-black leading-tight line-clamp-2 hover:underline cursor-pointer">
              <Link
                href="https://www.facebook.com/Giaybootda.Namnu.CanTho.Dukystore"
                target="_blank"
                rel="noopener noreferrer"
              >
                Giày boot da nam nữ Cần Thơ - Duky Store
              </Link>
            </h5>
            <p className="text-[12px] text-gray-500 mt-0.5">
              11K người theo dõi • 10 đang theo dõi
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-col gap-2 shrink-0">
          <Link
            href="https://www.facebook.com/Giaybootda.Namnu.CanTho.Dukystore/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[90px] h-[32px] bg-black text-white rounded-lg flex items-center justify-center gap-1.5 text-[12px] font-semibold hover:bg-gray-800 transition-colors"
          >
            <MessageCircle size={14} className="text-white" />
            Nhắn tin
          </Link>
          <Link
            href="https://www.facebook.com/Giaybootda.Namnu.CanTho.Dukystore/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[90px] h-[32px] bg-gray-200 border border-gray-200 text-black rounded-lg flex items-center justify-center gap-1.5 text-[12px] font-semibold hover:bg-gray-300 transition-colors"
          >
            <UserPlus size={14} />
            Theo dõi
          </Link>
        </div>
      </div>
    </div>
  );
};
