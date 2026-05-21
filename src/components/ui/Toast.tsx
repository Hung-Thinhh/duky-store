'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { CheckCircle, XCircle, X } from 'lucide-react';

export function Toast() {
  const { toast, dismissToast } = useCart();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border transition-all duration-300 animate-slide-in ${
        isSuccess
          ? 'bg-white border-green-200 text-green-800'
          : 'bg-white border-red-200 text-red-800'
      }`}
    >
      {isSuccess ? (
        <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
      ) : (
        <XCircle size={20} className="text-red-500 flex-shrink-0" />
      )}
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={dismissToast}
        className="ml-2 p-1 hover:bg-gray-100 rounded-full cursor-pointer flex-shrink-0"
        aria-label="Đóng thông báo"
      >
        <X size={14} />
      </button>
    </div>
  );
}
