"use client";

import React, { useState, useEffect, useRef } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
}

/**
 * LazySection Component
 *
 * Wraps below-fold sections and defers rendering until they enter the viewport
 * (within the specified rootMargin). This prevents the JS chunks for these sections
 * from executing and evaluating during initial page load, dramatically reducing
 * JavaScript execution time and Total Blocking Time (TBT) in Lighthouse.
 */
export function LazySection({
  children,
  fallback = null,
  rootMargin = "300px",
}: LazySectionProps) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isInView, rootMargin]);

  return <div ref={ref}>{isInView ? children : fallback}</div>;
}
