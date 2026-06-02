"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        "group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors duration-200 cursor-pointer mb-4",
        className
      )}
    >
      <ArrowLeft
        size={16}
        className="transition-transform duration-200 group-hover:-translate-x-1 shrink-0"
      />
      <span>Quay lại</span>
    </button>
  );
}

export default BackButton;
