"use client";

interface SlideIndicatorsProps {
  total: number;
  current: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

/**
 * Navigation dots showing current slide position and allowing manual slide selection.
 * Active dot is visually distinct (wider + darker color).
 * Each dot has a 44×44px minimum tap target for mobile accessibility.
 */
export function SlideIndicators({
  total,
  current,
  onSelect,
  disabled = false,
}: SlideIndicatorsProps) {
  const handleClick = (index: number) => {
    if (disabled || index === current) return;
    onSelect(index);
  };

  return (
    <div className="flex items-center justify-center gap-1" role="tablist">
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === current;

        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Slide ${index + 1} of ${total}`}
            onClick={() => handleClick(index)}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
          >
            <span
              className={[
                "block rounded-full transition-all duration-300",
                isActive
                  ? "w-8 h-2 bg-black"
                  : "w-2 h-2 bg-black/30",
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}
