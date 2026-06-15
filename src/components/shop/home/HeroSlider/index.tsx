"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlideConfig, TrustItem } from "@/types/heroSlider";
import { validateSlides, getNextSlideIndex } from "./utils";
import { FALLBACK_SLIDE } from "@/data/heroSlider";
import { SlideLayer } from "./SlideLayer";
import { TextOverlay } from "./TextOverlay";
import { SlideIndicators } from "./SlideIndicators";
import { TrustBar } from "./TrustBar";

// ─── Props ───────────────────────────────────────────────────────────────────

interface HeroSliderProps {
  slides?: SlideConfig[];
  autoScrollInterval?: number; // ms, default 4000, min 3000, max 10000
  transitionDuration?: number; // ms, default 800
  trustItems?: TrustItem[];
  className?: string;
  autoScroll?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_AUTO_SCROLL_INTERVAL = 4000;
const MIN_AUTO_SCROLL_INTERVAL = 3000;
const MAX_AUTO_SCROLL_INTERVAL = 10000;
const DEFAULT_TRANSITION_DURATION = 1500;
const DESKTOP_BREAKPOINT = 1024;

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * HeroSlider - Main container component that orchestrates slide state,
 * auto-scroll timer, GSAP animations, and visibility API handling.
 *
 * Renders multi-layer slides with floating animations, text overlays,
 * navigation indicators, and a trust bar.
 */
export function HeroSlider({
  slides,
  autoScrollInterval = DEFAULT_AUTO_SCROLL_INTERVAL,
  transitionDuration = DEFAULT_TRANSITION_DURATION,
  trustItems = [],
  className,
  autoScroll = true,
}: HeroSliderProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [scaleFactor, setScaleFactor] = useState(1);
  const [sliderHeight, setSliderHeight] = useState(900);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 1024);
      if (w < 768) {
        setViewport("mobile");
        const sf = w / 390;
        setScaleFactor(sf);
        setSliderHeight(664 * sf);
      } else if (w < 1024) {
        setViewport("tablet");
        const sf = w / 768;
        setScaleFactor(sf);
        setSliderHeight(954 * sf);
      } else {
        setViewport("desktop");
        const sf = w / 1920;
        setScaleFactor(sf);
        setSliderHeight(900 * sf);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clampedInterval = Math.min(
    Math.max(autoScrollInterval, MIN_AUTO_SCROLL_INTERVAL),
    MAX_AUTO_SCROLL_INTERVAL,
  );

  // ─── Validate Slides ─────────────────────────────────────────────────────

  const validSlides = useMemo(() => {
    const validated = validateSlides(slides ?? []);
    return validated.length > 0 ? validated : [FALLBACK_SLIDE];
  }, [slides]);

  // ─── State ───────────────────────────────────────────────────────────────

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // ─── Refs ────────────────────────────────────────────────────────────────

  const sliderRef = useRef<HTMLElement>(null);
  const slideContainersRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // ─── Entry Animation on Mount ────────────────────────────────────────────

  useEffect(() => {
    setHasMounted(true);
    const firstContainer = slideContainersRef.current.get(0);
    if (firstContainer) {
      gsap.set(firstContainer, { opacity: 1 });
    }
  }, []);

  // ─── Transition Logic ────────────────────────────────────────────────────

  const transitionToSlide = useCallback(
    (targetIndex: number) => {
      // Guard against concurrent transitions
      if (isTransitioning) return;
      // Guard against same slide
      if (targetIndex === currentSlide) return;

      setIsTransitioning(true);

      const currentContainer = slideContainersRef.current.get(currentSlide);
      const nextContainer = slideContainersRef.current.get(targetIndex);

      if (!currentContainer || !nextContainer) {
        // Fallback: just set the slide directly
        setCurrentSlide(targetIndex);
        setIsTransitioning(false);
        return;
      }

      // Kill any existing transition timeline
      if (transitionTimelineRef.current) {
        transitionTimelineRef.current.kill();
      }

      const durationSec = transitionDuration / 1000;

      const tl = gsap.timeline({
        onComplete: () => {
          setCurrentSlide(targetIndex);
          setIsTransitioning(false);
        },
      });

      // Exit current slide container (fade out)
      tl.to(currentContainer, {
        opacity: 0,
        duration: durationSec * 0.5,
        ease: "power2.inOut",
      });

      // Prepare and fade in next container
      gsap.set(nextContainer, { opacity: 0 });
      tl.to(
        nextContainer,
        {
          opacity: 1,
          duration: durationSec * 0.5,
          ease: "power2.inOut",
        },
        `-=${durationSec * 0.25}`,
      );

      transitionTimelineRef.current = tl;
    },
    [currentSlide, isTransitioning, transitionDuration],
  );

  // ─── Auto-Scroll Timer ───────────────────────────────────────────────────

  useEffect(() => {
    if (!autoScroll || isPaused || isTransitioning) return;

    autoScrollTimerRef.current = setTimeout(() => {
      const next = getNextSlideIndex(currentSlide, validSlides.length);
      transitionToSlide(next);
    }, clampedInterval);

    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
    };
  }, [
    autoScroll,
    currentSlide,
    isPaused,
    isTransitioning,
    clampedInterval,
    validSlides.length,
    transitionToSlide,
  ]);

  // ─── Hover Pause (Desktop Only) ─────────────────────────────────────────

