"use client";

import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";

const badges = [
  {
    icon: Truck,
    label: "Miễn phí giao hàng",
    subText: "Đơn từ 500.000đ",
  },
  {
    icon: RotateCcw,
    label: "Đổi trả dễ dàng",
    subText: "Trong 7 ngày",
  },
  {
    icon: Headphones,
    label: "Hỗ trợ 24/7",
    subText: "0986 186 281",
  },
];

export function TrustBadges() {
  return ( ""
    // <div className="w-full border border-gray-200 rounded-xl p-5">
    //   <div className="flex items-center justify-center gap-2 mb-4">
    //     <ShieldCheck size={20} className="text-green-600" />
    //     <h3 className="text-sm font-bold uppercase tracking-wide text-gray-800">
    //       DUKY STORE cam kết
    //     </h3>
    //   </div>

    //   <div className="flex flex-col md:flex-row items-center justify-around gap-4">
    //     {badges.map((badge) => (
    //       <div
    //         key={badge.label}
    //         className="flex flex-col items-center text-center gap-1"
    //       >
    //         <badge.icon size={28} className="text-gray-700" />
    //         <span className="text-sm font-semibold text-gray-800">
    //           {badge.label}
    //         </span>
    //         <span className="text-xs text-gray-500">{badge.subText}</span>
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
}
