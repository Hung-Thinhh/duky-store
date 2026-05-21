import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "minimal";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "minimal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variant === "glass" ? "glass-card" : "bg-white shadow-sm",
          "rounded-[3rem] p-4 transition-all duration-500",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
