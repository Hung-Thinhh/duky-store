import React, { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { CategoryCard, ProductCard } from "@/components/shop";
import { useProducts } from "@/hooks/useProducts";

const CATEGORIES_DATA = [
  { title: "Boot nam", imageSrc: "/assets/boot_nam.png", href: "/collections/boot-nam" },
  { title: "Boot nữ", imageSrc: "/assets/boot_nu.png", href: "/collections/boot-nu" },
  { title: "Outfit", imageSrc: "/assets/out_fit.png", href: "/collections/outfit" },
  { title: "Phụ kiện", imageSrc: "/assets/phu_kien.png", href: "/collections/phu-kien" },
];

export const CategorySection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products, loading } = useProducts({ isBestSeller: true, limit: 12 });

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8; 
      let targetScroll = direction === "right" ? scrollLeft + scrollAmount : scrollLeft - scrollAmount;

      if (direction === "right" && scrollLeft + clientWidth >= scrollWidth - 20) {
        targetScroll = 0;
      } else if (direction === "left" && scrollLeft <= 0) {
        targetScroll = scrollWidth - clientWidth;
      }

      gsap.to(scrollRef.current, {
        scrollLeft: targetScroll,
        duration: 1.2,
        ease: "power2.inOut",
        overwrite: true
      });
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let isHovered = false;
    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => { isHovered = false; };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    const autoScroll = setInterval(() => {
      if (!isHovered) {
        handleScroll("right");
      }
    }, 6000);

    return () => {
      clearInterval(autoScroll);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section 
      className="pt-24 pb-8 px-6 overflow-hidden"
    >
      <div className="container-custom">
        {/* Header */}
        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
              Danh mục nổi bật
            </h2>
            <p className="content text-text-muted leading-relaxed text-[13px] md:text-sm font-light py-2 max-w-md">
              Lựa chọn chuẩn gu, nâng tầm phong cách.
            </p>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {CATEGORIES_DATA.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
              className="w-full"
            >
              <CategoryCard
                title={cat.title}
                imageSrc={cat.imageSrc}
                href={cat.href}
              />
            </motion.div>
          ))}
        </div>

        {/* Best Sellers Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-8 md:mt-16 bg-white rounded-[32px] p-6 lg:p-10 shadow-[0_2px_20px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group/section"
        >
          {/* Header Khối */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h3 className="content text-2xl md:text-2xl lg:text-[40px] font-semibold text-text-main leading-tight tracking-tight">
              Sản phẩm bán chạy
            </h3>
            <a href="/products?isBestSeller=true" className="group flex items-center gap-1.5 text-sm md:text-base font-medium text-gray-500 hover:text-black transition-colors">
              Xem tất cả 
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="relative group/slider">
            {/* Navigation Buttons */}
            <button 
              onClick={() => handleScroll("left")}
              className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center text-black opacity-100 lg:opacity-0 lg:group-hover/slider:opacity-100 lg:group-hover/slider:translate-x-2 transition-all duration-300 hover:bg-gray-100 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Previous products"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>

            {/* Danh sách sản phẩm */}
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 md:gap-6 pb-6 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-2 px-2"
            >
              {loading ? (
                // Skeleton loading
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-[220px] md:w-[240px] snap-start flex-shrink-0">
                    <div className="animate-pulse bg-gray-100 rounded-2xl p-3">
                      <div className="aspect-square rounded-xl bg-gray-200 mb-3" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                products.map((product) => (
                  <div 
                    key={product.id} 
                    className="w-[220px] md:w-[240px] snap-start flex-shrink-0"
                  >
                    <ProductCard 
                      product={product} 
                      variant="bestSeller"
                      priority={false}
                    />
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => handleScroll("right")}
              className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center text-black opacity-100 lg:opacity-0 lg:group-hover/slider:opacity-100 lg:group-hover/slider:-translate-x-2 transition-all duration-300 hover:bg-gray-100 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Next products"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
