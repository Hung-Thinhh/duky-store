"use client";

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { CartItemResponse } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemResponse[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export const CartDrawer = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove 
}: CartDrawerProps) => {
  const total = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-black">Giỏ hàng ({items.length})</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-black cursor-pointer"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag size={64} className="text-slate-200" />
                  <p className="text-slate-400">Giỏ hàng của bạn đang trống.</p>
                  <Button onClick={onClose} variant="neumorphic-dark" className="px-8 py-3">TIẾP TỤC MUA SẮM</Button>
                </div>
              ) : (
                items.map((item) => {
                  const imageUrl =
                    item.product?.thumbnailMedia?.secureUrl ||
                    item.product?.thumbnailMedia?.url ||
                    '/assets/placeholder.jpg';

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-24 h-32 rounded-2xl overflow-hidden bg-slate-50 shrink-0 relative">
                        <Image 
                          src={imageUrl} 
                          alt={item.productName} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="content font-bold text-black">{item.productName}</h3>
                          <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 cursor-pointer"><Trash2 size={16} /></button>
                        </div>
                        {item.variantName && (
                          <p className="text-xs text-slate-500">{item.variantName}</p>
                        )}
                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center gap-3 bg-slate-50 rounded-full px-3 py-1 text-black">
                            <button onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))} className="hover:text-black cursor-pointer"><Minus size={14} /></button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="hover:text-black cursor-pointer"><Plus size={14} /></button>
                          </div>
                          <span className="font-bold text-black">{formatCurrency(item.unitPrice * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-black">Tổng tiền:</span>
                  <span className="content text-lg font-serif text-black">{formatCurrency(total)}</span>
                </div>
                <Button variant="neumorphic-dark" className="w-full py-5">THANH TOÁN NGAY</Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
