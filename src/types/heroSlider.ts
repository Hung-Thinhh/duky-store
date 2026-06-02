import type { ReactNode } from "react";

export interface FloatAnimationConfig {
  duration: number;
  delay: number;
  displacement: number;
  ease: string;
}

export interface LayerViewportLayout {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width?: string;
  height?: string;
  objectFit?: "cover" | "contain";
  objectPosition?: string;
  display?: string;
}

export interface LayerLayout {
  desktop?: LayerViewportLayout;
  tablet?: LayerViewportLayout;
  mobile?: LayerViewportLayout;
}

export interface LayerConfig {
  src: string;
  srcMobile?: string;
  alt: string;
  zIndex: number;
  role?: "background" | "pedestal" | "model" | "boot";
  layout?: LayerLayout;
  float?: FloatAnimationConfig;
}

export interface CTAButton {
  label: string;
  link: string;
  variant: "primary" | "secondary";
}

export interface ResponsiveTextSize {
  desktop?: string;
  tablet?: string;
  mobile?: string;
}

export interface SlideTextStyle {
  badgeColor?: string;
  titleColor?: string;
  taglineColor?: string;
  dividerColor?: string;
  badgeSize?: ResponsiveTextSize;
  titleSize?: ResponsiveTextSize;
  taglineSize?: ResponsiveTextSize;
  buttonSize?: ResponsiveTextSize;
}

export interface SlideTextContent {
  badge: string;
  title: string;
  tagline: string;
  buttons: CTAButton[];
  style?: SlideTextStyle;
}

export interface SlideAnimationConfig {
  duration: number;
  ease: string;
  entryDirection: "left" | "right" | "fade";
}

export interface SlideConfig {
  id: string;
  layers: LayerConfig[];
  text: SlideTextContent;
  animation?: SlideAnimationConfig;
}

export interface TrustItem {
  icon: ReactNode;
  title: string;
  desc: string;
}
