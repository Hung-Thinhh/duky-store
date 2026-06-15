import type { ReactNode } from "react";

export interface FloatAnimationConfig {
  duration: number;
  delay: number;
  displacement: number;
  direction: "down" | "up" | "right" | "left";
  ease?: string;
}

export interface EntranceAnimationConfig {
  type: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right";
  duration: number;
  delay: number;
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
  fontSize?: number;
}

export interface LayerLayout {
  desktop: LayerViewportLayout;
  tablet: LayerViewportLayout;
  mobile: LayerViewportLayout;
}

export interface LayerConfig {
  type?: "image" | "text" | "button";
  src?: string;
  srcMobile?: string;
  alt?: string;
  zIndex: number;
  layout?: LayerLayout;
  left?: string;
  top?: string;
  width?: string;
  height?: string;
  display?: string;
  objectFit?: "cover" | "contain";
  objectPosition?: string;
  float?: FloatAnimationConfig;
  entranceAnimation?: EntranceAnimationConfig;
  sizes?: string;
  // Text fields
  content?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  fontFamily?: "montserrat" | "playfair";
  textAlign?: "left" | "center" | "right";
  textShadow?: string;
  letterSpacing?: number;
  lineHeight?: number;
  // Button fields
  label?: string;
  link?: string;
  variant?: "primary" | "secondary";
  buttonColor?: string;
  textColor?: string;
  // Gradient fields
  useGradient?: boolean;
  gradientType?: "linear" | "radial";
  gradientAngle?: number;
  gradientStops?: Array<{ id?: string; color: string; position: number }>;
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
  layers: {
    desktop: LayerConfig[];
    tablet: LayerConfig[];
    mobile: LayerConfig[];
  };
  text: SlideTextContent;
  animation?: SlideAnimationConfig;
}

export interface TrustItem {
  icon: ReactNode;
  title: string;
  desc: string;
}
