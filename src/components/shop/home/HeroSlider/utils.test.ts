import { describe, it, expect } from "vitest";
import {
  validateSlides,
  generateFloatConfigs,
  getNextSlideIndex,
  sortLayersByFilename,
} from "./utils";
import type { SlideConfig, LayerConfig } from "@/types/heroSlider";

// ─── Helper Factories ────────────────────────────────────────────────────────

function makeValidSlide(overrides: Partial<SlideConfig> = {}): SlideConfig {
  return {
    id: "test-slide",
    layers: [{ src: "/assets/slider_1/background.png", alt: "bg", zIndex: 0 }],
    text: {
      badge: "TEST",
      title: "Test Title",
      tagline: "Test tagline",
      buttons: [{ label: "Click", link: "/test", variant: "primary" }],
    },
    ...overrides,
  };
}

// ─── validateSlides ──────────────────────────────────────────────────────────

describe("validateSlides", () => {
  it("returns valid slides unchanged", () => {
    const slides = [makeValidSlide({ id: "s1" }), makeValidSlide({ id: "s2" })];
    const result = validateSlides(slides);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("s1");
    expect(result[1].id).toBe("s2");
  });

  it("filters out slides with empty title", () => {
    const slides = [
      makeValidSlide({ id: "valid" }),
      makeValidSlide({
        id: "invalid",
        text: { badge: "", title: "", tagline: "", buttons: [] },
      }),
    ];
    const result = validateSlides(slides);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("valid");
  });

  it("filters out slides with no layers", () => {
    const slides = [
      makeValidSlide({ id: "valid" }),
      makeValidSlide({ id: "no-layers", layers: [] }),
    ];
    const result = validateSlides(slides);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("valid");
  });

  it("filters out slides where all layers have empty src", () => {
    const slides = [
      makeValidSlide({
        id: "empty-src",
        layers: [{ src: "", alt: "empty", zIndex: 0 }],
      }),
    ];
    const result = validateSlides(slides);
    expect(result).toHaveLength(0);
  });

  it("returns empty array for non-array input", () => {
    expect(validateSlides(null as any)).toEqual([]);
    expect(validateSlides(undefined as any)).toEqual([]);
  });

  it("returns empty array when all slides are invalid", () => {
    const slides = [makeValidSlide({ id: "bad", layers: [] })];
    expect(validateSlides(slides)).toEqual([]);
  });

  it("caps at 10 slides maximum", () => {
    const slides = Array.from({ length: 12 }, (_, i) =>
      makeValidSlide({ id: `s${i}` }),
    );
    const result = validateSlides(slides);
    expect(result).toHaveLength(10);
  });

  it("preserves original order of valid slides", () => {
    const slides = [
      makeValidSlide({ id: "a" }),
      makeValidSlide({ id: "b", layers: [] }), // invalid
      makeValidSlide({ id: "c" }),
    ];
    const result = validateSlides(slides);
    expect(result.map((s) => s.id)).toEqual(["a", "c"]);
  });
});

// ─── generateFloatConfigs ────────────────────────────────────────────────────

