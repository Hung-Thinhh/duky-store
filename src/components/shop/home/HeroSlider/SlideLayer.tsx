"use client";

import { useRef, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import type { FloatAnimationConfig, LayerLayout } from "@/types/heroSlider";

export interface SlideLayerProps {
  src: string;
  srcMobile?: string;
  alt: string;
  zIndex: number;
  floatConfig: FloatAnimationConfig;
  isActive: boolean;
  onError?: () => void;
  className?: string;
  layout?: LayerLayout;
  priority?: boolean;
  sizes?: string;
}

/**
 * Renders a single image layer within a slide with absolute positioning
 * and GSAP floating animation. Hides itself on image load failure.
 */
export function SlideLayer({
  src,
  srcMobile,
  alt,
  zIndex,
  floatConfig,
  isActive,
  onError,
  className,
  layout,
  priority,
  sizes,
}: SlideLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!layerRef.current) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    if (isActive) {
      if (isMobile) {
        gsap.set(layerRef.current, { y: 0 });
        return;
      }

      const displacement = floatConfig.displacement;

      // Create floating tween
      tweenRef.current = gsap.to(layerRef.current, {
        y: `+=${displacement}`,
        duration: floatConfig.duration,
        delay: floatConfig.delay,
        ease: floatConfig.ease,
        yoyo: true,
        repeat: -1,
      });
    } else {
      // Kill tween when inactive
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
      // Reset position
      if (layerRef.current) {
        gsap.set(layerRef.current, { y: 0 });
      }
    }

    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
    };
  }, [isActive, floatConfig]);

  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return null;
  }

  const styleVars = {
    zIndex,
    "--layer-display": layout?.desktop?.display ?? "block",
    "--layer-top": layout?.desktop?.top ?? "0",
    "--layer-right": layout?.desktop?.right ?? "0",
    "--layer-bottom": layout?.desktop?.bottom ?? "0",
    "--layer-left": layout?.desktop?.left ?? "0",
    "--layer-width": layout?.desktop?.width ?? "100%",
    "--layer-height": layout?.desktop?.height ?? "100%",
    "--layer-object-fit": layout?.desktop?.objectFit ?? "cover",
    "--layer-object-position": layout?.desktop?.objectPosition ?? "center",
    "--layer-display-md": layout?.tablet?.display,
    "--layer-top-md": layout?.tablet?.top,
    "--layer-right-md": layout?.tablet?.right,
    "--layer-bottom-md": layout?.tablet?.bottom,
    "--layer-left-md": layout?.tablet?.left,
    "--layer-width-md": layout?.tablet?.width,
    "--layer-height-md": layout?.tablet?.height,
    "--layer-object-fit-md": layout?.tablet?.objectFit,
    "--layer-object-position-md": layout?.tablet?.objectPosition,
    "--layer-display-sm": layout?.mobile?.display,
    "--layer-top-sm": layout?.mobile?.top,
    "--layer-right-sm": layout?.mobile?.right,
    "--layer-bottom-sm": layout?.mobile?.bottom,
    "--layer-left-sm": layout?.mobile?.left,
    "--layer-width-sm": layout?.mobile?.width,
    "--layer-height-sm": layout?.mobile?.height,
    "--layer-object-fit-sm": layout?.mobile?.objectFit,
    "--layer-object-position-sm": layout?.mobile?.objectPosition,
  } as CSSProperties;

  if (srcMobile) {
    const isDesktopHidden = layout?.desktop?.display === "none";
    const isMobileHidden = layout?.mobile?.display === "none";

    const desktopSrc = isDesktopHidden
      ? "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      : src;
    const mobileSrc = isMobileHidden
      ? "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      : srcMobile;

    return (
      <div
        ref={layerRef}
        className={cn("hero-slide-layer absolute", className)}
        style={styleVars}
      >
        {!isDesktopHidden && (
          <div className="hidden md:block absolute inset-0 w-full h-full">
            <Image
              src={desktopSrc}
              alt={alt}
              fill
              sizes={sizes || "100vw"}
              className="hero-slide-layer__image"
              onError={handleImageError}
              priority={priority ?? zIndex === 0}
            />
          </div>
        )}
        {!isMobileHidden && (
          <div className="block md:hidden absolute inset-0 w-full h-full">
            <Image
              src={mobileSrc}
              alt={alt}
              fill
              sizes={sizes || "100vw"}
              className="hero-slide-layer__image"
              onError={handleImageError}
              priority={priority ?? zIndex === 0}
            />
          </div>
        )}
      </div>
    );
  }

  const isDesktopHidden = layout?.desktop?.display === "none";
  const finalSrc = isDesktopHidden
    ? "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    : src;

  return (
    <div
      ref={layerRef}
      className={cn("hero-slide-layer absolute", className)}
      style={styleVars}
    >
      <Image
        src={finalSrc}
        alt={alt}
        fill
        sizes={sizes || "100vw"}
        className="hero-slide-layer__image"
        onError={handleImageError}
        priority={priority ?? zIndex === 0}
      />
    </div>
  );
}
