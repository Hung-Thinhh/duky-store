"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronUp, ChevronDown, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  category: string;
  sizes: number[];
  colors: string[];
  priceMin: number;
  priceMax: number;
}

interface FilterProps {
  initialState?: Partial<FilterState>;
  onChange: (state: FilterState) => void;
  className?: string;
  parentSlug?: string;
}

interface ColorOption {
  id: string;
  label: string;
  hex: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const ALL_CATEGORY_OPTION: CategoryOption = { value: "all", label: "Tất cả" };
const PARENT_SHOE_CATEGORY_SLUGS = new Set(["boot-nam", "boot-nu"]);

let cachedCategoriesPromise: Promise<BackendCategory[]> | null = null;

async function fetchCategoriesCached(): Promise<BackendCategory[]> {
  if (cachedCategoriesPromise) {
    return cachedCategoriesPromise;
  }

  cachedCategoriesPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) {
        throw new Error(`Failed to load categories: ${response.status}`);
      }
      const json = await response.json();
      return json?.DT?.data || [];
    } catch (error) {
      cachedCategoriesPromise = null;
      return [];
    }
  })();

  return cachedCategoriesPromise;
}

const SIZES = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43] as const;

const COLORS: ColorOption[] = [
  { id: "black", label: "Đen", hex: "#1a1a1a" },
  { id: "dark-brown", label: "Nâu đậm", hex: "#3d2314" },
  { id: "brown", label: "Nâu", hex: "#6b3a2a" },
  { id: "tan", label: "Nâu nhạt", hex: "#c8a47a" },
  { id: "gray", label: "Xám", hex: "#808080" },
  { id: "white", label: "Trắng", hex: "#f5f5f5" },
];

const EXTRA_COLORS: ColorOption[] = [
  { id: "navy", label: "Xanh navy", hex: "#1b2a4a" },
  { id: "burgundy", label: "Đỏ đô", hex: "#722f37" },
  { id: "olive", label: "Xanh rêu", hex: "#556b2f" },
];

const PRICE_CONFIG = {
  min: 0,
  max: 5_000_000,
  step: 10_000,
  defaultMin: 0,
  defaultMax: 5_000_000,
} as const;

const DEFAULT_FILTER_STATE: FilterState = {
  category: ALL_CATEGORY_OPTION.value,
  sizes: [],
  colors: [],
  priceMin: 0,
  priceMax: 5_000_000,
};

interface CategoryFilterProps {
  selected: string;
  categories: CategoryOption[];
  onSelect: (category: string) => void;
}

