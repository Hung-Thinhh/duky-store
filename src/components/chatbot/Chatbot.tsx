"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, MessageSquare, ArrowRight, User, Loader2, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "./ProductCard";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
  imagePreview?: string;
}

const parseBoldText = (text: string, baseKey: string) => {
  const boldParts = text.split("**");
  return boldParts.map((part, idx) => {
    if (idx % 2 === 1) {
      return (
        <strong key={`bold-${baseKey}-${idx}`} className="font-semibold text-zinc-950 dark:text-white">
          {part}
        </strong>
      );
    }
    return part;
  });
};
const renderMessageText = (text: string) => {
  if (!text) return null;

  const cardRegex = /\[product-card:([^|\]]*)\|([^|\]]*)\|([^|\]]*)\|([^|\]]*)\|([^|\]]*)(?:\|([^|\]]*))?\]/g;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const buttonRegex = /\[action-button:([^|\]]*)\|([^|\]]*)\]/g;
  const orderCardRegex = /\[order-card:([^|\]]*)\|([^|\]]*)\|([^|\]]*)\|([^|\]]*)\|([^|\]]*)\]/g;

  interface MatchToken {
    type: 'card' | 'link' | 'button' | 'order-card';
    index: number;
    length: number;
    data: any;
  }

  const matches: MatchToken[] = [];

  // Find cards
  let cardMatch;
  while ((cardMatch = cardRegex.exec(text)) !== null) {
    matches.push({
      type: 'card',
      index: cardMatch.index,
      length: cardMatch[0].length,
      data: {
        slug: cardMatch[1],
        name: cardMatch[2],
        imageUrl: cardMatch[3],
        originalPrice: cardMatch[4],
        salePrice: cardMatch[5],
        quantity: cardMatch[6],
      }
    });
  }

  // Find buttons
  let buttonMatch;
  while ((buttonMatch = buttonRegex.exec(text)) !== null) {
    const isOverlapping = matches.some(m => buttonMatch!.index >= m.index && buttonMatch!.index < m.index + m.length);
    if (!isOverlapping) {
      matches.push({
        type: 'button',
        index: buttonMatch.index,
        length: buttonMatch[0].length,
        data: {
          label: buttonMatch[1],
          url: buttonMatch[2],
        }
      });
    }
  }

  // Find links
  let linkMatch;
  while ((linkMatch = linkRegex.exec(text)) !== null) {
    const isOverlapping = matches.some(m => linkMatch!.index >= m.index && linkMatch!.index < m.index + m.length);
    if (!isOverlapping) {
      matches.push({
        type: 'link',
        index: linkMatch.index,
        length: linkMatch[0].length,
        data: {
          label: linkMatch[1],
          url: linkMatch[2],
        }
      });
    }
  }

  // Find order cards
  let orderMatch;
  while ((orderMatch = orderCardRegex.exec(text)) !== null) {
    const isOverlapping = matches.some(m => orderMatch!.index >= m.index && orderMatch!.index < m.index + m.length);
    if (!isOverlapping) {
      matches.push({
        type: 'order-card',
        index: orderMatch.index,
        length: orderMatch[0].length,
        data: {
          code: orderMatch[1],
          status: orderMatch[2],
          paymentStatus: orderMatch[3],
          shippingStatus: orderMatch[4],
          grandTotal: orderMatch[5],
        }
      });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const formatVNPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  for (const match of matches) {
    if (match.index < lastIndex) continue;

    const beforeText = text.substring(lastIndex, match.index);
    if (beforeText) {
      parts.push(...parseBoldText(beforeText, `text-${match.index}`));
    }

    if (match.type === 'card') {
      const { slug, name, imageUrl, originalPrice, salePrice, quantity } = match.data;
      parts.push(
        <ProductCard
          key={`card-${match.index}`}
          slug={slug}
          name={name}
          imageUrl={imageUrl}
          originalPrice={originalPrice}
          salePrice={salePrice}
          quantity={quantity}
        />
      );
    } else if (match.type === 'button') {
      const { label, url } = match.data;
      const isInternal = url.startsWith("/");
      if (isInternal) {
        parts.push(
          <Link
            key={`button-${match.index}`}
            href={url}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 my-2 text-xs font-semibold text-center text-white bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-600 hover:from-zinc-950 hover:to-zinc-950 border border-zinc-850 rounded-xl transition-all duration-300 hover:shadow-xs cursor-pointer select-none font-sans"
          >
            {label}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={`button-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 my-2 text-xs font-semibold text-center text-white bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-600 hover:from-zinc-950 hover:to-zinc-950 border border-zinc-850 rounded-xl transition-all duration-300 hover:shadow-xs cursor-pointer select-none font-sans"
          >
            {label}
          </a>
        );
      }
    } else if (match.type === 'link') {
      const { label, url } = match.data;
      if (url.startsWith("/")) {
        parts.push(
          <Link
            key={`link-${match.index}`}
            href={url}
            className="text-amber-600 hover:text-amber-700 font-semibold underline hover:opacity-80 transition-opacity inline-block mx-0.5"
          >
            {label}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={`link-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:text-amber-700 font-semibold underline hover:opacity-80 transition-opacity inline-block mx-0.5"
          >
            {label}
          </a>
        );
      }
    } else if (match.type === 'order-card') {
      const { code, status, paymentStatus, shippingStatus, grandTotal } = match.data;
      const totalPrice = Number(grandTotal) || 0;

      const getStatusLabel = (s: string) => {
        switch (s) {
          case 'PENDING': return 'Chờ xác nhận';
          case 'CONFIRMED': return 'Đã xác nhận';
          case 'PROCESSING': return 'Đang đóng gói';
          case 'SHIPPING': return 'Đang vận chuyển';
          case 'COMPLETED': return 'Đã hoàn thành';
          case 'CANCELLED': return 'Đã hủy';
          case 'RETURNED': return 'Đã trả hàng';
          case 'REFUNDED': return 'Đã hoàn tiền';
          default: return s;
        }
      };

      const getStatusColor = (s: string) => {
        if (s === 'COMPLETED') return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (s === 'CANCELLED' || s === 'RETURNED' || s === 'REFUNDED') return 'text-rose-600 bg-rose-50 border-rose-100';
        return 'text-amber-600 bg-amber-50 border-amber-100';
      };

      const steps = ['PENDING', 'PROCESSING', 'SHIPPING', 'COMPLETED'];
      const currentStepIdx = steps.indexOf(status);
      const isSpecial = ['CANCELLED', 'RETURNED', 'REFUNDED'].includes(status);

      parts.push(
        <div key={`order-${match.index}`} className="p-4 my-3 bg-white border border-zinc-150 rounded-2xl shadow-xs w-full text-left font-sans flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <span className="text-xs font-bold text-zinc-400">ĐƠN HÀNG: <span className="text-zinc-900 font-extrabold">{code}</span></span>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", getStatusColor(status))}>
              {getStatusLabel(status)}
            </span>
          </div>

          {!isSpecial && currentStepIdx !== -1 && (
            <div className="flex items-center justify-between py-1 relative">
              <div className="absolute left-2 right-2 top-4 h-[2px] bg-zinc-100 -z-1" />
              <div 
                className="absolute left-2 top-4 h-[2px] bg-amber-500 -z-1 transition-all duration-500" 
                style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
              />
              
              {steps.map((step, idx) => {
                const isActive = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step} className="flex flex-col items-center gap-1.5 shrink-0 z-10">
                    <div 
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold transition-all duration-300 border",
                        isCurrent 
                          ? "bg-zinc-950 text-white border-zinc-950 scale-110 shadow-sm"
                          : isActive
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-white text-zinc-400 border-zinc-200"
                      )}
                    >
                      {idx + 1}
                    </div>
                    <span className={cn("text-[9px] font-bold transition-colors", isActive ? "text-zinc-900" : "text-zinc-400")}>
                      {step === 'PENDING' ? 'Đặt hàng' : step === 'PROCESSING' ? 'Chuẩn bị' : step === 'SHIPPING' ? 'Đang giao' : 'Hoàn thành'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {isSpecial && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50/50 border border-rose-100/50 text-rose-600 text-xs font-semibold">
              <span>⚠️ Đơn hàng đã ở trạng thái đặc biệt: {getStatusLabel(status)}. Vui lòng nhắn Zalo/Hotline hỗ trợ.</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-zinc-100 text-zinc-500">
            <span>Tổng thanh toán:</span>
            <span className="text-zinc-950 text-sm font-extrabold">{formatVNPrice(totalPrice)}</span>
          </div>
        </div>
      );
    }

    lastIndex = match.index + match.length;
  }

  const remainingText = text.substring(lastIndex);
  if (remainingText) {
    parts.push(...parseBoldText(remainingText, `text-end`));
  }

  return parts;
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const quickRepliesRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      alert("Chỉ hỗ trợ định dạng JPG, PNG, WEBP hoặc GIF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Dung lượng ảnh tối đa là 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageFile(file);
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const el = quickRepliesRef.current;
    if (!el) return;

    const handleWheelEvent = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", handleWheelEvent, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheelEvent);
    };
  }, [isOpen]);

  // Welcome message on mount
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "Xin chào! Chào mừng bạn đến với **Duky Store** - Thế giới Giày Boot Da Cao Cấp. 👟✨\n\nTôi là Trợ lý ảo của cửa hàng, tôi có thể hỗ trợ gì cho bạn hôm nay?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Cleanup on unmount
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const handleSend = useCallback(async (text: string, fileToSend?: File | null) => {
    const activeFile = fileToSend !== undefined ? fileToSend : imageFile;
    const trimmedText = text.trim();
    if ((!trimmedText && !activeFile) || isStreaming) return;

    // Build history for the backend (exclude welcome msg)
    const historyForBackend = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => {
        const parts: any[] = [];
        if (m.text) {
          parts.push({ text: m.text });
        }
        if (m.sender === "user" && m.imagePreview) {
          const match = m.imagePreview.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        }
        if (parts.length === 0) {
          parts.push({ text: "" });
        }
        return {
          role: m.sender === "bot" ? "model" : "user",
          parts,
        };
      });

    let imageBase64: string | undefined = undefined;
    let imageMimeType: string | undefined = undefined;
    let localPreviewUrl: string | null = null;

    if (activeFile) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(activeFile);
        });

        localPreviewUrl = dataUrl;
        const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          imageMimeType = match[1];
          imageBase64 = match[2];
        }
      } catch (err) {
        console.error("Failed to read image file", err);
      }
    }

    // Add user message + empty bot placeholder
    const botId = `bot-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: trimmedText,
        timestamp: new Date(),
        ...(localPreviewUrl ? { imagePreview: localPreviewUrl } : {}),
      },
      { id: botId, sender: "bot", text: "", timestamp: new Date() },
    ]);
    setInputValue("");
    handleRemoveImage();
    setIsStreaming(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const abortCtrl = new AbortController();
    abortRef.current = abortCtrl;

    try {
      const bodyPayload: any = {
        text: trimmedText,
        history: historyForBackend,
      };
      if (imageBase64 && imageMimeType) {
        bodyPayload.imageBase64 = imageBase64;
        bodyPayload.imageMimeType = imageMimeType;
      }

      const res = await fetch(`${API_URL}/chatbot/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        signal: abortCtrl.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;

          try {
            const parsed = JSON.parse(raw);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.token) {
              setMessages((prev) => {
                const idx = prev.findIndex((m) => m.id === botId);
                if (idx === -1) return prev;
                const updated = [...prev];
                updated[idx] = { ...updated[idx], text: updated[idx].text + parsed.token };
                return updated;
              });
            }
          } catch {
            // ignore malformed lines
          }
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("[Chatbot] fetch stream error:", err);
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === botId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          text: "Hiện tại Trợ lý Duky đang bận một chút, bạn vui lòng đợi vài giây và gửi lại tin nhắn giúp mình nhé! 🙏",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === botId);
        if (idx !== -1 && !prev[idx].text) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            text: "Hiện tại Trợ lý Duky đang bận một chút, bạn vui lòng đợi vài giây và gửi lại tin nhắn giúp mình nhé! 🙏",
          };
          return updated;
        }
        return prev;
      });
    }
  }, [messages, isStreaming, imageFile]);

  const quickReplies = [
    { label: "🔥 Sản phẩm nổi bật", val: "Cho tôi xem sản phẩm nổi bật của shop" },
    { label: "🆕 Hàng mới về", val: "Shop có hàng mới về không?" },
    { label: "✨ Tư vấn chọn giày", val: "Tôi cần tư vấn chọn giày boot phù hợp" },
    { label: "📍 Thông tin cửa hàng", val: "Thông tin cửa hàng" },
    { label: "👟 Hướng dẫn chọn size", val: "Hướng dẫn chọn size" },
    { label: "🛍️ Hướng dẫn mua hàng", val: "Hướng dẫn mua hàng trên web" },
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-[380px] h-[550px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-zinc-100 overflow-hidden flex flex-col font-sans"
            >
              {/* Header */}
              <div className="p-4 bg-black text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center relative shadow-inner overflow-hidden">
                    <Image
                      src="/assets/icons/Chatbot.gif"
                      alt="Duky Bot"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 bg-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base tracking-wider uppercase font-sans">
                      Duky Store
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                      Hỗ trợ trực tuyến 24/7
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-zinc-50/50 scrollbar-thin">
                {messages.map((msg) => {
                  const isBot = msg.sender === "bot";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-start gap-2 max-w-[85%]",
                        isBot ? "self-start" : "self-end ml-auto flex-row-reverse"
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center overflow-hidden shrink-0",
                          isBot
                            ? "bg-white border border-zinc-100 shadow-xs"
                            : "bg-amber-500 text-white shadow-sm"
                        )}
                      >
                        {isBot ? (
                          <Image
                            src="/assets/icons/Chatbot.gif"
                            alt="Duky Bot"
                            width={28}
                            height={28}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Content Bubble */}
                      <div className="space-y-1.5 flex flex-col">
                        {msg.imagePreview && (
                          <div className={cn(
                            "rounded-xl overflow-hidden border border-zinc-200 shadow-xs max-w-[200px]",
                            isBot ? "self-start" : "self-end ml-auto"
                          )}>
                            <img
                              src={msg.imagePreview}
                              alt="User attachment"
                              className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => {
                                const w = window.open();
                                if (w) {
                                  w.document.write(`<img src="${msg.imagePreview}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                }
                              }}
                            />
                          </div>
                        )}
                        {msg.text && (
                          <div
                            className={cn(
                              "px-2 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-xs font-sans",
                              isBot
                                ? "bg-white text-zinc-800 rounded-tl-xs border border-zinc-100"
                                : "bg-zinc-950 text-white rounded-tr-xs"
                            )}
                          >
                            {renderMessageText(msg.text)}
                          </div>
                        )}
                        <p className={cn("text-[10px] text-zinc-400 px-1", !isBot && "text-right")}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Bouncing Typing Indicator — shown while streaming and last bot bubble is empty */}
                {isStreaming && messages[messages.length - 1]?.sender === "bot" && messages[messages.length - 1]?.text === "" && (
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-zinc-100">
                      <Image
                        src="/assets/icons/Chatbot.gif"
                        alt="Duky Bot"
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="px-4 py-3 bg-white rounded-2xl rounded-tl-xs border border-zinc-100 shadow-xs flex items-center gap-1.5 h-[34px]">
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              <div 
                ref={quickRepliesRef}
                className="px-4 py-2 bg-white border-t border-zinc-100 flex gap-2 overflow-x-auto scrollbar-none shrink-0 select-none"
              >
                {quickReplies.map((qr) => (
                  <button
                    key={qr.val}
                    onClick={() => handleSend(qr.val)}
                    className="px-2 py-2 rounded-full border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 text-xs text-zinc-600 hover:text-zinc-950 transition-all cursor-pointer whitespace-nowrap font-sans"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>


              {/* Image Preview Area */}
              {imagePreview && (
                <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center gap-3 shrink-0">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-200 shadow-xs shrink-0 bg-white">
                    <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-black text-white p-0.5 rounded-full transition-colors cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-700 truncate font-sans">
                      {imageFile?.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-sans">
                      {imageFile ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                    </p>
                  </div>
                </div>
              )}

              {/* Input Footer */}
              <div className="py-3 px-4 bg-white border-t border-zinc-100 flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming}
                  className="w-11 h-11 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Tải ảnh lên"
                >
                  <Camera className="w-4.5 h-4.5" />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isStreaming) handleSend(inputValue);
                  }}
                  placeholder="Nhập tin nhắn..."
                  disabled={isStreaming}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-100/80 focus:bg-white text-sm px-4 py-3 rounded-xl outline-hidden focus:ring-1 focus:ring-zinc-950 border border-transparent focus:border-zinc-950 transition-all font-sans disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => handleSend(inputValue)}
                  disabled={isStreaming || (!inputValue.trim() && !imageFile)}
                  className="w-11 h-11 rounded-full bg-zinc-950 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Gửi tin nhắn"
                >
                  {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer relative overflow-hidden",
            "bg-linear-to-br from-black via-zinc-900 to-zinc-700 border border-white/10 hover:shadow-premium-black transition-all duration-300",
            "text-white"
          )}
          aria-label="Mở Trợ lý ảo"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex items-center justify-center"
              >
                <Image
                  src="/assets/icons/Chatbot.gif"
                  alt="Chatbot"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
};

export default Chatbot;
