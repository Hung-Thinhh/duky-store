"use client";
import { useRef, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LayerConfig } from "@/types/heroSlider";

// ─── CSS Keyframes mapping ──────────────────────────────────────────────

const ENTRANCE_KEYFRAMES: Record<string, string> = {
  fade: "hero-entrance-fade",
  "slide-up": "hero-entrance-slide-up",
  "slide-down": "hero-entrance-slide-down",
  "slide-left": "hero-entrance-slide-left",
  "slide-right": "hero-entrance-slide-right",
};

const FLOAT_KEYFRAMES: Record<string, string> = {
  down: "hero-float-down",
  up: "hero-float-up",
  right: "hero-float-right",
  left: "hero-float-left",
};

interface SlideLayerProps {
  layer: LayerConfig;
  isActive: boolean;
  viewport: "desktop" | "tablet" | "mobile";
  onError?: () => void;
  className?: string;
  priority?: boolean;
}

function getGradientCss(layer: LayerConfig): string | undefined {
  if (!layer.useGradient) return undefined;
  const type = layer.gradientType ?? "linear";
  const angle = layer.gradientAngle ?? 135;
  const stops = layer.gradientStops ?? [
    { color: "#101114", position: 0 },
    { color: "#70737a", position: 100 },
  ];
  const stopsStr = [...stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");

  if (type === "radial") {
    return `radial-gradient(circle, ${stopsStr})`;
  }
  return `linear-gradient(${angle}deg, ${stopsStr})`;
}

// ─── Component ──────────────────────────────────────────────────────────

export function SlideLayer({
  layer,
  isActive,
  viewport,
  onError,
  className,
  priority,
}: SlideLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  // ─── Layout computation ────────────────────────────────────────────

  const layout = layer.layout ?? { desktop: {}, tablet: {}, mobile: {} };
  const viewportLayout = layout[viewport] ?? {};

  // If display is none, hide it
  const display = layer.display ?? viewportLayout.display;
  if (display === "none") return null;

  const left = layer.left ?? viewportLayout.left ?? "0";
  const top = layer.top ?? viewportLayout.top ?? "0";
  const width = layer.width ?? viewportLayout.width ?? "100%";
  const height = layer.height ?? viewportLayout.height ?? "100%";
  const objectFit = layer.objectFit ?? viewportLayout.objectFit ?? "contain";
  const objectPosition =
    layer.objectPosition ?? viewportLayout.objectPosition ?? "center";

  const positionStyle: CSSProperties = {
    position: "absolute",
    left,
    top,
    width,
    height,
    right: "auto",
    bottom: "auto",
    zIndex: layer.zIndex,
  };

  // ─── Entrance animation style (CSS) ─────────────────────────────────

  const entrance = layer.entranceAnimation;
  const entranceStyle: CSSProperties =
    entrance && ENTRANCE_KEYFRAMES[entrance.type]
      ? {
          animation: `${ENTRANCE_KEYFRAMES[entrance.type]} ${entrance.duration}ms ease-out ${entrance.delay}ms both`,
        }
      : {};

  // ─── Float animation style (CSS) ────────────────────────────────────

  const floatConfig = layer.float;
  const floatDir = floatConfig?.direction || "down";
  const floatSign = floatDir === "up" || floatDir === "left" ? "-" : "";
  const isMobileView = viewport === "mobile";
  const floatStyle: CSSProperties =
    floatConfig && isActive && !isMobileView
      ? {
          animation: `${FLOAT_KEYFRAMES[floatDir]} ${floatConfig.duration}s ease-in-out ${floatConfig.delay}s infinite`,
          ["--float-d" as string]: `${floatSign}${floatConfig.displacement || 8}px`,
        }
      : {};

  // ─── Render IMAGE layer ─────────────────────────────────────────────

  if (layer.type === "image" || (!layer.type && layer.src)) {
    let src = layer.src || "";
    if (viewport === "mobile" && layer.srcMobile) {
      src = layer.srcMobile;
    }

    return (
      <div
        ref={layerRef}
        className={cn("hero-slide-layer absolute", className)}
        style={{ ...positionStyle, ...entranceStyle }}
      >
        <div
          style={{
            ...floatStyle,
            width: "100%",
            height: "100%",
            position: "absolute",
            inset: 0,
          }}
        >
          <Image
            src={src}
            alt={layer.alt || ""}
            fill
            sizes={layer.sizes || "100vw"}
            style={{
              objectFit,
              objectPosition,
            }}
            onError={() => {
              setHasError(true);
              onError?.();
            }}
            priority={priority ?? layer.zIndex === 0}
          />
        </div>
      </div>
    );
  }

  // ─── Render TEXT layer ───────────────────────────────────────────────

  if (layer.type === "text") {
    const fontSize = layer.fontSize ?? viewportLayout.fontSize ?? 24;
    const gradientCss = getGradientCss(layer);
    const textStyle: CSSProperties = {
      fontSize: `${fontSize}px`,
      fontWeight: layer.fontWeight ?? 400,
      fontFamily:
        layer.fontFamily === "playfair"
          ? "var(--font-accent)"
          : "var(--font-main)",
      textAlign: layer.textAlign ?? "left",
      lineHeight: layer.lineHeight ?? 1.3,
      letterSpacing: layer.letterSpacing
        ? `${layer.letterSpacing}px`
        : undefined,
      textShadow: layer.textShadow || undefined,
      margin: 0,
    };

    if (gradientCss) {
      textStyle.backgroundImage = gradientCss;
      textStyle.backgroundClip = "text";
      textStyle.WebkitBackgroundClip = "text";
      textStyle.WebkitTextFillColor = "transparent";
    } else {
      textStyle.color = layer.color ?? "#101114";
    }

    return (
      <div
        ref={layerRef}
        className={cn("hero-slide-layer absolute", className)}
        style={{ ...positionStyle, ...entranceStyle }}
      >
        <div
          style={{
            ...floatStyle,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent:
              layer.textAlign === "center"
                ? "center"
                : layer.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
          }}
        >
          <p style={textStyle} className={gradientCss ? "bg-clip-text" : undefined}>
            {layer.content || ""}
          </p>
        </div>
      </div>
    );
  }

  // ─── Render BUTTON layer ─────────────────────────────────────────────

  if (layer.type === "button") {
    const buttonGradientCss = getGradientCss(layer);
    const fontSize = layer.fontSize ?? viewportLayout.fontSize ?? 14;
    const btnStyle: CSSProperties = {
      display: "inline-block",
      fontWeight: layer.fontWeight ?? 600,
      borderRadius: 9999,
      color: layer.textColor ?? "#ffffff",
      fontFamily:
        layer.fontFamily === "playfair"
          ? "var(--font-accent)"
          : "var(--font-main)",
      padding: "10px 28px",
      fontSize: `${fontSize}px`,
      border:
        layer.variant === "secondary" ? "2px solid #101114" : "none",
    };

    if (buttonGradientCss) {
      btnStyle.background = buttonGradientCss;
    } else {
      btnStyle.background = layer.buttonColor ?? "#101114";
    }

    return (
      <div
        ref={layerRef}
        className={cn("hero-slide-layer absolute", className)}
        style={{ ...positionStyle, ...entranceStyle }}
      >
        <div
          style={{
            ...floatStyle,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Link href={layer.link || "/"}>
            <span style={btnStyle}>
              {layer.label || "Xem thêm"}
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

export default SlideLayer;
