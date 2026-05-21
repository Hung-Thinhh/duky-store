"use client";

import { Minus, Plus } from "lucide-react";
import { clampQuantity } from "@/lib/cart-utils";

interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (delta: number) => void;
}

export function QuantitySelector({
  quantity,
  min = 1,
  max = 99,
  onChange,
}: QuantitySelectorProps) {
  const isAtMin = quantity <= min;
  const isAtMax = quantity >= max;

  const handleDecrement = () => {
    if (isAtMin) return;
    const clamped = clampQuantity(quantity, -1, min, max);
    const delta = clamped - quantity;
    if (delta !== 0) onChange(delta);
  };

  const handleIncrement = () => {
    if (isAtMax) return;
    const clamped = clampQuantity(quantity, 1, min, max);
    const delta = clamped - quantity;
    if (delta !== 0) onChange(delta);
  };

  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-full px-3 py-1">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isAtMin}
        aria-label="Giảm số lượng"
        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-black hover:text-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Minus size={14} />
      </button>
      <span className="text-sm font-bold w-6 text-center text-black select-none">
        {quantity}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={isAtMax}
        aria-label="Tăng số lượng"
        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-black hover:text-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
