"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Package,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchTool } from "@/components/shop/SeachTool";
import { PopupTemplate } from "@/components/shop/PopupTemplate";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";

interface AvatarProps {
  fullName: string;
  avatarUrl?: string | null;
  size: "desktop" | "mobile";
}

function Avatar({ fullName, avatarUrl, size }: AvatarProps) {
  const [showFallback, setShowFallback] = useState(!avatarUrl);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const dimension = size === "desktop" ? 32 : 28;
  const fontSize = size === "desktop" ? "text-sm" : "text-xs";

  useEffect(() => {
    if (!avatarUrl) {
      setShowFallback(true);
      return;
    }

    setShowFallback(false);

    // 3-second timeout for image load
    timeoutRef.current = setTimeout(() => {
      setShowFallback(true);
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [avatarUrl]);

  const handleImageLoad = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowFallback(false);
  }, []);

  const handleImageError = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowFallback(true);
  }, []);

  const initial = fullName ? fullName.charAt(0).toUpperCase() : "?";

  if (showFallback || !avatarUrl) {
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold select-none",
          fontSize,
        )}
        style={{
          width: dimension,
          height: dimension,
          backgroundColor: "#e5e7eb",
          color: "#374151",
        }}
        role="img"
        aria-label={fullName}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={fullName}
      width={dimension}
      height={dimension}
      onLoad={handleImageLoad}
      onError={handleImageError}
      className="rounded-full object-cover"
      style={{ width: dimension, height: dimension }}
    />
  );
}

interface HeaderProps {
  cartCount: number;
  onCartClick?: () => void;
}

