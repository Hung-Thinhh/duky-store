import { cn } from "@/lib/utils";
import type { TrustItem } from "@/types/heroSlider";

interface TrustBarProps {
  items: TrustItem[];
  className?: string;
}

/**
 * Fixed bottom trust bar displaying service features (shipping, warranty, etc.)
 * that persists across slide transitions without any animation changes.
 *
 * Reuses the glass-effect pill styling from the original HeroBanner trust bar.
 */
export function TrustBar({ items, className }: TrustBarProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "absolute bottom-8 left-0 right-0 z-20 px-6 flex justify-center hero-trust-bar",
        className
      )}
    >
      <div className="max-w-fit">
        <div
          className="glass-effect p-2 md:p-4 rounded-full shadow-2xl border-white/40"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.58), rgba(255,255,255,0.28))",
            backdropFilter: "blur(22px) saturate(120%)",
            WebkitBackdropFilter: "blur(22px) saturate(120%)",
          }}
        >
          <div className="flex flex-row items-center justify-center divide-x divide-black/5 overflow-x-auto no-scrollbar py-2 md:py-4">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-4 px-6 md:px-10 first:pl-8 last:pr-8"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/50 flex items-center justify-center text-text-main shrink-0 shadow-sm">
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <p
                    className="text-xs md:text-sm font-semibold leading-tight whitespace-nowrap"
                    style={{
                      color: "var(--text-main)",
                      textShadow: "0 1px 2px rgba(255, 255, 255, 0.35)",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-xs md:text-xs mt-0.5 whitespace-nowrap"
                    style={{
                      color: "rgba(13, 13, 13, 0.72)",
                      textShadow: "0 1px 2px rgba(255, 255, 255, 0.28)",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
