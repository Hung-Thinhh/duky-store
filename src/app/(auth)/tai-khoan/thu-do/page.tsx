"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Check,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Award,
  Layers,
  Heart,
  Clock,
  Minus,
  Plus,
  CreditCard,
} from "lucide-react";
import { fetchProductBySlug, fetchProducts, fetchProductVariants, ProductVariant } from "@/lib/api";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { BackButton } from "@/components/shop/BackButton";
import { Header, Footer } from "@/components/layout";

// Types
type TryOnStep = "upload" | "generating" | "workspace";
type Gender = "male" | "female";
type OutfitStyle = "formal" | "street" | "casual" | "retro";

interface ClothingCombo {
  name: string;
  price: number;
  rating: number;
  reviewsCount: number;
  soldCount: number;
  imageUrl: string;
  colors: { hex: string; label: string }[];
  sizes: string[];
}

const COMBO_CLOTHING_ITEMS: Record<OutfitStyle, ClothingCombo> = {
  formal: {
    name: "Áo vest công sở thanh lịch",
    price: 1590000,
    rating: 4.9,
    reviewsCount: 96,
    soldCount: 215,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400",
    colors: [
      { hex: "#0f172a", label: "Đen tuyền" },
      { hex: "#1e3a8a", label: "Xanh Navy" },
      { hex: "#3f3f46", label: "Xám khói" },
      { hex: "#451a03", label: "Nâu đất" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  street: {
    name: "Áo khoác bomber thời thượng",
    price: 1290000,
    rating: 4.8,
    reviewsCount: 128,
    soldCount: 324,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400",
    colors: [
      { hex: "#d7c4a3", label: "Beige cát" },
      { hex: "#111111", label: "Đen tuyền" },
      { hex: "#4e5052", label: "Xám khói" },
      { hex: "#2d3b2a", label: "Xanh rêu" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  casual: {
    name: "Áo blazer năng động hàng ngày",
    price: 1450000,
    rating: 4.7,
    reviewsCount: 84,
    soldCount: 192,
    imageUrl: "https://images.unsplash.com/photo-1620012253295-c05518e99309?q=80&w=400",
    colors: [
      { hex: "#3f3f46", label: "Xám khói" },
      { hex: "#0f172a", label: "Đen tuyền" },
      { hex: "#451a03", label: "Nâu đất" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  retro: {
    name: "Áo khoác da cổ điển Vintage",
    price: 1890000,
    rating: 4.9,
    reviewsCount: 142,
    soldCount: 412,
    imageUrl: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=400",
    colors: [
      { hex: "#451a03", label: "Nâu đất" },
      { hex: "#111111", label: "Đen tuyền" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
};

interface ModelTemplate {
  gender: Gender;
  style: OutfitStyle;
  bodyUrl: string;
  // Position of face overlay in percent
  faceX: number;
  faceY: number;
  faceWidth: number;
  faceHeight: number;
  // Position of left/right shoes in percent
  leftShoe: { x: number; y: number; scale: number; rotation: number };
  rightShoe: { x: number; y: number; scale: number; rotation: number };
  defaultOutfitColor: string;
}

// Preset model template bodies
const MODEL_TEMPLATES: ModelTemplate[] = [
  {
    gender: "male",
    style: "formal",
    bodyUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800",
    faceX: 50.8,
    faceY: 13.8,
    faceWidth: 9.8,
    faceHeight: 9.8,
    leftShoe: { x: 47.2, y: 90.0, scale: 0.28, rotation: -12 },
    rightShoe: { x: 53.2, y: 90.0, scale: 0.28, rotation: 12 },
    defaultOutfitColor: "#0f172a",
  },
  {
    gender: "male",
    style: "street",
    bodyUrl: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=800",
    faceX: 50.0,
    faceY: 14.5,
    faceWidth: 10.2,
    faceHeight: 10.2,
    leftShoe: { x: 43.5, y: 81.0, scale: 0.46, rotation: -15 },
    rightShoe: { x: 56.5, y: 81.0, scale: 0.46, rotation: 15 },
    defaultOutfitColor: "#2563eb",
  },
  {
    gender: "female",
    style: "formal",
    bodyUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800",
    faceX: 50.0,
    faceY: 13.0,
    faceWidth: 9.6,
    faceHeight: 9.6,
    leftShoe: { x: 47.0, y: 92.5, scale: 0.26, rotation: -10 },
    rightShoe: { x: 52.8, y: 92.5, scale: 0.26, rotation: 10 },
    defaultOutfitColor: "#e11d48",
  },
  {
    gender: "female",
    style: "street",
    bodyUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800",
    faceX: 50.5,
    faceY: 14.2,
    faceWidth: 10.0,
    faceHeight: 10.0,
    leftShoe: { x: 42.0, y: 73.0, scale: 0.45, rotation: -14 },
    rightShoe: { x: 57.5, y: 73.0, scale: 0.45, rotation: 14 },
    defaultOutfitColor: "#16a34a",
  },
];

// Sample Faces
const SAMPLE_FACES = [
  { id: "face-m1", gender: "male", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150" },
  { id: "face-m2", gender: "male", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150" },
  { id: "face-f1", gender: "female", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" },
  { id: "face-f2", gender: "female", url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150" },
];

export default function TryOnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, cartCount } = useCart();

  const slug = searchParams.get("slug");

  // Step state
  const [step, setStep] = useState<TryOnStep>("upload");

  // Setup inputs
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>("male");
  const [stylePreference, setStylePreference] = useState<OutfitStyle>("formal");

  // Generation loading
  const [genProgress, setGenProgress] = useState(0);
  const [genStatusText, setGenStatusText] = useState("");

  // Shoe product lists
  const [shoeList, setShoeList] = useState<Product[]>([]);
  const [currentShoe, setCurrentShoe] = useState<Product | null>(null);
  const [shoeVariants, setShoeVariants] = useState<ProductVariant[]>([]);
  const [selectedShoeSize, setSelectedShoeSize] = useState<string | null>(null);
  const [selectedShoeColor, setSelectedShoeColor] = useState<string | null>(null);
  const [shoeQuantity, setShoeQuantity] = useState<number>(1);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  // Workspace settings
  const [outfitColor, setOutfitColor] = useState<string>("#0f172a");
  const [styleScore, setStyleScore] = useState<number | null>(null);
  const [styleComment, setStyleComment] = useState<string>("");
  const [isRating, setIsRating] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Redesign Workspace States
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [outfitSize, setOutfitSize] = useState<string>("M");
  const [accordionOpen, setAccordionOpen] = useState<"info" | "material" | null>(null);

  // Load product from slug + popular products
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Fetch popular shoes for switching list
        const listData = await fetchProducts({ limit: 12, sort: "newest" });
        setShoeList(listData.data);

        // Fetch current shoe if slug is provided
        if (slug) {
          const prod = await fetchProductBySlug(slug);
          setCurrentShoe(prod);
        } else if (listData.data.length > 0) {
          setCurrentShoe(listData.data[0]);
        }

        // Fetch some recommendation items (like socks/accessories/different colors)
        const recList = await fetchProducts({ limit: 4, isFeatured: true });
        setRecommendations(recList.data);
      } catch (err) {
        console.error("Lỗi tải thông tin sản phẩm thử đồ:", err);
      }
    }
    loadInitialData();
  }, [slug]);

  // Set document title
  useEffect(() => {
    document.title = "Thử đồ | Duky Store";
  }, []);

  // Fetch variants when currentShoe changes
  useEffect(() => {
    if (!currentShoe || !currentShoe.slug) {
      setShoeVariants([]);
      setSelectedShoeSize(null);
      setSelectedShoeColor(null);
      setShoeQuantity(1);
      return;
    }
    async function loadVariants() {
      try {
        const variantsData = await fetchProductVariants(currentShoe!.slug!);
        setShoeVariants(variantsData.data || []);
        setSelectedShoeSize(null);
        setSelectedShoeColor(null);
        setShoeQuantity(1);
      } catch (err) {
        console.error("Lỗi tải variants cho giày:", err);
        setShoeVariants([]);
      }
    }
    loadVariants();
  }, [currentShoe]);

  // Handle custom face image upload
  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFaceImage(event.target?.result as string);
        setSelectedFaceId("custom");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSampleFace = (id: string, url: string, faceGender: string) => {
    setSelectedFaceId(id);
    setFaceImage(url);
    setGender(faceGender as Gender);
  };

  // Trigger AI Model Generation Simulation (5-8 seconds)
  const handleGenerateModel = () => {
    if (!faceImage) {
      alert("Vui lòng tải lên khuôn mặt hoặc chọn khuôn mặt mẫu.");
      return;
    }

    setStep("generating");
    setGenProgress(0);

    const steps = [
      { p: 15, text: "Đang phân tích khuôn mặt của bạn..." },
      { p: 40, text: "Đang dựng vóc dáng người mẫu dựa trên phong cách..." },
      { p: 70, text: "Đang tích hợp khuôn mặt vào người mẫu AI..." },
      { p: 90, text: "Đang tối ưu hóa đổ bóng và ánh sáng trang phục..." },
      { p: 100, text: "Người mẫu của bạn đã sẵn sàng!" },
    ];

    setGenStatusText(steps[0].text);

    const interval = setInterval(() => {
      setGenProgress((prev) => {
        const next = prev + 1;
        const matchingStep = steps.find((s) => next >= s.p && prev < s.p);
        if (matchingStep) {
          setGenStatusText(matchingStep.text);
        }
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Find template matching criteria or fallback
            const matchedTemplate = MODEL_TEMPLATES.find(
              (t) => t.gender === gender && t.style === stylePreference
            ) || MODEL_TEMPLATES[0];
            setOutfitColor(matchedTemplate.defaultOutfitColor);
            setStep("workspace");
            setStyleScore(null);
            setStyleComment("");
          }, 400);
          return 100;
        }
        return next;
      });
    }, 60); // 6 seconds total
  };

  // Find active template
  const activeTemplate =
    MODEL_TEMPLATES.find((t) => t.gender === gender && t.style === stylePreference) ||
    MODEL_TEMPLATES[0];

  // AI Style Scorer Simulation
  const handleRateStyle = () => {
    if (isRating) return;
    setIsRating(true);
    setStyleScore(null);
    setStyleComment("");

    setTimeout(() => {
      setIsRating(false);
      // Random high score
      const score = Math.floor(Math.random() * 15) + 84; // 84 to 98
      setStyleScore(score);

      const comments = [
        `Phối đồ cực chất! Mẫu giày ${currentShoe?.name} kết hợp phong cách ${
          stylePreference === "formal" ? "Lịch lãm" : "Đường phố"
        } tôn lên nét thanh lịch, hiện đại. Sự hài hòa giữa tông màu của trang phục và giày tạo ấn tượng thị giác tuyệt vời.`,
        `Thần thái chuẩn người mẫu! Đôi ${currentShoe?.name} cổ điển bổ khuyết hoàn hảo cho set đồ của bạn. Sự kết hợp màu sắc mang cá tính thời thượng, thu hút mọi ánh nhìn.`,
        `Rất có phong cách! Điểm cộng lớn ở việc lựa chọn form giày thon gọn giúp tôn dáng và cân bằng kết cấu tổng thể. Thích hợp đi làm, đi chơi hay dự tiệc.`,
      ];
      setStyleComment(comments[Math.floor(Math.random() * comments.length)]);
    }, 2500);
  };

  // Helper to check if a size has stock
  const isShoeSizeAvailable = (size: string | number) => {
    if (!shoeVariants || shoeVariants.length === 0) return true;
    return shoeVariants.some((v) => {
      const sizeMatch = v.sizeLabel === String(size);
      const colorMatch = selectedShoeColor === null || v.colorName === selectedShoeColor;
      const hasStock = v.inventory && v.inventory.availableQuantity > 0;
      return sizeMatch && colorMatch && hasStock;
    });
  };

  // Helper to check if a color has stock
  const isShoeColorAvailable = (color: string) => {
    if (!shoeVariants || shoeVariants.length === 0) return true;
    return shoeVariants.some((v) => {
      const sizeMatch = selectedShoeSize === null || v.sizeLabel === String(selectedShoeSize);
      const colorMatch = v.colorName === color;
      const hasStock = v.inventory && v.inventory.availableQuantity > 0;
      return sizeMatch && colorMatch && hasStock;
    });
  };

  // Find matched variant based on size & color
  const matchedShoeVariant = shoeVariants.find((v) => {
    const sizeMatch = selectedShoeSize === null || v.sizeLabel === String(selectedShoeSize);
    const colorMatch = selectedShoeColor === null || v.colorName === selectedShoeColor;
    return sizeMatch && colorMatch;
  });

  // Auto-deselect invalid size/color combinations when they change
  useEffect(() => {
    if (selectedShoeSize !== null && selectedShoeColor !== null && shoeVariants.length > 0) {
      const match = shoeVariants.find(
        (v) => v.sizeLabel === String(selectedShoeSize) && v.colorName === selectedShoeColor
      );
      const hasStock = match?.inventory && match.inventory.availableQuantity > 0;
      if (!hasStock) {
        setSelectedShoeColor(null);
      }
    }
  }, [selectedShoeSize, shoeVariants]);

  useEffect(() => {
    if (selectedShoeSize !== null && selectedShoeColor !== null && shoeVariants.length > 0) {
      const match = shoeVariants.find(
        (v) => v.sizeLabel === String(selectedShoeSize) && v.colorName === selectedShoeColor
      );
      const hasStock = match?.inventory && match.inventory.availableQuantity > 0;
      if (!hasStock) {
        setSelectedShoeSize(null);
      }
    }
  }, [selectedShoeColor, shoeVariants]);

  // Add shoe to cart with correct variant & quantity
  const handleShoeAddToCart = async () => {
    if (!currentShoe) return;
    
    if (shoeVariants && shoeVariants.length > 0 && !selectedShoeSize) {
      alert("Vui lòng chọn size giày.");
      return;
    }
    if (shoeVariants && shoeVariants.length > 0 && currentShoe.colors && currentShoe.colors.length > 0 && !selectedShoeColor) {
      alert("Vui lòng chọn màu sắc.");
      return;
    }

    const finalVariant = matchedShoeVariant || shoeVariants[0];
    const variantId = finalVariant?.id || "";

    try {
      await addToCart(currentShoe.id, variantId, shoeQuantity);
      setSuccessToast(`Đã thêm thành công đôi "${currentShoe.name}" vào giỏ hàng!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error(err);
      alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
    }
  };

  // Quick buy shoe
  const handleShoeQuickBuy = () => {
    if (!currentShoe) return;

    if (shoeVariants && shoeVariants.length > 0 && !selectedShoeSize) {
      alert("Vui lòng chọn size giày.");
      return;
    }
    if (shoeVariants && shoeVariants.length > 0 && currentShoe.colors && currentShoe.colors.length > 0 && !selectedShoeColor) {
      alert("Vui lòng chọn màu sắc.");
      return;
    }

    const finalVariant = matchedShoeVariant || shoeVariants[0];
    const variantId = finalVariant?.id || "";
    const displayPrice = finalVariant?.salePrice || finalVariant?.price || currentShoe.salePrice || currentShoe.originalPrice || currentShoe.price || 0;

    const variantLabel = [
      finalVariant?.sizeLabel ? `Size: ${finalVariant.sizeLabel}` : "",
      finalVariant?.colorName ? `Màu: ${finalVariant.colorName}` : "",
    ]
      .filter(Boolean)
      .join(" / ");

    const thumbnailUrl =
      currentShoe.thumbnailMedia?.secureUrl ||
      currentShoe.thumbnailMedia?.url ||
      currentShoe.img ||
      "";

    const params = new URLSearchParams({
      quickBuy: "true",
      slug: currentShoe.slug || "",
      productId: currentShoe.id,
      variantId,
      quantity: String(shoeQuantity),
      name: currentShoe.name,
      price: String(displayPrice),
      image: thumbnailUrl,
      variantLabel,
    });

    router.push(`/thanh-toan?${params.toString()}`);
  };

  return (
    <>
      <Header cartCount={cartCount} />
      <div className="tryon-page-wrapper">
      {step !== "generating" && (
        <div className={`back-btn-container ${step === "upload" ? "step-upload" : "step-workspace"}`}>
          <BackButton
            onClick={() => {
              if (slug) {
                router.push(`/san-pham/${slug}`);
              } else {
                router.back();
              }
            }}
          />
        </div>
      )}

      {/* ─── STEP 1: UPLOAD FACE ─── */}
      {step === "upload" && (
        <div className="upload-container">
          <div className="title-section text-center">
            <div className="ai-badge-header">
              <Sparkles className="spark-gold" size={18} />
              <span>DUKY AI CLOSET & STYLING</span>
            </div>
            <h1 className="main-title">Phòng Thử Đồ Tương Tác & Tạo Người Mẫu AI</h1>
            <p className="subtitle">
              Chỉ cần 1 bức ảnh khuôn mặt của bạn để AI tự động dựng người mẫu 3D thử đồ, chấm điểm phong cách thời trang và đề xuất phối đồ hoàn hảo.
            </p>
          </div>

          <div className="upload-content-grid">
            {/* Left Box: Upload and Gender info */}
            <div className="upload-options-card">
              <h3 className="section-card-title">1. Tải lên khuôn mặt chính diện</h3>
              <p className="section-card-desc">
                Chụp ảnh cận cảnh khuôn mặt của bạn dưới ánh sáng rõ để có kết quả người mẫu AI ghép ảnh đẹp nhất.
              </p>

              {faceImage ? (
                <div className="uploaded-preview-container">
                  <img src={faceImage} alt="Khuôn mặt của bạn" className="face-preview-img" />
                  <button
                    className="reset-upload-btn"
                    onClick={() => {
                      setFaceImage(null);
                      setSelectedFaceId(null);
                    }}
                  >
                    Tải ảnh khác
                  </button>
                </div>
              ) : (
                <label className="face-upload-dropzone">
                  <input type="file" accept="image/*" onChange={handleFaceUpload} className="hidden-input" />
                  <Upload className="drop-icon" size={32} />
                  <span className="drop-title">Chọn ảnh chân dung hoặc Selfie</span>
                  <span className="drop-sub">Hỗ trợ PNG, JPG, WEBP</span>
                </label>
              )}

              <div className="sample-faces-block">
                <span className="sample-title">Hoặc chọn nhanh khuôn mặt mẫu:</span>
                <div className="sample-faces-grid">
                  {SAMPLE_FACES.map((face) => (
                    <button
                      key={face.id}
                      className={`sample-face-btn ${selectedFaceId === face.id ? "active-face-btn" : ""}`}
                      onClick={() => handleSelectSampleFace(face.id, face.url, face.gender)}
                    >
                      <img src={face.url} alt="Sample Face" className="sample-face-img" />
                      {selectedFaceId === face.id && (
                        <div className="face-checked-badge">
                          <Check size={10} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Box: Preferences */}
            <div className="upload-options-card">
              <h3 className="section-card-title">2. Thiết lập vóc dáng & Phong cách</h3>
              <p className="section-card-desc">
                AI sẽ dựa trên giới tính và gu ăn mặc mong muốn để thiết kế người mẫu và phối trang phục (outfit) thời thượng.
              </p>

              {/* Gender selection */}
              <div className="input-group">
                <label className="input-label">Giới tính người mẫu:</label>
                <div className="gender-toggle-row">
                  <button
                    type="button"
                    className={`gender-btn ${gender === "male" ? "active" : ""}`}
                    onClick={() => setGender("male")}
                  >
                    Nam giới (Gentlemen)
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${gender === "female" ? "active" : ""}`}
                    onClick={() => setGender("female")}
                  >
                    Nữ giới (Ladies)
                  </button>
                </div>
              </div>

              {/* Style selector */}
              <div className="input-group mt-6">
                <label className="input-label">Gu thời trang phối đồ:</label>
                <div className="styles-selector-grid">
                  {(["formal", "street", "casual", "retro"] as OutfitStyle[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      className={`style-pill-btn ${stylePreference === style ? "active" : ""}`}
                      onClick={() => setStylePreference(style)}
                    >
                      <span className="style-name">
                        {style === "formal" && "👔 Lịch Lãm Công Sở"}
                        {style === "street" && "🛹 Đường Phố Bụi Bặm"}
                        {style === "casual" && "🧥 Năng Động Hàng Ngày"}
                        {style === "retro" && "🎩 Cổ Điển Vintage"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Generate Model button */}
              <div className="mt-8">
                <button className="glow-generate-btn" onClick={handleGenerateModel}>
                  <Sparkles size={18} />
                  <span>AI DỰNG NGƯỜI MẪU NGAY</span>
                  <ArrowRight size={16} className="arrow" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 2: GENERATING MODEL LOADING ─── */}
      {step === "generating" && (
        <div className="generating-loader-container">
          <div className="hud-glass-card text-center">
            <div className="radar-scanner">
              <div className="radar-circle" />
              {faceImage && <img src={faceImage} alt="Scanning face" className="radar-face-overlay" />}
            </div>
            
            <h2 className="gen-loader-title">Đang Tạo Người Mẫu AI</h2>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${genProgress}%` }} />
            </div>
            <span className="gen-percent">{genProgress}%</span>
            <p className="gen-status-text">{genStatusText}</p>
          </div>
        </div>
      )}

      {/* ─── STEP 3: WORKSPACE & MODEL TRY-ON ─── */}
      {step === "workspace" && (
        <div className="workspace-container">
          <div className="workspace-layout-three-col">
            
            {/* ─── COLUMN 1: GIÀY (LEFT PANEL) ─── */}
            <div className="workspace-left-panel">
              <div className="panel-header">
                <h3 className="panel-title">Giày</h3>
                
                {/* Category filters */}
                <div className="category-filters-row">
                  {["all", "sneaker", "boots", "loafer"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`filter-tab-btn ${activeCategory === cat ? "active" : ""}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat === "all" && "Tất cả"}
                      {cat === "sneaker" && "Sneaker"}
                      {cat === "boots" && "Boots"}
                      {cat === "loafer" && "Loafer"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shoes List */}
              <div className="vertical-shoes-list">
                {shoeList
                  .filter((shoe) => {
                    if (activeCategory === "all") return true;
                    const slugs = (shoe as any).categorySlugs || [];
                    const categoryName = (shoe.category || "").toLowerCase();
                    const name = shoe.name.toLowerCase();
                    let shoeCat = "loafer";
                    if (slugs.includes("sneaker") || categoryName.includes("sneaker") || name.includes("sneaker")) {
                      shoeCat = "sneaker";
                    } else if (slugs.includes("boot") || categoryName.includes("boot") || name.includes("boot")) {
                      shoeCat = "boots";
                    }
                    return shoeCat === activeCategory;
                  })
                  .map((shoe) => {
                    const isSelected = currentShoe?.id === shoe.id;
                    const shoePrice = shoe.salePrice || shoe.originalPrice || shoe.price || 0;
                    return (
                      <button
                        key={shoe.id}
                        type="button"
                        className={`shoe-vertical-card ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setCurrentShoe(shoe);
                          setStyleScore(null); // Reset score
                        }}
                      >
                        <div className="card-thumb-frame">
                          <img src={shoe.thumbnailMedia?.url || shoe.img || ""} alt={shoe.name} />
                        </div>
                        <div className="card-info-box">
                          <span className="card-shoe-name">{shoe.name}</span>
                          <span className="card-shoe-price">{formatCurrency(shoePrice)}</span>
                        </div>
                        {isSelected && (
                          <div className="card-selected-badge">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>

              <button 
                type="button" 
                className="view-all-shoes-btn"
                onClick={() => setActiveCategory("all")}
              >
                <span>Xem tất cả giày</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* ─── COLUMN 2: AI MODEL CANVAS (MIDDLE PANEL) ─── */}
            <div className="workspace-middle-panel">
              <div className="workspace-card">
                <div className="workspace-card-header">
                  <span className="badge-pulse-green">AI MODEL TƯƠNG TÁC</span>
                  <button className="change-model-btn" onClick={() => setStep("upload")}>
                    <RefreshCw size={12} />
                    <span>Đổi người mẫu</span>
                  </button>
                </div>

                <div className="model-canvas-frame">
                  {/* Template body */}
                  <img
                    src={activeTemplate.bodyUrl}
                    alt="AI Model Body"
                    className="model-body-img"
                    draggable={false}
                  />

                  {/* Face overlay */}
                  {faceImage && (
                    <div
                      className="face-overlay-wrapper"
                      style={{
                        left: `${activeTemplate.faceX}%`,
                        top: `${activeTemplate.faceY}%`,
                        width: `${activeTemplate.faceWidth}%`,
                        height: `${activeTemplate.faceHeight}%`,
                      }}
                    >
                      <img src={faceImage} alt="User Face" className="user-face-overlay" />
                    </div>
                  )}

                  {/* Shoe overlay Left */}
                  {currentShoe && (
                    <div
                      className="shoe-model-overlay left"
                      style={{
                        left: `${activeTemplate.leftShoe.x}%`,
                        top: `${activeTemplate.leftShoe.y}%`,
                        transform: `translate(-50%, -50%) rotate(${activeTemplate.leftShoe.rotation}deg) scale(${activeTemplate.leftShoe.scale})`,
                      }}
                    >
                      <img src={currentShoe.thumbnailMedia?.url || currentShoe.img || ""} alt="Left Shoe" />
                    </div>
                  )}

                  {/* Shoe overlay Right */}
                  {currentShoe && (
                    <div
                      className="shoe-model-overlay right"
                      style={{
                        left: `${activeTemplate.rightShoe.x}%`,
                        top: `${activeTemplate.rightShoe.y}%`,
                        transform: `translate(-50%, -50%) rotate(${activeTemplate.rightShoe.rotation}deg) scaleX(-1) scale(${activeTemplate.rightShoe.scale})`,
                      }}
                    >
                      <img src={currentShoe.thumbnailMedia?.url || currentShoe.img || ""} alt="Right Shoe" />
                    </div>
                  )}

                  {/* Overlay color tint on clothing */}
                  <div
                    className="clothing-tint-overlay"
                    style={{
                      backgroundColor: outfitColor,
                      mixBlendMode: "hue",
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      opacity: 0.35,
                    }}
                  />
                  
                  {/* Shadow overlays under feet */}
                  <div className="foot-shadow left" style={{ left: `${activeTemplate.leftShoe.x}%`, top: `${activeTemplate.leftShoe.y}%` }} />
                  <div className="foot-shadow right" style={{ left: `${activeTemplate.rightShoe.x}%`, top: `${activeTemplate.rightShoe.y}%` }} />
                </div>
              </div>
            </div>

            {/* ─── COLUMN 3: SELECTED SHOE DETAIL (RIGHT PANEL) ─── */}
            {currentShoe ? (
              <div className="workspace-right-panel">
                <div className="info-details">

                  {/* Product Header: Thumbnail + Name + Sold Count */}
                  <div className="info-product-header">
                    {/* Thumbnail */}
                    <div className="info-thumb-wrap">
                      <img
                        src={
                          currentShoe.thumbnailMedia?.secureUrl ||
                          currentShoe.thumbnailMedia?.url ||
                          currentShoe.img ||
                          ""
                        }
                        alt={currentShoe.name}
                        className="info-thumb-img"
                      />
                    </div>

                    {/* Name + Sold Count */}
                    <div className="info-name-meta">
                      <h2 className="info-product-name">{currentShoe.name}</h2>
                      <div className="info-meta">
                        <div className="info-sold">
                          <Clock size={14} />
                          <span>Đã bán {currentShoe.soldCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  {(() => {
                    const displayPrice = matchedShoeVariant?.salePrice || matchedShoeVariant?.price || currentShoe.salePrice || currentShoe.originalPrice || currentShoe.price || 0;
                    const originalPrice = matchedShoeVariant?.price || currentShoe.originalPrice || 0;
                    return (
                      <div className="info-price-block">
                        <span className="info-price">
                          {displayPrice.toLocaleString('vi-VN')} ₫
                        </span>
                        {originalPrice > displayPrice && (
                          <>
                            <span className="info-original-price">{originalPrice.toLocaleString('vi-VN')} ₫</span>
                            <span className="info-discount-badge">-{Math.round((1 - displayPrice / originalPrice) * 100)}%</span>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* Short Description */}
                  {currentShoe.shortDescription ? (
                    <div 
                      className="info-short-desc html-content"
                      dangerouslySetInnerHTML={{ __html: currentShoe.shortDescription }}
                    />
                  ) : (
                    <div className="info-short-desc">
                      Giày da nam cao cấp với thiết kế thanh lịch, form đẹp và dễ phối đồ. Chất liệu bền đẹp, đế chắc chắn cùng kiểu dáng hiện đại phù hợp đi làm, đi chơi và sử dụng hằng ngày.
                    </div>
                  )}

                  {/* Separator */}
                  <div className="info-separator" />

                  {/* Size & Color Selectors */}
                  <div className="info-variant-selectors">
                    
                    {/* Size Selector */}
                    {(() => {
                      const sizes = shoeVariants
                        .filter((v) => v.sizeLabel)
                        .map((v) => v.sizeLabel as string)
                        .filter((sz, idx, arr) => arr.indexOf(sz) === idx)
                        .sort((a, b) => Number(a) - Number(b));
                      
                      const displaySizes = sizes.length > 0 ? sizes : (currentShoe.sizes || [38, 39, 40, 41, 42, 43, 44]);
                      return (
                        <div className="info-variant-group">
                          <span className="selector-label">
                            Chọn size: {selectedShoeSize && <span className="selected-value">{selectedShoeSize}</span>}
                          </span>
                          <div className="variant-buttons">
                            {displaySizes.map((size) => {
                              const available = isShoeSizeAvailable(size);
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  className={`variant-btn-circle ${selectedShoeSize === String(size) ? 'variant-btn-active' : ''}`}
                                  onClick={() => setSelectedShoeSize(selectedShoeSize === String(size) ? null : String(size))}
                                  disabled={!available}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Color Selector */}
                    {(() => {
                      const colors = shoeVariants
                        .filter((v) => v.colorName)
                        .map((v) => v.colorName as string)
                        .filter((c, idx, arr) => arr.indexOf(c) === idx);
                      
                      const displayColors = colors.length > 0 ? colors : (currentShoe.colors || ["Đen"]);
                      if (displayColors.length === 0) return null;
                      return (
                        <div className="info-variant-group">
                          <span className="selector-label">
                            Màu: {selectedShoeColor && <span className="selected-value">{selectedShoeColor}</span>}
                          </span>
                          <div className="variant-buttons">
                            {displayColors.map((color) => {
                              const available = isShoeColorAvailable(color);
                              return (
                                <button
                                  key={color}
                                  type="button"
                                  className={`variant-btn-pill ${selectedShoeColor === color ? 'variant-btn-active' : ''}`}
                                  onClick={() => setSelectedShoeColor(selectedShoeColor === color ? null : color)}
                                  disabled={!available}
                                >
                                  {color}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Quantity & Stock Status */}
                  {(() => {
                    const availableQuantity = matchedShoeVariant?.inventory?.availableQuantity ?? currentShoe.stockSummary?.availableQuantity ?? currentShoe.inventory?.quantity ?? null;
                    return (
                      <div className="info-actions-row">
                        <div className="quantity-selector">
                          <button className="qty-btn" onClick={() => setShoeQuantity(prev => Math.max(1, prev - 1))} aria-label="Giảm số lượng">
                            <Minus size={16} />
                          </button>
                          <span className="qty-value">{shoeQuantity}</span>
                          <button className="qty-btn" onClick={() => setShoeQuantity(prev => prev + 1)} aria-label="Tăng số lượng">
                            <Plus size={16} />
                          </button>
                        </div>
                        {availableQuantity !== null && (
                          <span className="info-stock-label">
                            Có sẵn: <strong>{availableQuantity}</strong> sản phẩm
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  {/* Action Buttons */}
                  {(() => {
                    const availableQuantity = matchedShoeVariant?.inventory?.availableQuantity ?? currentShoe.stockSummary?.availableQuantity ?? currentShoe.inventory?.quantity ?? 1;
                    const isOutOfStock = availableQuantity === 0 || currentShoe.inventory?.soldOut || currentShoe.stockSummary?.soldOut;
                    return (
                      <div className="info-actions-secondary">
                        <button className="btn-quick-buy" onClick={handleShoeQuickBuy} disabled={isOutOfStock}>
                          <CreditCard size={18} className="flex-shrink-0" />
                          <span>THANH TOÁN NHANH</span>
                        </button>
                        <button className="btn-add-cart" onClick={handleShoeAddToCart} disabled={isOutOfStock}>
                          <ShoppingCart size={18} className="flex-shrink-0" />
                          <span>THÊM VÀO GIỎ HÀNG</span>
                        </button>
                      </div>
                    );
                  })()}



                </div>
              </div>
            ) : (
              <div className="workspace-right-panel">
                <p className="text-center text-muted">Vui lòng chọn giày để thử</p>
              </div>
            )}
          </div>

          {/* ─── INSIGHTS GRID & CROSS-SELL SECTION (BOTTOM SECTION) ─── */}
          <div className="workspace-insights-grid">
            
            {/* CARD 1: KẾT QUẢ THỬ ĐỒ */}
            <div className="insight-card tryon-summary-card">
              <h3 className="insight-title">Kết quả thử đồ</h3>
              <div className="insight-content-flex">
                <div className="mini-model-preview">
                  <img src={activeTemplate.bodyUrl} alt="Model preview" />
                  {faceImage && <img src={faceImage} alt="Face preview" className="mini-face-overlay" />}
                </div>
                
                <div className="summary-details">
                  <span className="summary-label">Tổng quan outfit</span>
                  <div className="score-row">
                    <span className="big-score">90</span>
                    <span className="score-slash">/100</span>
                    <span className="score-text-label">Rất phong cách!</span>
                  </div>
                  
                  <div className="score-progress-bar">
                    <div className="progress-fill" style={{ width: "90%" }} />
                  </div>

                  <ul className="summary-checklist">
                    <li>
                      <CheckCircle size={14} className="check-icon-green" />
                      <span>Phối màu hài hòa</span>
                    </li>
                    <li>
                      <CheckCircle size={14} className="check-icon-green" />
                      <span>Phù hợp với dáng người</span>
                    </li>
                    <li>
                      <CheckCircle size={14} className="check-icon-green" />
                      <span>Xu hướng hiện đại</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CARD 2: ĐÁNH GIÁ CHI TIẾT */}
            <div className="insight-card detailed-stars-card">
              <h3 className="insight-title">Đánh giá chi tiết</h3>
              
              <div className="ratings-stars-list">
                {[
                  { label: "Phong cách", stars: 5 },
                  { label: "Màu sắc", stars: 5 },
                  { label: "Tính ứng dụng", stars: 5 },
                  { label: "Sự hài hòa tổng thể", stars: 5 },
                ].map((item) => (
                  <div key={item.label} className="rating-star-row">
                    <span className="row-label">{item.label}</span>
                    <div className="row-stars">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={14}
                          className={idx < item.stars ? "star-filled" : "star-empty"}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 3: GỢI Ý MUA SẮM CHO BẠN */}
            <div className="insight-card cross-sell-card">
              <div className="cross-sell-header">
                <h3 className="insight-title">Gợi ý mua sắm cho bạn</h3>
                <button type="button" className="view-all-link" onClick={() => setActiveCategory("all")}>Xem tất cả</button>
              </div>

              <div className="horizontal-suggestions-list">
                {[
                  { name: "Quần âu slim-fit", price: 890000, img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=200" },
                  { name: "Túi đeo chéo da", price: 690000, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=200" },
                  { name: "Kính râm thời trang", price: 390000, img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=200" },
                  { name: "Giày loafer đen", price: 1190000, img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=200" },
                ].map((item, idx) => (
                  <div key={idx} className="suggestion-item-card">
                    <div className="item-img-box">
                      <img src={item.img} alt={item.name} />
                    </div>
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="toast-success-banner">
          <CheckCircle className="toast-icon" size={16} />
          <span>{successToast}</span>
        </div>
      )}

      <style jsx>{`
        .tryon-page-wrapper {
          min-height: 80vh;
          max-width: 1440px;
          margin: 32px auto 0;
          padding: 0 2rem 80px;
          font-family: var(--font-main), system-ui, sans-serif;
        }

        .back-btn-container {
          margin-bottom: 20px;
          display: flex;
          width: 100%;
        }
        .back-btn-container.step-upload {
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
        }
        .back-btn-container.step-workspace {
          max-width: 1350px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ─── Title Section ─── */
        .title-section {
          margin-bottom: 40px;
        }
        .ai-badge-header {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(212, 175, 55, 0.12);
          color: #f3d980;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          border: 0.5px solid rgba(212, 175, 55, 0.25);
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }
        .spark-gold {
          color: #f3d980;
        }
        .main-title {
          font-family: var(--font-accent);
          font-size: 32px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
          margin: 0 0 10px 0;
        }
        .subtitle {
          font-size: 15px;
          color: var(--text-muted);
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* ─── Step 1: Upload Layout ─── */
        .upload-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .upload-options-card {
          background: #ffffff;
          border: 1px solid var(--border-subtle, #eaeaea);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
        }
        .section-card-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 8px 0;
        }
        .section-card-desc {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0 0 24px 0;
        }

        .face-upload-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 160px;
          border: 2px dashed #ccc;
          border-radius: 16px;
          cursor: pointer;
          background: #fafafa;
          transition: background 0.2s, border-color 0.2s;
        }
        .face-upload-dropzone:hover {
          background: #f4f4f4;
          border-color: var(--accent-black);
        }
        .hidden-input {
          display: none;
        }
        .drop-icon {
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .drop-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 4px;
        }
        .drop-sub {
          font-size: 11px;
          color: var(--text-muted);
        }

        .uploaded-preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .face-preview-img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid var(--accent-black);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .reset-upload-btn {
          background: transparent;
          border: none;
          color: #c53030;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .sample-faces-block {
          margin-top: 24px;
        }
        .sample-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-main);
          display: block;
          margin-bottom: 10px;
        }
        .sample-faces-grid {
          display: flex;
          gap: 12px;
        }
        .sample-face-btn {
          position: relative;
          background: none;
          border: 2px solid transparent;
          padding: 0;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s, border-color 0.2s;
        }
        .sample-face-btn:hover {
          transform: scale(1.05);
        }
        .active-face-btn {
          border-color: var(--accent-black);
          transform: scale(1.05);
        }
        .sample-face-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .face-checked-badge {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .input-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
        }
        .gender-toggle-row {
          display: flex;
          gap: 12px;
        }
        .gender-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid var(--border-subtle);
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .gender-btn:hover {
          border-color: #999;
          color: var(--text-main);
        }
        .gender-btn.active {
          background: var(--accent-black);
          color: #fff;
          border-color: var(--accent-black);
        }

        .styles-selector-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .style-pill-btn {
          padding: 14px 10px;
          border-radius: 12px;
          border: 1px solid var(--border-subtle);
          background: #fff;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .style-pill-btn:hover {
          background: #fafafa;
          border-color: #999;
        }
        .style-pill-btn.active {
          background: #f7fafc;
          border-color: var(--accent-black);
          box-shadow: 0 0 0 1px var(--accent-black);
        }

        .glow-generate-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--accent-black);
          color: #fff;
          border: none;
          padding: 16px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          transition: background 0.2s, transform 0.2s;
        }
        .glow-generate-btn:hover {
          background: #1e1e24;
          transform: translateY(-1px);
        }
        .glow-generate-btn .arrow {
          transition: transform 0.2s;
        }
        .glow-generate-btn:hover .arrow {
          transform: translateX(4px);
        }

        /* ─── Step 2: Loader ─── */
        .generating-loader-container {
          height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hud-glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 24px;
          padding: 40px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
        }
        .radar-scanner {
          position: relative;
          width: 90px;
          height: 90px;
          margin: 0 auto 24px;
        }
        .radar-circle {
          position: absolute;
          inset: -4px;
          border: 2px solid #38bdf8;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1.2s linear infinite;
        }
        .radar-face-overlay {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        .gen-loader-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 12px;
        }
        .progress-bar-track {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .progress-bar-fill {
          height: 100%;
          background: #38bdf8;
          transition: width 0.1s linear;
        }
        .gen-percent {
          font-size: 14px;
          font-weight: 700;
          color: #38bdf8;
          display: block;
          margin-bottom: 8px;
        }
        .gen-status-text {
          font-size: 12px;
          color: var(--text-muted);
        }

        /* ─── Step 3: Three-Column Workspace Layout ─── */
        .workspace-layout-three-col {
          display: grid;
          grid-template-columns: 320px 1fr 460px;
          gap: 24px;
          align-items: start;
          max-width: 1350px;
          margin: 0 auto;
        }

        /* COLUMN 1: LEFT PANEL (SHOE SELECTION) */
        .workspace-left-panel {
          background: #ffffff;
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .workspace-left-panel .panel-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .workspace-left-panel .panel-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
        }
        .category-filters-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .filter-tab-btn {
          font-family: var(--font-main);
          font-size: 11px;
          font-weight: 600;
          color: #4b5563;
          background: #f3f4f6;
          border: none;
          padding: 6px 12px;
          border-radius: 99px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-tab-btn:hover {
          background: #e5e7eb;
          color: #000;
        }
        .filter-tab-btn.active {
          background: #000000;
          color: #ffffff;
        }
        .vertical-shoes-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .vertical-shoes-list::-webkit-scrollbar {
          width: 4px;
        }
        .vertical-shoes-list::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 99px;
        }
        .shoe-vertical-card {
          position: relative;
          background: #ffffff;
          border: 1.5px solid #f3f4f6;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }
        .shoe-vertical-card:hover {
          border-color: #d1d5db;
        }
        .shoe-vertical-card.selected {
          border-color: #000000;
          background: #fafafa;
        }
        .card-thumb-frame {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          background: #fafafa;
          flex-shrink: 0;
        }
        .card-thumb-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .card-info-box {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-grow: 1;
        }
        .card-shoe-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.4;
        }
        .card-shoe-price {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .card-selected-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          background: #000000;
          color: #ffffff;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .view-all-shoes-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          border: 1px solid #d1d5db;
          color: var(--text-main);
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 700;
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        .view-all-shoes-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        /* COLUMN 2: MIDDLE PANEL (MODEL INTERACTIVE CANVAS) */
        .workspace-middle-panel {
          min-width: 0;
          width: 100%;
        }
        .workspace-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid var(--border-subtle);
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }
        .workspace-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid #f5f5f5;
          background: #fafafa;
        }
        .badge-pulse-green {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #2e7d32;
        }
        .badge-pulse-green::before {
          content: '';
          width: 8px;
          height: 8px;
          background: #4caf50;
          border-radius: 50%;
          animation: pulseGreen 1.6s infinite;
        }
        @keyframes pulseGreen {
          0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
          100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
        }
        .change-model-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .change-model-btn:hover {
          color: var(--text-main);
        }
        .model-canvas-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #f4f4f5;
        }
        .model-body-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }
        .face-overlay-wrapper {
          position: absolute;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid #ffffff;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .user-face-overlay {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .shoe-model-overlay {
          position: absolute;
          width: 150px;
          z-index: 5;
          pointer-events: none;
        }
        .shoe-model-overlay img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.18));
        }
        .foot-shadow {
          position: absolute;
          width: 60px;
          height: 15px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          z-index: 4;
          pointer-events: none;
        }

        /* COLUMN 3: RIGHT PANEL (SELECTED SHOE PRODUCT DETAIL) */
        .workspace-right-panel {
          background: #ffffff;
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }
        .info-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .info-product-name {
          font-family: var(--font-accent), serif, system-ui;
          font-size: 20px; /* slightly smaller for column layout */
          font-weight: 700;
          color: #111111;
          line-height: 1.3;
          margin: 0;
        }
        /* Product header: thumbnail left + name/meta right */
        .info-product-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .info-thumb-wrap {
          flex-shrink: 0;
          width: 72px;
          height: 72px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          background: #f9f9f9;
        }
        .info-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .info-name-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 0;
        }
        .info-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-main);
          font-size: 13px;
        }
        .info-sold {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #888888;
        }
        .info-sold :global(svg) {
          color: #888888;
        }
        .info-price-block {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-top: 2px;
        }
        .info-price {
          font-family: var(--font-main);
          font-size: 24px;
          font-weight: 800;
          color: #111111;
        }
        .info-original-price {
          font-family: var(--font-main);
          font-size: 14px;
          color: #999999;
          text-decoration: line-through;
        }
        .info-discount-badge {
          font-family: var(--font-main);
          font-size: 11px;
          font-weight: 700;
          color: #dc2626;
          background: #fee2e2;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .info-short-desc {
          font-family: var(--font-main);
          font-size: 13px;
          color: #666666;
          line-height: 1.5;
        }
        .info-separator {
          height: 1px;
          background: #eaeaea;
          margin: 4px 0;
        }
        .info-variant-selectors {
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: flex-start;
          width: 100%;
        }
        .info-variant-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
          width: 100%;
        }
        .selector-label {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 500;
          color: #555555;
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .selected-value {
          color: #111111;
          font-weight: 600;
        }
        .variant-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
        }
        .variant-btn-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #111111;
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }
        .variant-btn-circle:hover {
          border-color: #111111;
          background: #f9fafb;
        }
        .variant-btn-circle.variant-btn-active {
          background: #111111;
          color: #ffffff;
          border-color: #111111;
          font-weight: 700;
        }
        .variant-btn-circle:disabled {
          background: #fcfcfc;
          border-color: #f3f3f3;
          color: #dddddd;
          cursor: not-allowed;
          pointer-events: none;
        }
        .variant-btn-pill {
          padding: 8px 16px;
          border-radius: 99px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #111111;
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .variant-btn-pill:hover {
          border-color: #111111;
          background: #f9fafb;
        }
        .variant-btn-pill.variant-btn-active {
          background: #111111;
          color: #ffffff;
          border-color: #111111;
          font-weight: 700;
        }
        .variant-btn-pill:disabled {
          background: #fcfcfc;
          border-color: #f3f3f3;
          color: #dddddd;
          cursor: not-allowed;
          pointer-events: none;
        }
        .info-actions-row {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }
        .info-stock-label {
          font-family: var(--font-main);
          font-size: 13px;
          color: #6b7280;
        }
        .info-stock-label strong {
          color: #111111;
          font-weight: 700;
        }
        .quantity-selector {
          display: flex;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 99px;
          overflow: hidden;
          background: #ffffff;
          height: 38px;
        }
        .qty-btn {
          width: 36px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #111111;
          transition: background 0.2s ease;
        }
        .qty-btn:hover {
          background: #f3f4f6;
        }
        .qty-value {
          width: 36px;
          text-align: center;
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 600;
          color: #111111;
        }
        .info-actions-secondary {
          display: flex;
          gap: 12px;
          width: 100%;
        }
        .btn-quick-buy {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 16px;
          background: #000000;
          color: #ffffff;
          border: 1px solid #000000;
          border-radius: 99px;
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-quick-buy:hover {
          background: #1f1f23;
          border-color: #1f1f23;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .btn-quick-buy:disabled {
          background-color: #8e8e93;
          border-color: #8e8e93;
          color: #ffffff;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
          opacity: 0.85;
        }
        .btn-quick-buy:disabled:hover {
          cursor: not-allowed;
          background-color: #8e8e93;
          transform: none !important;
          box-shadow: none !important;
        }
        .btn-add-cart {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 16px;
          background: #ffffff;
          color: #000000;
          border: 1px solid #000000;
          border-radius: 99px;
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-add-cart:hover {
          background: #f9fafb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .btn-add-cart:disabled {
          background-color: #ffffff;
          border-color: #d1d5db;
          color: #9ca3af;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
          opacity: 0.85;
        }
        .btn-add-cart:disabled:hover {
          cursor: not-allowed;
          background-color: #ffffff;
          transform: none !important;
          box-shadow: none !important;
        }
        .btn-quick-buy :global(svg),
        .btn-add-cart :global(svg) {
          flex-shrink: 0;
        }
        .combo-selector-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }
        .combo-colors-palette {
          display: flex;
          gap: 8px;
        }
        .combo-color-btn {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 1px solid rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .combo-color-btn:hover {
          transform: scale(1.05);
        }
        .combo-color-btn.active {
          transform: scale(1.05);
          box-shadow: 0 0 0 1.5px #ffffff, 0 0 0 3px #000000;
        }
        .combo-accordions-list {
          border-top: 1px solid #f3f4f6;
          padding-top: 12px;
          display: flex;
          flex-direction: column;
        }
        .accordion-item {
          border-bottom: 1px solid #f3f4f6;
        }
        .accordion-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          border: none;
          padding: 12px 0;
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
          cursor: pointer;
        }
        .accordion-header .arrow {
          transition: transform 0.2s ease;
          font-size: 10px;
        }
        .accordion-header .arrow.open {
          transform: rotate(180deg);
        }
        .accordion-content {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.6;
          padding: 0 0 12px 0;
        }

        /* ─── BOTTOM SECTION: INSIGHTS GRID ─── */
        .workspace-insights-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr 1.3fr;
          gap: 24px;
          margin-top: 24px;
          max-width: 1350px;
          margin-left: auto;
          margin-right: auto;
        }
        .insight-card {
          background: #ffffff;
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }
        .insight-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 16px 0;
        }
        .insight-content-flex {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .mini-model-preview {
          position: relative;
          width: 70px;
          aspect-ratio: 4/5;
          border-radius: 8px;
          overflow: hidden;
          background: #f3f4f6;
          flex-shrink: 0;
        }
        .mini-model-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .mini-face-overlay {
          position: absolute;
          left: 50%;
          top: 14%;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          border: 0.5px solid #fff;
        }
        .summary-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex-grow: 1;
        }
        .summary-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .score-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .big-score {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1;
        }
        .score-slash {
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .score-text-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-main);
          margin-left: 6px;
        }
        .score-progress-bar {
          width: 100%;
          height: 4px;
          background: #f3f4f6;
          border-radius: 99px;
          overflow: hidden;
          margin: 6px 0;
        }
        .score-progress-bar .progress-fill {
          height: 100%;
          background: #10b981;
          border-radius: 99px;
        }
        .summary-checklist {
          list-style: none;
          padding: 0;
          margin: 6px 0 0 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .summary-checklist li {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-main);
        }
        .check-icon-green {
          color: #10b981;
        }

        /* CARD 2: DETAILED STAR RATINGS */
        .ratings-stars-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rating-star-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-main);
        }
        .row-stars {
          display: flex;
          gap: 4px;
        }

        /* CARD 3: CROSS-SELL RECOMMENDED PRODUCTS */
        .cross-sell-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .cross-sell-header .insight-title {
          margin-bottom: 0;
        }
        .view-all-link {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          text-decoration: underline;
        }
        .horizontal-suggestions-list {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .horizontal-suggestions-list::-webkit-scrollbar {
          height: 4px;
        }
        .horizontal-suggestions-list::-webkit-scrollbar-thumb {
          background: #f3f4f6;
          border-radius: 99px;
        }
        .suggestion-item-card {
          width: 80px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .item-img-box {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          background: #fafafa;
          border: 1px solid #f3f4f6;
        }
        .item-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .suggestion-item-card .item-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .item-name {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .item-price {
          font-size: 9px;
          font-weight: 600;
          color: var(--text-muted);
        }

        /* ─── Success Toast ─── */
        .toast-success-banner {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: #10b981;
          color: #fff;
          padding: 14px 24px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
          z-index: 999;
          font-size: 13px;
          font-weight: 700;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .back-btn-container.step-upload {
            max-width: 500px;
          }
          .workspace-layout-three-col {
            grid-template-columns: 1fr;
          }
          .workspace-insights-grid {
            grid-template-columns: 1fr;
          }
          .workspace-left-panel,
          .workspace-right-panel {
            max-width: 500px;
            margin: 0 auto;
            width: 100%;
          }
          .workspace-visual-col {
            max-width: 500px;
            margin: 0 auto;
            width: 100%;
          }
          .upload-content-grid {
            grid-template-columns: 1fr;
            max-width: 500px;
          }
        }
      `}</style>
      </div>
      <Footer />
    </>
  );
}

// Simple fallback helper component
function InfoIcon({ size = 16 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