describe("generateFloatConfigs", () => {
  it("returns empty array for 0 layers", () => {
    expect(generateFloatConfigs(0)).toEqual([]);
  });

  it("returns empty array for negative layer count", () => {
    expect(generateFloatConfigs(-1)).toEqual([]);
  });

  it("generates correct number of configs", () => {
    expect(generateFloatConfigs(3)).toHaveLength(3);
    expect(generateFloatConfigs(8)).toHaveLength(8);
  });

  it("all durations are within 3-6 range", () => {
    const configs = generateFloatConfigs(8);
    for (const config of configs) {
      expect(config.duration).toBeGreaterThanOrEqual(3);
      expect(config.duration).toBeLessThanOrEqual(6);
    }
  });

  it("all delays are within 0-2 range", () => {
    const configs = generateFloatConfigs(8);
    for (const config of configs) {
      expect(config.delay).toBeGreaterThanOrEqual(0);
      expect(config.delay).toBeLessThanOrEqual(2);
    }
  });

  it("all displacements are within 5-15 range", () => {
    const configs = generateFloatConfigs(8);
    for (const config of configs) {
      expect(config.displacement).toBeGreaterThanOrEqual(5);
      expect(config.displacement).toBeLessThanOrEqual(15);
    }
  });

  it("no two configs share the same (duration, delay) pair", () => {
    const configs = generateFloatConfigs(8);
    const pairs = configs.map((c) => `${c.duration}-${c.delay}`);
    const uniquePairs = new Set(pairs);
    expect(uniquePairs.size).toBe(configs.length);
  });

  it("all configs have ease set to sine.inOut", () => {
    const configs = generateFloatConfigs(5);
    for (const config of configs) {
      expect(config.ease).toBe("sine.inOut");
    }
  });
});

// ─── getNextSlideIndex ───────────────────────────────────────────────────────

describe("getNextSlideIndex", () => {
  it("returns next index for normal case", () => {
    expect(getNextSlideIndex(0, 3)).toBe(1);
    expect(getNextSlideIndex(1, 3)).toBe(2);
  });

  it("wraps around from last to first", () => {
    expect(getNextSlideIndex(2, 3)).toBe(0);
    expect(getNextSlideIndex(9, 10)).toBe(0);
  });

  it("returns 0 for single slide", () => {
    expect(getNextSlideIndex(0, 1)).toBe(0);
  });

  it("returns 0 for total <= 0", () => {
    expect(getNextSlideIndex(0, 0)).toBe(0);
    expect(getNextSlideIndex(5, -1)).toBe(0);
  });
});

// ─── sortLayersByFilename ────────────────────────────────────────────────────

describe("sortLayersByFilename", () => {
  it("sorts layers alphabetically by filename", () => {
    const layers: LayerConfig[] = [
      { src: "/assets/slider_1/model.png", alt: "model", zIndex: 5 },
      { src: "/assets/slider_1/background.png", alt: "bg", zIndex: 3 },
      { src: "/assets/slider_1/boot.png", alt: "boot", zIndex: 1 },
    ];
    const result = sortLayersByFilename(layers);
    expect(result[0].src).toBe("/assets/slider_1/background.png");
    expect(result[1].src).toBe("/assets/slider_1/boot.png");
    expect(result[2].src).toBe("/assets/slider_1/model.png");
  });

  it("assigns z-index starting at 0", () => {
    const layers: LayerConfig[] = [
      { src: "/assets/slider_1/model.png", alt: "model", zIndex: 99 },
      { src: "/assets/slider_1/background.png", alt: "bg", zIndex: 50 },
    ];
    const result = sortLayersByFilename(layers);
    expect(result[0].zIndex).toBe(0);
    expect(result[1].zIndex).toBe(1);
  });

  it("returns empty array for empty input", () => {
    expect(sortLayersByFilename([])).toEqual([]);
  });

  it("returns empty array for non-array input", () => {
    expect(sortLayersByFilename(null as any)).toEqual([]);
  });

  it("is case-insensitive when sorting", () => {
    const layers: LayerConfig[] = [
      { src: "/assets/Zebra.png", alt: "z", zIndex: 0 },
      { src: "/assets/apple.png", alt: "a", zIndex: 0 },
    ];
    const result = sortLayersByFilename(layers);
    expect(result[0].src).toBe("/assets/apple.png");
    expect(result[1].src).toBe("/assets/Zebra.png");
  });

  it("does not mutate the original array", () => {
    const layers: LayerConfig[] = [
      { src: "/assets/b.png", alt: "b", zIndex: 1 },
      { src: "/assets/a.png", alt: "a", zIndex: 0 },
    ];
    const original = [...layers];
    sortLayersByFilename(layers);
    expect(layers).toEqual(original);
  });
});
