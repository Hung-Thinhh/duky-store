import type {
  SlideConfig,
  LayerConfig,
  FloatAnimationConfig,
} from "@/types/heroSlider";

// ─── Constants ───────────────────────────────────────────────────────────────

const MIN_SLIDES = 1;
const MAX_SLIDES = 10;
const FLOAT_DURATION_MIN = 3;
const FLOAT_DURATION_MAX = 6;
const FLOAT_DELAY_MIN = 0;
const FLOAT_DELAY_MAX = 2;
const FLOAT_DISPLACEMENT_MIN = 5;
const FLOAT_DISPLACEMENT_MAX = 15;

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Checks whether a single slide entry is valid.
 * A valid slide must have at least 1 layer with a non-empty src, and a non-empty title.
 */
function isValidSlide(slide: SlideConfig): boolean {
  if (!slide) return false;
  if (!slide.text?.title || slide.text.title.trim().length === 0) return false;
  if (!Array.isArray(slide.layers) || slide.layers.length === 0) return false;

  const hasValidLayer = slide.layers.some(
    (layer) => layer.src && layer.src.trim().length > 0
  );
  return hasValidLayer;
}

/**
 * Filters an array of slide configurations, returning only valid entries.
 * The slides array must have 1-10 entries after filtering.
 * Returns an empty array if no valid slides remain (caller should use fallback).
 */
export function validateSlides(slides: SlideConfig[]): SlideConfig[] {
  if (!Array.isArray(slides)) return [];

  const valid = slides.filter(isValidSlide);

  if (valid.length < MIN_SLIDES) return [];
  if (valid.length > MAX_SLIDES) return valid.slice(0, MAX_SLIDES);

  return valid;
}

// ─── Float Config Generation ─────────────────────────────────────────────────

/**
 * Generates float animation configurations for a given number of layers.
 * Ensures unique (duration, delay) pairs across all layers.
 * Duration: 3-6s, Delay: 0-2s, Displacement: 5-15px.
 */
export function generateFloatConfigs(
  layerCount: number
): FloatAnimationConfig[] {
  if (layerCount <= 0) return [];

  const configs: FloatAnimationConfig[] = [];
  const usedPairs = new Set<string>();

  for (let i = 0; i < layerCount; i++) {
    let duration: number;
    let delay: number;
    let pairKey: string;

    // Distribute duration and delay evenly across the valid range
    // to guarantee uniqueness for reasonable layer counts
    const durationStep =
      (FLOAT_DURATION_MAX - FLOAT_DURATION_MIN) / Math.max(layerCount, 1);
    const delayStep =
      (FLOAT_DELAY_MAX - FLOAT_DELAY_MIN) / Math.max(layerCount, 1);

    duration = parseFloat(
      (FLOAT_DURATION_MIN + durationStep * i + durationStep / 2).toFixed(2)
    );
    delay = parseFloat(
      (FLOAT_DELAY_MIN + delayStep * i + delayStep / 2).toFixed(2)
    );

    // Clamp to valid ranges
    duration = Math.min(Math.max(duration, FLOAT_DURATION_MIN), FLOAT_DURATION_MAX);
    delay = Math.min(Math.max(delay, FLOAT_DELAY_MIN), FLOAT_DELAY_MAX);

    pairKey = `${duration}-${delay}`;

    // If collision occurs (unlikely with even distribution), nudge duration
    if (usedPairs.has(pairKey)) {
      duration = parseFloat((duration + 0.01).toFixed(2));
      duration = Math.min(duration, FLOAT_DURATION_MAX);
      pairKey = `${duration}-${delay}`;
    }

    usedPairs.add(pairKey);

    // Distribute displacement evenly
    const displacementStep =
      (FLOAT_DISPLACEMENT_MAX - FLOAT_DISPLACEMENT_MIN) /
      Math.max(layerCount, 1);
    const displacement = parseFloat(
      (
        FLOAT_DISPLACEMENT_MIN +
        displacementStep * i +
        displacementStep / 2
      ).toFixed(1)
    );

    configs.push({
      duration,
      delay,
      displacement: Math.min(
        Math.max(displacement, FLOAT_DISPLACEMENT_MIN),
        FLOAT_DISPLACEMENT_MAX
      ),
      ease: "sine.inOut",
    });
  }

  return configs;
}

// ─── Slide Index Cycling ─────────────────────────────────────────────────────

/**
 * Returns the next slide index, wrapping around to 0 after the last slide.
 */
export function getNextSlideIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

// ─── Layer Sorting ───────────────────────────────────────────────────────────

/**
 * Extracts the filename from a path (last segment after the final slash).
 */
function extractFilename(src: string): string {
  const parts = src.split("/");
  return parts[parts.length - 1] || "";
}

/**
 * Sorts layers by their filename (extracted from src path) alphabetically ascending,
 * then assigns z-index starting at 0.
 */
export function sortLayersByFilename(layers: LayerConfig[]): LayerConfig[] {
  if (!Array.isArray(layers) || layers.length === 0) return [];

  const sorted = [...layers].sort((a, b) => {
    const filenameA = extractFilename(a.src).toLowerCase();
    const filenameB = extractFilename(b.src).toLowerCase();
    return filenameA.localeCompare(filenameB);
  });

  return sorted.map((layer, index) => ({
    ...layer,
    zIndex: index,
  }));
}