function CategoryFilter({ selected, categories, onSelect }: CategoryFilterProps) {
  return (
    <fieldset className="border-none p-0 m-0">
      <legend className="sr-only">Danh mục sản phẩm</legend>
      <div className="space-y-2">
        {categories.map((category) => {
          const isSelected = selected === category.value;
          return (
            <label
              key={category.value}
              className="flex items-center gap-2 cursor-pointer min-h-[36px] md:min-h-0"
            >
              <input
                type="radio"
                name="category"
                value={category.value}
                checked={isSelected}
                onChange={() => onSelect(category.value)}
                className="sr-only peer"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "w-4 h-4 rounded-full border-2 flex-shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-black/20 peer-focus-visible:ring-offset-2",
                  isSelected ? "bg-black border-black" : "border-gray-300"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  isSelected ? "text-black font-medium" : "text-gray-600"
                )}
              >
                {category.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

interface FilterHeaderProps {
  onClearAll: () => void;
  disabled?: boolean;
}

function FilterHeader({ onClearAll, disabled }: FilterHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="content text-base font-bold">BỘ LỌC</h2>
      <button
        type="button"
        onClick={onClearAll}
        disabled={disabled}
        className={cn(
          "text-sm text-gray-700 hover:text-black min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 rounded cursor-pointer",
          disabled && "opacity-40 cursor-not-allowed hover:text-gray-500"
        )}
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children?: React.ReactNode;
}

function FilterSection({ title, defaultExpanded = true, children }: FilterSectionProps) {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between py-1.5 min-h-[36px] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 cursor-pointer"
      >
        <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SizeFilterProps {
  selected: number[];
  onToggle: (size: number) => void;
}

function SizeFilter({ selected, onToggle }: SizeFilterProps) {
  return (
    <fieldset className="border-none p-0 m-0">
      <legend className="sr-only">Chọn size giày</legend>
      <div className="grid grid-cols-5 gap-2">
        {SIZES.map((size) => {
          const isSelected = selected.includes(size);
          return (
            <button
              key={size}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(size)}
              className={cn(
                "rounded-lg text-xs py-1.5 min-h-[36px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 cursor-pointer",
                isSelected
                  ? "border-2 border-black text-black font-medium bg-white"
                  : "border border-gray-200 text-gray-600 bg-white"
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

interface ColorFilterProps {
  selected: string[];
  onToggle: (colorId: string) => void;
}

function ColorFilter({ selected, onToggle }: ColorFilterProps) {
  const [showExtra, setShowExtra] = useState<boolean>(false);

  return (
    <fieldset className="border-none pt-2 m-0">
      <legend className="sr-only">Chọn màu sắc</legend>
      <div className="flex flex-wrap gap-3">
        {COLORS.map((color) => {
          const isSelected = selected.includes(color.id);
          return (
            <button
              key={color.id}
              type="button"
              aria-label={color.label}
              aria-pressed={isSelected}
              onClick={() => onToggle(color.id)}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 cursor-pointer",
                isSelected && "ring-2 ring-black ring-offset-2",
                color.id === "white" && "border border-gray-200"
              )}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && <Check size={12} className="text-white" />}
            </button>
          );
        })}
        {showExtra &&
          EXTRA_COLORS.map((color) => {
            const isSelected = selected.includes(color.id);
            return (
              <button
                key={color.id}
                type="button"
                aria-label={color.label}
                aria-pressed={isSelected}
                onClick={() => onToggle(color.id)}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 cursor-pointer",
                  isSelected && "ring-2 ring-black ring-offset-2",
                  color.id === "white" && "border border-gray-200"
                )}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && <Check size={12} className="text-white" />}
              </button>
            );
          })}
        <button
          type="button"
          aria-label={showExtra ? "Ẩn bớt màu" : "Xem thêm màu"}
          onClick={() => setShowExtra((prev) => !prev)}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 cursor-pointer"
        >
          <Plus size={14} className={cn("text-gray-600 transition-transform", showExtra && "rotate-45")} />
        </button>
      </div>
    </fieldset>
  );
}

interface PriceFilterProps {
  min: number;
  max: number;
  onRangeChange: (min: number, max: number) => void;
}

function formatPrice(value: number): string {
  return value.toLocaleString("vi-VN") + "đ";
}

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[^\d]/g, "");
  if (cleaned === "") return null;
  const value = parseInt(cleaned, 10);
  return isNaN(value) ? null : value;
}

function PriceFilter({ min, max, onRangeChange }: PriceFilterProps) {
  const [minText, setMinText] = useState<string>(formatPrice(min));
  const [maxText, setMaxText] = useState<string>(formatPrice(max));

  React.useEffect(() => {
    setMinText(formatPrice(min));
  }, [min]);

  React.useEffect(() => {
    setMaxText(formatPrice(max));
  }, [max]);

  const leftPercent =
    ((min - PRICE_CONFIG.min) / (PRICE_CONFIG.max - PRICE_CONFIG.min)) * 100;
  const widthPercent =
    ((max - min) / (PRICE_CONFIG.max - PRICE_CONFIG.min)) * 100;

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), max);
    onRangeChange(value, max);
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), min);
    onRangeChange(min, value);
  };

  const validateAndApplyMin = () => {
    const parsed = parsePrice(minText);
    if (parsed === null) {
      setMinText(formatPrice(min));
      return;
    }

    let clamped = Math.max(PRICE_CONFIG.min, Math.min(PRICE_CONFIG.max, parsed));
    clamped = Math.min(clamped, max);
    setMinText(formatPrice(clamped));
    onRangeChange(clamped, max);
  };

  const validateAndApplyMax = () => {
    const parsed = parsePrice(maxText);
    if (parsed === null) {
      setMaxText(formatPrice(max));
      return;
    }

    let clamped = Math.max(PRICE_CONFIG.min, Math.min(PRICE_CONFIG.max, parsed));
    clamped = Math.max(clamped, min);
    setMaxText(formatPrice(clamped));
    onRangeChange(min, clamped);
  };

  const handleMinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      validateAndApplyMin();
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleMaxKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      validateAndApplyMax();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div>
      <div className="relative w-full h-6 my-4">
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 bg-black rounded-full"
          style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
        />
        <input
          type="range"
          min={PRICE_CONFIG.min}
          max={PRICE_CONFIG.max}
          step={PRICE_CONFIG.step}
          value={min}
          onChange={handleMinSliderChange}
          className={cn(
            "absolute top-0 w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer",
            min > PRICE_CONFIG.max - PRICE_CONFIG.step * 5 && "z-[5]"
          )}
          aria-label="Giá tối thiểu"
        />
        <input
          type="range"
          min={PRICE_CONFIG.min}
          max={PRICE_CONFIG.max}
          step={PRICE_CONFIG.step}
          value={max}
          onChange={handleMaxSliderChange}
          className="absolute top-0 w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer"
          aria-label="Giá tối đa"
        />
      </div>

      <div className="flex items-center gap-4 mt-4">
        <input
          type="text"
          value={minText}
          onChange={(e) => setMinText(e.target.value)}
          onBlur={validateAndApplyMin}
          onKeyDown={handleMinKeyDown}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus-visible:outline-none"
          aria-label="Giá tối thiểu"
        />
        <input
          type="text"
          value={maxText}
          onChange={(e) => setMaxText(e.target.value)}
          onBlur={validateAndApplyMax}
          onKeyDown={handleMaxKeyDown}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus-visible:outline-none"
          aria-label="Giá tối đa"
        />
      </div>
    </div>
  );
}

