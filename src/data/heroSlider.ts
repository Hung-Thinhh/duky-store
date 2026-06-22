import heroSliderConfig from "@/data/heroSlider.config.json";
import type { SlideConfig, LayerConfig } from "@/types/heroSlider";

type SliderFolder = "slider_1" | "slider_2" | "slider_3";

interface SliderConfigLayer {
  file: string;
  fileMobile?: string;
  alt: string;
  zIndex: number;
  role?: "background" | "pedestal" | "model" | "boot";
  layout?: any;
  float?: {
    duration: number;
    delay: number;
    displacement: number;
    direction?: "down" | "up" | "right" | "left";
  };
  sizes?: string;
}

interface SliderConfigSlide {
  id: string;
  folder: SliderFolder;
  layers: SliderConfigLayer[];
  text: SlideConfig["text"];
  animation?: SlideConfig["animation"];
}

interface SliderConfigRoot {
  slides: SliderConfigSlide[];
}

const config = heroSliderConfig as SliderConfigRoot;

const lockedFolderBySlideId: Partial<Record<string, SliderFolder>> = {
  "slide-2": "slider_2",
};

const toAssetPath = (folder: SliderFolder, fileName: string) =>
  `/assets/${folder}/${fileName}`;

// ─── Flatten Layer helper ──────────────────────────────────────────────

function getFlattenedLayers(
  layers: any[],
  viewport: "desktop" | "tablet" | "mobile",
  folder?: SliderFolder,
): LayerConfig[] {
  return layers
    .map((l: any) => {
      const layout = l.layout?.[viewport] ?? {};

      // If hidden in this viewport, skip rendering entirely
      if (layout.display === "none") {
        return null;
      }

      const type = l.type || "image";

      // File path resolution for static sliders
      let src = l.src;
      if (!src && l.file) {
        src = toAssetPath(folder || "slider_1", l.file);
      }

      let srcMobile = l.srcMobile;
      if (!srcMobile && l.fileMobile) {
        srcMobile = toAssetPath(folder || "slider_1", l.fileMobile);
      }

      const left = layout.left ?? l.left ?? "0";
      const top = layout.top ?? l.top ?? "0";
      const width = layout.width ?? l.width ?? "100%";
      const height = layout.height ?? l.height ?? "100%";
      const objectFit = layout.objectFit ?? l.objectFit ?? "contain";
      const objectPosition =
        layout.objectPosition ?? l.objectPosition ?? "center";
      const defaultFontSize = type === "button" ? 14 : 24;
      const fontSize = layout.fontSize ?? l.fontSize ?? defaultFontSize;

      return {
        type,
        src,
        srcMobile,
        alt: l.alt || "",
        zIndex: l.zIndex ?? 0,
        layout: {
          desktop: l.layout?.desktop ?? {},
          tablet: l.layout?.tablet ?? {},
          mobile: l.layout?.mobile ?? {},
        },
        left,
        top,
        width,
        height,
        objectFit,
        objectPosition,
        fontSize,

        // Text fields
        content: l.content,
        fontWeight: l.fontWeight,
        color: l.color,
        fontFamily: l.fontFamily,
        textAlign: l.textAlign,
        textShadow: l.textShadow,
        letterSpacing: l.letterSpacing,
        lineHeight: l.lineHeight,

        // Button fields
        label: l.label,
        link: l.link,
        variant: l.variant,
        buttonColor: l.buttonColor,
        textColor: l.textColor,

        // Animation
        float: l.float,
        entranceAnimation: l.entranceAnimation,
      };
    })
    .filter(Boolean) as LayerConfig[];
}

// ─── Static Converter ──────────────────────────────────────────────────

const toSlideConfig = (slide: SliderConfigSlide): SlideConfig => {
  const folder = lockedFolderBySlideId[slide.id] ?? slide.folder;
  return {
    id: slide.id,
    layers: {
      desktop: getFlattenedLayers(slide.layers, "desktop", folder),
      tablet: getFlattenedLayers(slide.layers, "tablet", folder),
      mobile: getFlattenedLayers(slide.layers, "mobile", folder),
    },
    text: slide.text,
    animation: slide.animation,
  };
};

export const HERO_SLIDES: SlideConfig[] = config.slides.map(toSlideConfig);

const fallbackText =
  HERO_SLIDES[0]?.text ??
  config.slides[0]?.text ?? {
    badge: "",
    title: "",
    tagline: "",
    buttons: [],
  };

const fallbackLayers = {
  desktop: HERO_SLIDES[0]?.layers?.desktop ?? [],
  tablet: HERO_SLIDES[0]?.layers?.tablet ?? [],
  mobile: HERO_SLIDES[0]?.layers?.mobile ?? [],
};

export const FALLBACK_SLIDE: SlideConfig = {
  id: "fallback",
  layers: fallbackLayers,
  text: fallbackText,
};

// ─── Convert dashboard per-viewport format → split format ──────────────

function convertDashboardSlides(slides: any[]): SlideConfig[] {
  return slides.map((slide) => {
    // New per-viewport format (layers object containing viewports)
    if (slide.layers && !Array.isArray(slide.layers)) {
      const desktop = slide.layers.desktop ?? [];
      const tablet = slide.layers.tablet ?? [];
      const mobile = slide.layers.mobile ?? [];

      return {
        id: slide.id,
        layers: {
          desktop: getFlattenedLayers(desktop, "desktop"),
          tablet: getFlattenedLayers(tablet, "tablet"),
          mobile: getFlattenedLayers(mobile, "mobile"),
        },
        text: slide.text || { badge: "", title: "", tagline: "", buttons: [] },
        animation: slide.animation,
      };
    }

    // Fallback/Legacy format (layers is flat array)
    const layersArr = Array.isArray(slide.layers) ? slide.layers : [];
    return {
      id: slide.id,
      layers: {
        desktop: getFlattenedLayers(layersArr, "desktop"),
        tablet: getFlattenedLayers(layersArr, "tablet"),
        mobile: getFlattenedLayers(layersArr, "mobile"),
      },
      text: slide.text || { badge: "", title: "", tagline: "", buttons: [] },
      animation: slide.animation,
    };
  });
}

// ─── API fetch ─────────────────────────────────────────────────────────

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function getHeroSliderData(): Promise<SlideConfig[]> {
  try {
    const res = await fetch(`${API_URL}/homepage`, { next: { revalidate: 60 } });
    if (!res.ok) return HERO_SLIDES;

    const json = await res.json();
    const sections = json?.DT?.data ?? json?.DT ?? [];
    const heroSection = sections.find(
      (s: any) => s.type === "HERO" && s.status === "PUBLISHED",
    );

    if (heroSection?.metadata?.slides?.length > 0) {
      return convertDashboardSlides(heroSection.metadata.slides);
    }
  } catch (error) {
    console.error("Error loading homepage slider data:", error);
    // Fallback to static config
  }
  return HERO_SLIDES;
}
