"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { FEEDBACKS } from "@/data/feedback";
import FeedBackCard from "../FeedBackCard";
import CalcSize from "../CalcSize";
import { fetchGalleryImages, GalleryImage } from "@/lib/api";

const STEPS = [
  {
    id: "01",
    title: "Đo chiều dài bàn chân",
    image: "/assets/step_1.png",
  },
  {
    id: "02",
    title: "Đối chiếu bảng size Duky",
    image: "/assets/step_2.png",
  },
  {
    id: "03",
    title: "Nhận size đề xuất",
    image: "/assets/step_3.png",
  },
];

const MOCK_LOOKBOOK_IMAGES: GalleryImage[] = [
  { id: "mock-1", src: "/assets/mau_nam_1.png", alt: "Lookbook 1" },
  { id: "mock-2", src: "/assets/mau_nam_2.png", alt: "Lookbook 2" },
  { id: "mock-3", src: "/assets/mau_nu_1.png", alt: "Lookbook 3" },
  { id: "mock-4", src: "/assets/mau_nu_2.png", alt: "Lookbook 4" },
  { id: "mock-5", src: "/assets/mau_nu_2.png", alt: "Lookbook 5" },
  { id: "mock-6", src: "/assets/mau_nu_3.png", alt: "Lookbook 6" },
];

