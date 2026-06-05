"use client";

import React, { useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import type { SlideTextContent } from "@/types/heroSlider";

// ─── Props ───────────────────────────────────────────────────────────────────

interface TextOverlayProps {
  content: SlideTextContent;
  isActive: boolean;
  transitionDuration?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * TextOverlay renders the text content layer (badge, title, tagline, CTA buttons)
 * above all image layers with GSAP staggered entry/exit animations.
 *
 * Total animation budget: 800ms (exit 300ms + enter 500ms with overlap).
 */
export const TextOverlay: React.FC<TextOverlayProps> = ({
  content,
  isActive,
  transitionDuration = 800,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasAnimatedIn = useRef(false);
  const textStyle = content.style;

  const textVars = {
    "--hero-badge-color": textStyle?.badgeColor,
    "--hero-title-color": textStyle?.titleColor,
    "--hero-tagline-color": textStyle?.taglineColor,
    "--hero-divider-color": textStyle?.dividerColor,
    "--hero-badge-size": textStyle?.badgeSize?.desktop,
    "--hero-badge-size-md": textStyle?.badgeSize?.tablet,
    "--hero-badge-size-sm": textStyle?.badgeSize?.mobile,
    "--hero-title-size": textStyle?.titleSize?.desktop,
    "--hero-title-size-md": textStyle?.titleSize?.tablet,
    "--hero-title-size-sm": textStyle?.titleSize?.mobile,
    "--hero-tagline-size": textStyle?.taglineSize?.desktop,
    "--hero-tagline-size-md": textStyle?.taglineSize?.tablet,
    "--hero-tagline-size-sm": textStyle?.taglineSize?.mobile,
    "--hero-button-size": textStyle?.buttonSize?.desktop,
    "--hero-button-size-md": textStyle?.buttonSize?.tablet,
    "--hero-button-size-sm": textStyle?.buttonSize?.mobile,
  } as CSSProperties;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const textElements = container.querySelectorAll("[data-animate]");
    if (textElements.length === 0) return;

    // Kill any existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    if (isActive) {
      // Animate in: staggered fade + translateY
      // Budget: ~500ms for enter (transitionDuration * 0.625)
      const enterDuration = Math.min(transitionDuration * 0.625, 500) / 1000; // seconds
      const staggerDelay = 0.08;

      const tl = gsap.timeline();

      tl.fromTo(
        textElements,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: enterDuration > 0 ? enterDuration : 0.3,
          stagger: staggerDelay,
          ease: "power2.out",
        },
      );

      timelineRef.current = tl;
      hasAnimatedIn.current = true;
    } else {
      // Animate out: staggered fade + translateY upward
      // Budget: ~300ms for exit (transitionDuration * 0.375)
      if (hasAnimatedIn.current) {
        const exitDuration = Math.min(transitionDuration * 0.375, 300) / 1000; // seconds

        const tl = gsap.timeline();

        tl.to(textElements, {
          opacity: 0,
          y: -20,
          duration: exitDuration > 0 ? exitDuration : 0.2,
          stagger: 0.05,
          ease: "power2.in",
        });

        timelineRef.current = tl;
        hasAnimatedIn.current = false;
      } else {
        // Not yet animated in, just set hidden
        gsap.set(textElements, { opacity: 0, y: 20 });
      }
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [isActive, content, transitionDuration]);

  return (
    <div
      ref={containerRef}
      className="hero-text-overlay"
      style={textVars}
    >
      <div
        className="hero-text-panel"
        style={{
          background: "none",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
          border: "none",
          boxShadow: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {/* Badge */}
        <span
          data-animate
          className="hero-text-badge hero-text-badge-emphasis"
        >
          {content.badge}
        </span>

        {/* Title */}
        <h1 data-animate className="hero-text-title">
          {content.title}
        </h1>

        {/* Tagline with separator */}
        <div data-animate className="hero-text-tagline-row">
          <div className="hero-text-divider" />
          <p className="hero-text-tagline hero-text-tagline-light">
            {content.tagline}
          </p>
        </div>

        {/* CTA Buttons */}
        <div data-animate className="hero-text-actions">
          {content.buttons.map((button, index) => {
            const isPrimary = button.variant === "primary";
            return (
              <Link
                key={`${button.link}-${index}`}
                href={button.link}
                className={cn(
                  "px-8 py-4 font-semibold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hero-text-button hero-text-cta",
                  isPrimary
                    ? "bg-black text-white rounded-full hover:-translate-y-1 hover:shadow-premium-black hero-text-cta-primary"
                    : "glass-effect border-black/10 text-text-main rounded-full hover:-translate-y-1 hover:shadow-premium-glass hero-text-cta-secondary"
                )}
              >
                {button.label}
                {isPrimary && (
                  <ArrowRight size={16} className="hero-text-arrow" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TextOverlay;
