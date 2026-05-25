import heroSliderConfig from "@/data/heroSlider.config.json";
import type { SlideConfig } from "@/types/heroSlider";

type SliderFolder = "slider_1" | "slider_2" | "slider_3";

interface SliderConfigLayer {
  file: string;
  alt: string;
  zIndex: number;
  role?: "background" | "pedestal" | "model" | "boot";
  layout?: SlideConfig["layers"][number]["layout"];
  float?: {
    duration: number;
    delay: number;
    displacement: number;
    ease: string;
  };
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

const toSlideConfig = (slide: SliderConfigSlide): SlideConfig => ({
  id: slide.id,
  // Guard: slide-2 must always resolve assets from slider_2 only.
  // This prevents accidental cross-folder assets in config.
  // Other slides continue to use their own configured folder.
  layers: slide.layers.map((layer) => ({
    src: toAssetPath(lockedFolderBySlideId[slide.id] ?? slide.folder, layer.file),
    alt: layer.alt,
    zIndex: layer.zIndex,
    role: layer.role,
    layout: layer.layout,
    float: layer.float,
  })),
  text: slide.text,
  animation: slide.animation,
});

export const HERO_SLIDES: SlideConfig[] = config.slides.map(toSlideConfig);

const fallbackText =
  HERO_SLIDES[0]?.text ??
  config.slides[0]?.text ?? {
    badge: "",
    title: "",
    tagline: "",
    buttons: [],
  };

const fallbackLayers =
  HERO_SLIDES[0]?.layers?.map((layer, index) => ({
    ...layer,
    zIndex: index,
  })) ?? [];

export const FALLBACK_SLIDE: SlideConfig = {
  id: "fallback",
  layers: fallbackLayers,
  text: fallbackText,
};

export async function getHeroSliderData(): Promise<SlideConfig[]> {
  return HERO_SLIDES;
}