export default function Filter({ initialState, onChange, className, parentSlug }: FilterProps) {
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([
    ALL_CATEGORY_OPTION,
  ]);

  const [filterState, setFilterState] = useState<FilterState>(() => ({
    ...DEFAULT_FILTER_STATE,
    ...initialState,
    category:
      initialState?.category === "Tất cả"
        ? ALL_CATEGORY_OPTION.value
        : (initialState?.category ?? DEFAULT_FILTER_STATE.category),
  }));

  useEffect(() => {
    let cancelled = false;

    async function loadCategoryOptions() {
      try {
        const categories = await fetchCategoriesCached();

        const targetParentSlugs = parentSlug
          ? new Set([parentSlug])
          : PARENT_SHOE_CATEGORY_SLUGS;

        const parentCategoryIds = new Set(
          categories
            .filter((category) => targetParentSlugs.has(category.slug))
            .map((category) => category.id)
        );

        const childCategories = categories.filter(
          (category) =>
            category.parentId !== null && parentCategoryIds.has(category.parentId)
        );

        const sourceCategories =
          childCategories.length > 0
            ? childCategories
            : categories.filter((category) =>
                targetParentSlugs.has(category.slug)
              );

        const uniqueBySlug = new Map<string, CategoryOption>();
        for (const category of sourceCategories) {
          if (!category.slug) continue;
          uniqueBySlug.set(category.slug, {
            value: category.slug,
            label: category.name,
          });
        }

        const options: CategoryOption[] = [
          ALL_CATEGORY_OPTION,
          ...Array.from(uniqueBySlug.values()),
        ];

        if (!cancelled) {
          setCategoryOptions(options);
        }
      } catch {
        if (!cancelled) {
          setCategoryOptions([ALL_CATEGORY_OPTION]);
        }
      }
    }

    loadCategoryOptions();

    return () => {
      cancelled = true;
    };
  }, [parentSlug]);

  const isDefaultState =
    filterState.category === DEFAULT_FILTER_STATE.category &&
    filterState.sizes.length === 0 &&
    filterState.colors.length === 0 &&
    filterState.priceMin === DEFAULT_FILTER_STATE.priceMin &&
    filterState.priceMax === DEFAULT_FILTER_STATE.priceMax;

  const handleClearAll = () => {
    setFilterState(DEFAULT_FILTER_STATE);
    onChange(DEFAULT_FILTER_STATE);
  };

  const handleCategorySelect = (category: string) => {
    const newState = { ...filterState, category };
    setFilterState(newState);
    onChange(newState);
  };

  const handleSizeToggle = (size: number) => {
    const sizes = filterState.sizes.includes(size)
      ? filterState.sizes.filter((s) => s !== size)
      : [...filterState.sizes, size];
    const newState = { ...filterState, sizes };
    setFilterState(newState);
    onChange(newState);
  };

  const handleColorToggle = (colorId: string) => {
    const colors = filterState.colors.includes(colorId)
      ? filterState.colors.filter((c) => c !== colorId)
      : [...filterState.colors, colorId];
    const newState = { ...filterState, colors };
    setFilterState(newState);
    onChange(newState);
  };

  const handlePriceChange = (priceMin: number, priceMax: number) => {
    const newState = { ...filterState, priceMin, priceMax };
    setFilterState(newState);
    onChange(newState);
  };

  return (
    <div className={cn("w-full lg:w-60 lg:max-w-[240px] p-4 space-y-4", className)}>
      <FilterHeader onClearAll={handleClearAll} disabled={isDefaultState} />

      <FilterSection title="Danh mục" defaultExpanded={false}>
        <CategoryFilter
          selected={filterState.category}
          categories={categoryOptions}
          onSelect={handleCategorySelect}
        />
      </FilterSection>

      <FilterSection title="Size" defaultExpanded={false}>
        <SizeFilter selected={filterState.sizes} onToggle={handleSizeToggle} />
      </FilterSection>

      <FilterSection title="Màu sắc" defaultExpanded={false}>
        <ColorFilter
          selected={filterState.colors}
          onToggle={handleColorToggle}
        />
      </FilterSection>

      <FilterSection title="Giá" defaultExpanded={false}>
        <PriceFilter
          min={filterState.priceMin}
          max={filterState.priceMax}
          onRangeChange={handlePriceChange}
        />
      </FilterSection>
    </div>
  );
}