export const GuideSection = () => {
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const lookbookSliderRef = React.useRef<HTMLDivElement>(null);
  const [showCalculator, setShowCalculator] = React.useState(false);
  const [lookbookImages, setLookbookImages] =
    React.useState<GalleryImage[]>(MOCK_LOOKBOOK_IMAGES);

  React.useEffect(() => {
    fetchGalleryImages()
      .then((data) => {
        if (data && data.length > 0) {
          // Lấy ngẫu nhiên tối đa 20 hình làm đại diện
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          setLookbookImages(shuffled.slice(0, 20));
        }
      })
      .catch((err) => {
        console.error("Failed to load lookbook images:", err);
      });
  }, []);

  React.useEffect(() => {
    if (!sliderRef.current) return;

    const track = sliderRef.current;
    const items = track.querySelectorAll(".feedback-item");
    const trackWidth = track.scrollWidth / 3; // Since we tripled the feedbacks

    // Initial position
    gsap.set(track, { x: 0 });

    // Infinite loop animation (Right to Left)
    const animation = gsap.to(track, {
      x: -trackWidth,
      duration: 80,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        const center = window.innerWidth / 2;
        items.forEach((item) => {
          const rect = item.getBoundingClientRect();
          const itemCenter = rect.left + rect.width / 2;
          const distance = Math.abs(center - itemCenter);
          const maxDistance = 600; // Range of focus effect

          // Calculate scale and opacity based on distance from center
          let scale = 1;
          let opacity = 1;
          let blur = 0;

          if (distance < maxDistance) {
            const factor = 1 - distance / maxDistance;
            scale = 0.9 + 0.2 * factor; // 0.9 to 1.1
            opacity = 0.8 + 0.2 * factor; // 0.8 to 1
            blur = 0.3 * (1 - factor); // 0.5px to 0px
          } else {
            scale = 0.9;
            opacity = 0.8;
            blur = 0.3;
          }

          gsap.set(item, {
            scale: scale,
            opacity: opacity,
            filter: `blur(${blur}px)`,
            zIndex: distance < 100 ? 10 : 1,
          });
        });
      },
    });

    // Pause on hover
    track.addEventListener("mouseenter", () => animation.pause());
    track.addEventListener("mouseleave", () => animation.play());

    return () => {
      animation.kill();
    };
  }, []);

  React.useEffect(() => {
    if (!lookbookSliderRef.current || lookbookImages.length === 0) return;

    const track = lookbookSliderRef.current;

    const ctx = gsap.context(() => {
      const trackWidth = track.scrollWidth / 3;

      // Set initial position to -trackWidth to slide towards 0 (Left to Right)
      gsap.set(track, { x: -trackWidth });

      const animation = gsap.to(track, {
        x: 0,
        duration: 120,
        ease: "none",
        repeat: -1,
      });

      const handleMouseEnter = () => animation.pause();
      const handleMouseLeave = () => animation.play();

      track.addEventListener("mouseenter", handleMouseEnter);
      track.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        track.removeEventListener("mouseenter", handleMouseEnter);
        track.removeEventListener("mouseleave", handleMouseLeave);
        animation.kill();
      };
    }, lookbookSliderRef);

    return () => {
      ctx.revert();
    };
  }, [lookbookImages]);

  return (
    <section className="pt-24 pb-8 px-6 overflow-hidden">
      <div className="container-custom">
        <div className="glass-effect p-4 mt-8 md:p-8 lg:p-12 overflow-hidden shadow-2xl">
          <div className="w-full max-w-[1380px] relative flex flex-row lg:flex-row items-center justify-between gap-2 lg:gap-0 size-guide-row">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-[40%] flex flex-col items-start space-y-4 lg:pl-12"
            >
              <h2 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
                Chọn đúng size giày chỉ trong 30 giây
              </h2>
              <p className="content text-sm md:text-base text-gray-500">
                3 bước đơn giản giúp bạn chọn size vừa vặn nhất.
              </p>
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="group bg-black text-white px-10 py-4 btn text-sm font-medium flex items-center gap-3 hover:bg-neutral-900 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-1 active:scale-95 cursor-pointer"
              >
                {showCalculator ? "Đóng công cụ" : "Bắt đầu tính"}
                <ArrowRight
                  size={18}
                  className={cn(
                    "transition-transform duration-300 group-hover:translate-x-1",
                    showCalculator && "rotate-90",
                  )}
                />
              </button>
            </motion.div>

            {/* Right Steps */}
            <div className="w-full lg:w-[60%] flex items-center justify-center lg:justify-end gap-4 lg:pr-12">
              <div className="flex flex-row md:flex-row items-center gap-4 lg:gap-6 size-guide-steps">
                {STEPS.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.15 }}
                      className="bg-white rounded-[32px] p-2 lg:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-row items-center text-center w-[280px] md:w-[240px] lg:w-[280px] h-full border border-border-subtle group"
                    >
                      <div className="relative w-full aspect-square overflow-hidden rounded-2xl">
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 280px"
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col items-start w-full justify-start mb-2">
                        <span className="text-2xl font-bold font-accent text-text-main opacity-20">
                          {step.id}
                        </span>
                        <p className="text-base font-medium text-text-main text-left w-full leading-tight">
                          {step.title}
                        </p>
                      </div>
                    </motion.div>

                    {/* Arrow between cards (hidden on mobile, shown on desktop) */}
                    {index < STEPS.length - 1 && (
                      <div className="hidden lg:flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-border-subtle">
                          <ChevronRight size={20} className="text-text-muted" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-100 my-8 opacity-50" />

          {/* Shoe Size Calculator */}
          <AnimatePresence>
            {showCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <CalcSize />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lookbook Section */}
        <div className="glass-effect p-4 mt-8 md:p-8 lg:p-12 overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
              Phối đồ cùng Duky
            </h2>
            <Link
              href="/gallery"
              className="content flex items-center gap-2 text-sm md:text-base font-medium text-gray-500 hover:text-black transition-colors group"
            >
              Xem lookbook
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="lookbook-slider-container relative overflow-hidden py-4">
            <div
              className="lookbook-track flex gap-4 md:gap-6"
              ref={lookbookSliderRef}
              style={{ width: "fit-content" }}
            >
              {[...lookbookImages, ...lookbookImages, ...lookbookImages].map(
                (img, i) => (
                  <motion.div
                    key={`${i}-${img.id}-${img.src}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 shrink-0"
                    style={{ width: "280px" }}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt || `Lookbook ${i + 1}`}
                      fill
                      sizes="280px"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                  </motion.div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="glass-effect p-4 mt-8 md:p-8 lg:p-12 overflow-hidden shadow-2xl relative">
          <div className="flex justify-between items-center mb-10 px-2">
            <h2 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
              Khách hàng nói gì về Duky Store
            </h2>
            {/* <Link 
              href="/feedback" 
              className="content flex items-center gap-2 text-sm md:text-base font-medium text-gray-500 hover:text-black transition-colors group"
            >
              Xem tất cả đánh giá
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link> */}
          </div>

          <div className="feedback-slider-container relative overflow-hidden py-10">
            <div
              className="feedback-track flex gap-8 items-center"
              ref={sliderRef}
              style={{ width: "fit-content" }}
            >
              {[...FEEDBACKS, ...FEEDBACKS, ...FEEDBACKS].map((fb, i) => (
                <div
                  key={`${fb.id}-${i}`}
                  className="feedback-item shrink-0"
                  style={{ width: "min(85vw, 400px)" }}
                >
                  <FeedBackCard {...fb} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
