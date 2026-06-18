import React from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  slug: string;
  name: string;
  imageUrl: string;
  originalPrice: string;
  salePrice: string;
  quantity?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  slug,
  name,
  imageUrl,
  originalPrice,
  salePrice,
  quantity,
}) => {
  const origPrice = Number(originalPrice) || 0;
  const sPrice = Number(salePrice) || 0;
  const hasSale = sPrice > 0 && sPrice < origPrice;
  const activePrice = hasSale ? sPrice : origPrice;
  const qty = quantity !== undefined && quantity !== "" ? Number(quantity) : null;
  const discountPercent = hasSale ? Math.round(((origPrice - sPrice) / origPrice) * 100) : 0;

  const formatVNPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  let fullImageUrl = imageUrl;
  if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("data:")) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const host = API_URL.replace(/\/api\/v1\/?$/, "");
    fullImageUrl = `${host}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  }

  return (
    <Link
      href={`/san-pham/${slug}`}
      className="group flex items-center gap-4.5 p-3 my-3 bg-zinc-50 hover:bg-zinc-100/90 border border-zinc-200/60 hover:border-zinc-300 rounded-2xl transition-all duration-300 w-full cursor-pointer text-left shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden font-sans animate-fade-in"
    >
      {/* Product Image and Discount Badge */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 relative border border-zinc-200/80 flex items-center justify-center shadow-xs">
        <img
          src={fullImageUrl || "/assets/images/placeholder.jpg"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/assets/images/placeholder.jpg";
          }}
        />
        {hasSale && (
          <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow-xs z-10 select-none font-sans tracking-wider">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
        {/* Title */}
        <h4 className="text-sm font-bold text-zinc-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug tracking-tight font-sans" title={name}>
          {name}
        </h4>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-extrabold text-zinc-950 font-sans">
            {formatVNPrice(activePrice)}
          </span>
          {hasSale && (
            <span className="text-xs text-zinc-400 line-through font-medium font-sans">
              {formatVNPrice(origPrice)}
            </span>
          )}
        </div>

        {/* Stock status tag */}
        <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium font-sans select-none">
          <Package className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>Còn lại:</span>
          {qty !== null ? (
            <span className={cn("font-bold", qty > 0 ? "text-emerald-500" : "text-rose-500")}>
              {qty}
            </span>
          ) : (
            <span className="text-zinc-400">Liên hệ</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
