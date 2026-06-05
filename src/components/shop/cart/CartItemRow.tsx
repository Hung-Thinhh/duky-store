"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { CartItemResponse } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { QuantitySelector } from "@/components/shop/cart/QuantitySelector";

interface CartItemRowProps {
  item: CartItemResponse;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItemRow({
  item,
  isSelected,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const lineTotal = item.unitPrice * item.quantity;
  const imageUrl =
    item.product?.thumbnailMedia?.secureUrl ||
    item.product?.thumbnailMedia?.url;

  return (
    <div className="relative border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white min-h-[180px] flex">
      {/* Delete button - top right corner */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Xóa ${item.productName}`}
        className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
      >
        <Trash2 size={18} />
      </button>

      {/* Checkbox */}
      <label className="min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 cursor-pointer self-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          aria-label={`Chọn ${item.productName}`}
          className="w-5 h-5 accent-black cursor-pointer"
        />
      </label>

      {/* Product image */}
      <div className="w-[100px] h-[120px] sm:w-[120px] sm:h-[140px] rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 relative ml-2">
        <Image
          src={imageUrl}
          alt={item.productName}
          width={120}
          height={140}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0 ml-4 pr-10 flex flex-col justify-between">
        {/* Top: name */}
        <div>
          <div className="px-2 content text-base sm:text-sm font-semibold text-black leading-snug line-clamp-2">
            {item.productName}
          </div>
          {item.variantName && (
            <p className="p-2 text-xs text-slate-500 mt-1">
              {item.variantName}
            </p>
          )}
        </div>

        {/* Bottom: quantity selector + price */}
        <div className="flex items-center justify-between mt-4">
          <QuantitySelector
            quantity={item.quantity}
            onChange={(delta) =>
              onUpdateQuantity(item.id, item.quantity + delta)
            }
          />

          <span className="text-base sm:text-lg font-bold text-black">
            {formatCurrency(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
