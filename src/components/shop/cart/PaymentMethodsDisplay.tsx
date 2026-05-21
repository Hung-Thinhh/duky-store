import { Banknote, Building2, CreditCard } from "lucide-react";

const paymentMethods = [
  {
    icon: Banknote,
    label: "Thanh toán khi nhận hàng (COD)",
    subText: "Thanh toán bằng tiền mặt khi nhận hàng",
  },
  {
    icon: Building2,
    label: "Chuyển khoản ngân hàng",
    subText: "Thanh toán qua tài khoản ngân hàng",
  }
];

export function PaymentMethodsDisplay() {
  return ( ""
    // <div className="lg:sticky lg:top-4 bg-white rounded-3xl p-6 md:p-8 shadow-[6px_6px_16px_rgba(0,0,0,0.06),-6px_-6px_16px_rgba(255,255,255,0.8)]">
    //   <h3 className="font-serif text-lg font-bold text-black tracking-tight mb-4">
    //     Phương thức thanh toán
    //   </h3>
    //   <div className="space-y-3">
    //     {paymentMethods.map((method) => (
    //       <div key={method.label} className="flex items-start gap-3">
    //         <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 shrink-0">
    //           <method.icon size={16} className="text-slate-600" />
    //         </div>
    //         <div className="flex-1 min-w-0">
    //           <p className="text-sm font-medium text-black">{method.label}</p>
    //           <p className="text-xs text-slate-400">{method.subText}</p>
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
}
