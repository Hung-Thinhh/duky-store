'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

export interface Slide {
  id: number;
  label: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
}

interface BannerProductProps {
  slides: Slide[];
}

export const BannerProduct: React.FC<BannerProductProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    // Initial animation
    const ctx = gsap.context(() => {
      gsap.from(".slide-content > *", {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out"
      });
      gsap.from(".slide-image", {
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      changeSlide(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex, slides.length]);

  const changeSlide = (index: number) => {
    if (index === currentIndex || isAnimating.current) return;
    isAnimating.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setCurrentIndex(index);
          // Animate in new content
          gsap.fromTo(".slide-content > *", 
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: "power3.out" }
          );
          gsap.fromTo(".slide-image",
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", onComplete: () => {
              isAnimating.current = false;
            }}
          );
        }
      });

      // Animate out current content
      tl.to(".slide-content > *", {
        y: -20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "power3.in"
      });
      tl.to(".slide-image", {
        x: -30,
        opacity: 0,
        duration: 0.5,
        ease: "power3.in"
      }, "<");
    }, containerRef);
  };

  const currentSlide = slides[currentIndex];

  if (!slides || slides.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden glass-effect rounded-[2.5rem] flex items-center shadow-2xl border border-white/40"
      style={{ aspectRatio: '778 / 352' }}
    >
      {/* Content Side */}
      <div className="w-1/2 px-12 lg:px-12 z-10 slide-content">
        <span className="badge-title uppercase tracking-[0.2em] text-[10px] sm:text-xs text-gray-500 font-semibold mb-4">
          {currentSlide.label}
        </span>
        <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-black leading-[1.1] mb-6 max-w-[450px]">
          {currentSlide.title}
        </h2>
        <div className="w-12 h-[1px] bg-gray-300 mb-6" />
        <p className="content text-sm md:text-sm text-gray-500 mb-10 max-w-[280px] leading-relaxed">
          {currentSlide.description}
        </p>
        
        <button className="content bg-black text-white px-6 py-3 btn text-sm font-semibold hover:bg-neutral-900 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-1 active:scale-95">
          {currentSlide.ctaText}
        </button>
      </div>

      {/* Image Side */}
      <div className="absolute right-0 top-0 bottom-0 w-[60%] slide-image pointer-events-none">
        <div className="relative w-full h-full">
          <Image
            src={currentSlide.image}
            alt={currentSlide.title}
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-contain object-right-bottom p-8"
            priority
          />
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => changeSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-500",
              currentIndex === index 
                ? "bg-black h-6 shadow-md shadow-black/20" 
                : "bg-gray-300 hover:bg-gray-400"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};


