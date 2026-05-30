"use client";

import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

/**
 * Client component that renders the cart toast notification.
 * Extracted from the homepage to allow the page shell to remain a Server Component.
 */
export function HomeCartToast() {
  const { toast } = useCart();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-10 left-half minus-translate-x-half glass-effect px-8 py-4 rounded-full z-[100] flex items-center gap-4 shadow-2xl"
        >
          <div className="bg-accent-gold rounded-full p-1.5 text-white shadow-lg">
            <CheckCircle2 size={16} />
          </div>
          <span className="text-xs font-bold tracking-widest text-text-main uppercase">
            {toast.message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