  const handleMouseEnter = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.innerWidth >= DESKTOP_BREAKPOINT
    ) {
      setIsPaused(true);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // ─── Indicator Navigation ───────────────────────────────────────────────

  const handleIndicatorSelect = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      if (index === currentSlide) return;

      // Reset timer by triggering transition (timer resets via useEffect deps)
      transitionToSlide(index);
    },
    [isTransitioning, currentSlide, transitionToSlide],
  );

  const handlePrevSlide = useCallback(() => {
    if (isTransitioning) return;
    const prevIndex =
      (currentSlide - 1 + validSlides.length) % validSlides.length;
    transitionToSlide(prevIndex);
  }, [currentSlide, isTransitioning, transitionToSlide, validSlides.length]);

  const handleNextSlide = useCallback(() => {
    if (isTransitioning) return;
    const nextIndex = getNextSlideIndex(currentSlide, validSlides.length);
    transitionToSlide(nextIndex);
  }, [currentSlide, isTransitioning, transitionToSlide, validSlides.length]);

  // ─── Swipe Detection (Mobile Only) ───────────────────────────────────────

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNextSlide();
    } else if (distance < -minSwipeDistance) {
      handlePrevSlide();
    }
  }, [handleNextSlide, handlePrevSlide]);

  // ─── Page Visibility API ─────────────────────────────────────────────────

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        gsap.globalTimeline.pause();
        setIsPaused(true);
      } else {
        gsap.globalTimeline.resume();
        setIsPaused(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // ─── Cleanup on Unmount ──────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
      if (transitionTimelineRef.current) {
        transitionTimelineRef.current.kill();
      }
    };
  }, []);

  // ─── Ref Callback for Slide Containers ──────────────────────────────────

  const setSlideContainerRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) {
        slideContainersRef.current.set(index, el);
      } else {
        slideContainersRef.current.delete(index);
      }
    },
    [],
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  const activeSlide = validSlides[currentSlide] ?? validSlides[0];

  const canonicalSize =
    viewport === "mobile"
      ? { width: 390, height: 664 }
      : viewport === "tablet"
        ? { width: 768, height: 954 }
        : { width: 1920, height: 900 };

  return (
    <section
      ref={sliderRef}
      id="hero"
      className={cn(
        "group/slider relative overflow-hidden w-full",
        !hasMounted && "h-[100dvh] lg:h-screen",
        className,
      )}
      style={hasMounted ? { height: `${sliderHeight}px` } : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* All slides rendered, only active one visible */}
      {validSlides.map((slide, index) => {
        const isActive = index === currentSlide;
        const shouldRender = index === 0 || hasMounted;

        if (!shouldRender) return null;

        return (
          <div
            key={slide.id}
            ref={setSlideContainerRef(index)}
            className="hero-slide absolute inset-0 w-full h-full"
            data-slide-id={slide.id}
            style={{
              opacity: isActive ? 1 : 0,
              pointerEvents: isActive ? "auto" : "none",
            }}
            aria-hidden={!isActive}
          >
            <div
              className="absolute overflow-hidden"
              style={
                hasMounted
                  ? ({
                      width: `${canonicalSize.width}px`,
                      height: `${canonicalSize.height}px`,
                      transform: `scale(${scaleFactor})`,
                      transformOrigin: "top left",
                      left: "0",
                      top: "0",
                      "--slide-w": `${canonicalSize.width}px`,
                      "--slide-h": `${canonicalSize.height}px`,
                    } as React.CSSProperties)
                  : ({ width: "100%", height: "100%" } as React.CSSProperties)
              }
            >
              {(slide.layers[viewport] ?? []).map((layer, layerIndex) => {
                return (
                  <SlideLayer
                    key={`${slide.id}-layer-${layerIndex}-${isActive ? "active" : "inactive"}`}
                    layer={layer}
                    isActive={isActive}
                    viewport={viewport}
                    priority={index === 0}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Text overlay for active slide — skip if slide has positioned text/button layers */}
      {(() => {
        const layersForViewport = activeSlide.layers[viewport] ?? [];
        const hasPositionedText = layersForViewport.some(
          (l) => l.type === "text" || l.type === "button",
        );
        if (hasPositionedText) return null;
        return (
          <TextOverlay
            content={activeSlide.text}
            isActive={!isTransitioning}
            transitionDuration={transitionDuration}
          />
        );
      })()}

      {/* Side navigation (desktop only, revealed on hover) */}
      {validSlides.length > 1 && (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-30 hidden items-center justify-between px-2 md:px-4 lg:flex">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={handlePrevSlide}
            disabled={isTransitioning}
            className="pointer-events-auto w-11 h-11 bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center text-black opacity-100 lg:opacity-0 lg:group-hover/slider:opacity-100 lg:group-hover/slider:translate-x-2 transition-all duration-300 hover:bg-gray-100 hover:scale-110 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            aria-label="Next slide"
            onClick={handleNextSlide}
            disabled={isTransitioning}
            className="pointer-events-auto w-11 h-11 bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center text-black opacity-100 lg:opacity-0 lg:group-hover/slider:opacity-100 lg:group-hover/slider:-translate-x-2 transition-all duration-300 hover:bg-gray-100 hover:scale-110 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Slide indicators */}
      {validSlides.length > 1 && (
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 z-10">
          <SlideIndicators
            total={validSlides.length}
            current={currentSlide}
            onSelect={handleIndicatorSelect}
            disabled={isTransitioning}
          />
        </div>
      )}

      {/* Trust bar */}
      <TrustBar items={trustItems} className="bottom-12 md:bottom-16" />
    </section>
  );
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export default HeroSlider;
export { SlideLayer } from "./SlideLayer";
export { TextOverlay } from "./TextOverlay";
export { SlideIndicators } from "./SlideIndicators";
export { TrustBar } from "./TrustBar";
