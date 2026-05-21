import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "neumorphic" | "neumorphic-dark" | "outline" | "premium-black" | "premium-glass";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "neumorphic", ...props }, ref) => {
    const variants = {
      neumorphic: "neumorphic-button text-premium-slate",
      "neumorphic-dark": "neumorphic-button-dark",
      outline: "rounded-full border border-slate-200 text-premium-slate hover:bg-slate-50 transition-all",
      "premium-black": "bg-black text-white rounded-full hover:-translate-y-1 hover:shadow-premium-black transition-all duration-300",
      "premium-glass": "glass-effect border-black/10 text-text-main rounded-full hover:-translate-y-1 hover:shadow-premium-glass transition-all duration-300",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "px-8 py-4 font-semibold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