export const Header = ({ cartCount }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { products: searchProducts, loading: isSearchLoading } = useProducts(
    { limit: 20 },
    { enabled: true },
  );
  const { isAuthenticated, customer, logout } = useAuth();

  // Close account menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    }
    if (isAccountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAccountMenuOpen]);

  const handleLogout = async () => {
    setIsAccountMenuOpen(false);
    await logout();
  };

  const popularSearches = [
    "Boot cổ thấp",
    "Boot cổ cao",
    "Boot đế chunky",
    "Chelsea boot",
    "Phụ kiện",
    "Unisex nữ",
  ];

  const navItems = [
    { name: "Boot Nam", href: "/boot-nam" },
    { name: "Boot Nữ", href: "/boot-nu" },
    { name: "Phụ kiện", href: "/phu-kien" },
    { name: "Unisex", href: "/unisex" },
    { name: "Phối đồ", href: "/thu-vien" },
    { name: "Kinh nghiệm", href: "/blog" },
    { name: "Liên hệ", href: "/lien-he" },
  ];

  return (
    <header className="fixed top-1 left-0 right-0 z-50 px-6 md:px-10">
      <div
        className={cn(
          "max-w-[1440px] mx-auto glass-effect rounded-full shadow-2xl transition-all duration-500 flex items-center justify-between px-6 md:px-10 py-2 md:py-4 bg-white/70 backdrop-blur-lg !overflow-visible relative",
        )}
      >
        {/* Logo - Left */}
        <div className="flex-1 flex justify-start items-center">
          <Link
            href="/"
            className="flex items-center gap-1 cursor-pointer group"
          >
            <div className="relative w-10 h-10 md:w-14 md:h-14">
              <Image
                src="/assets/logo_header.webp"
                alt="Duky Store Logo"
                fill
                priority
                sizes="(max-width: 768px) 40px, 56px"
                className="object-contain"
              />
            </div>
            <span className="hidden sm:block text-xl md:text-xl font-black tracking-tighter text-text-main uppercase font-sans">
              DUKY STORE
            </span>
          </Link>
        </div>

        {/* Desktop Nav - Absolutely Centered */}
        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 xl:gap-12 text-[14px] xl:text-[15px] font-medium text-text-main">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-gray-800 hover:text-black hover:scale-110 font-semibold transition-all duration-100 relative group whitespace-nowrap cursor-pointer"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions & Hotline - Right */}
        <div className="flex-1 flex justify-end items-center gap-4 md:gap-6 lg:gap-8">
          {/* Action Icons */}
          <div className="flex items-center gap-6 md:gap-6">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-text-main hover:scale-110 transition-transform cursor-pointer"
            >
              <Search size={22} strokeWidth={2} />
            </button>
            {isAuthenticated && customer ? (
              <div className="relative hidden sm:block" ref={accountMenuRef}>
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="hover:scale-110 transition-transform cursor-pointer"
                >
                  <Avatar fullName={customer.fullName} size="desktop" />
                </button>

                {/* Account Dropdown Menu */}
                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200/60 z-50"
                    >
                      {/* Part 1: User Info */}
                      <div className="px-4 py-4 bg-gray-50/60 rounded-t-2xl">
                        <p className="font-semibold text-[15px] text-gray-900 truncate">
                          {customer.fullName}
                        </p>
                        <p className="text-[13px] text-gray-400 mt-0.5">
                          Thành viên
                        </p>
                      </div>

                      {/* Part 2: Navigation */}
                      <div className="py-2 px-3 border-t border-gray-100">
                        <Link
                          href="/tai-khoan"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-4 px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-100 hover:text-black rounded-lg transition-all duration-200"
                        >
                          <User
                            size={18}
                            strokeWidth={1.4}
                            className="text-gray-400"
                          />
                          <span>Tài khoản của tôi</span>
                        </Link>
                        <Link
                          href="/tai-khoan/don-hang"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-4 px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-100 hover:text-black rounded-lg transition-all duration-200"
                        >
                          <Package
                            size={18}
                            strokeWidth={1.4}
                            className="text-gray-400"
                          />
                          <span>Đơn hàng</span>
                        </Link>
                        <Link
                          href="/tai-khoan/dia-chi"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-4 px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-100 hover:text-black rounded-lg transition-all duration-200"
                        >
                          <MapPin
                            size={18}
                            strokeWidth={1.4}
                            className="text-gray-400"
                          />
                          <span>Địa chỉ</span>
                        </Link>
                        <Link
                          href="/tai-khoan/cai-dat"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-4 px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-100 hover:text-black rounded-lg transition-all duration-200"
                        >
                          <Settings
                            size={18}
                            strokeWidth={1.4}
                            className="text-gray-400"
                          />
                          <span>Cài đặt</span>
                        </Link>
                      </div>

                      {/* Part 3: Logout */}
                      <div className="border-t border-gray-100 py-2 px-3">
                        <button
                          onClick={handleLogout}
                          className="group flex items-center gap-4 px-4 py-2 text-[14px] text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 w-full text-left cursor-pointer"
                        >
                          <LogOut
                            size={18}
                            strokeWidth={1.4}
                            className="text-gray-400 group-hover:text-red-500"
                          />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/dang-nhap"
                className="text-text-main hover:scale-110 transition-transform hidden sm:block cursor-pointer"
              >
                <User size={22} strokeWidth={2} />
              </Link>
            )}
            <Link
              href="/gio-hang"
              className="text-text-main hover:scale-110 transition-transform relative cursor-pointer"
            >
              <ShoppingBag size={22} strokeWidth={2} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={cartCount}
                    className="absolute -top-2 -right-2 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-lg"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {/* Vertical Separator */}
          <div className="hidden xl:block w-px h-6 bg-black/10" />

          {/* Hotline */}
          <button
            onClick={() => setIsContactOpen(true)}
            className="hidden xl:flex items-center gap-2 text-text-main hover:text-accent-gold transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
              <Phone size={14} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-medium tracking-wider">
              Hotline / Zalo
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-1 text-text-main"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-full left-6 right-6 mt-4 glass-effect p-8 rounded-[2.5rem] flex flex-col gap-6 text-center shadow-2xl z-50 border-white/40"
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 text-xs font-bold tracking-[0.2em] uppercase text-text-main hover:text-accent-gold transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-border-subtle flex justify-center gap-8 items-center">
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="text-text-main cursor-pointer"
                  aria-label="Tìm kiếm"
                >
                  <Search size={22} className="text-text-main" />
                </button>
                {isAuthenticated && customer ? (
                  <Link href="/tai-khoan" onClick={() => setIsMenuOpen(false)}>
                    <Avatar fullName={customer.fullName} size="mobile" />
                  </Link>
                ) : (
                  <Link href="/dang-nhap" onClick={() => setIsMenuOpen(false)}>
                    <User size={22} className="text-text-main" />
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsContactOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-text-main cursor-pointer"
                  aria-label="Hotline"
                >
                  <Phone size={18} />
                  <span className="text-[10px] font-bold uppercase">
                    Hotline
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Tool Dropdown */}
      <SearchTool
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={searchProducts}
        popularSearches={popularSearches}
        isLoading={isSearchLoading}
      />

      {/* Contact Popup */}
      <PopupTemplate
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        size="md"
        headerImage="/assets/logo_header.webp"
        headerImageAlt="Duky Store"
        ariaLabel="Thông tin liên hệ"
      >
        <div className="space-y-4">
          {/* Hotline - Copy số điện thoại */}
          <button
            onClick={() => {
              navigator.clipboard.writeText("0939654574");
              alert("Đã copy số điện thoại: 0939.654.574");
            }}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-black" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-black">Hotline</p>
              <p className="text-sm text-gray-600">0939.654.574</p>
            </div>
            <span className="text-xs text-gray-400 hidden sm:block">
              Hỗ trợ 9:00 - 18:00 mỗi ngày
            </span>
          </button>

          {/* Zalo - Mở Zalo chat */}
          <a
            href="https://zalo.me/0939654574"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer no-underline"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-black" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-black">Zalo</p>
              <p className="text-sm text-gray-600">0939.654.574</p>
            </div>
            <span className="text-xs text-gray-400 hidden sm:block">
              Nhắn tin nhanh chóng
            </span>
          </a>

          {/* Email - Mở Gmail compose với địa chỉ nhận sẵn */}
          <a
            href="https://mail.google.com/mail/?view=cm&to=dukystore.info@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer no-underline"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-black" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-black">Email</p>
              <p className="text-sm text-gray-600">dukystore.info@gmail.com</p>
            </div>
            <span className="text-xs text-gray-400 hidden sm:block">
              Phản hồi trong 24h
            </span>
          </a>

          {/* Địa chỉ - Mở Google Maps */}
          <a
            href="https://www.google.com/maps/place/122+%C4%90.+Nguy%E1%BB%85n+Hi%E1%BB%81n,+Khu+d%C3%A2n+c%C6%B0+91B,+T%C3%A2n+An,+C%E1%BA%A7n+Th%C6%A1+94000,+Vietnam/@10.023035,105.755797,1823m/data=!3m1!1e3!4m6!3m5!1s0x31a088487f863ae3:0x704afb4eb3949570!8m2!3d10.0230345!4d105.7557973!16s%2Fg%2F11sp94nd66?hl=vi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer no-underline"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-black" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-black">Địa chỉ</p>
              <p className="text-sm text-gray-600">
                122 Nguyễn Hiến, KDC 91B,
                <br />
                P. Tân An, TP. Cần Thơ
              </p>
            </div>
          </a>
        </div>
      </PopupTemplate>
    </header>
  );
};
