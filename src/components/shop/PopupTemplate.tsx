"use client";

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export interface PopupTemplateProps {
  /** Controls popup visibility */
  isOpen: boolean;
  /** Callback fired when popup should close */
  onClose: () => void;
  /** Size variant controlling max-width */
  size?: 'sm' | 'md' | 'lg';
  /** Header image URL */
  headerImage?: string;
  /** Alt text for header image */
  headerImageAlt?: string;
  /** Header title text */
  headerTitle?: string;
  /** Custom header render prop (takes precedence over headerImage/headerTitle) */
  headerContent?: React.ReactNode;
  /** Accessible label for the dialog */
  ariaLabel?: string;
  /** ID of element that labels the dialog */
  ariaLabelledBy?: string;
  /** Additional classes for the popup container */
  className?: string;
  /** Additional classes for the overlay */
  overlayClassName?: string;
  /** Popup body content */
  children?: React.ReactNode;
  /** Whether to show the close button */
  showCloseButton?: boolean;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[500px]',
  lg: 'max-w-[640px]',
};

function resolveSize(size?: string): string {
  if (size === 'sm' || size === 'md' || size === 'lg') {
    return SIZE_CLASSES[size];
  }
  return SIZE_CLASSES['md'];
}

export function PopupTemplate({
  isOpen,
  onClose,
  size,
  headerImage,
  headerImageAlt,
  headerTitle,
  headerContent,
  ariaLabel,
  ariaLabelledBy,
  className,
  overlayClassName,
  children,
  showCloseButton = true,
}: PopupTemplateProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(isOpen);
  useFocusTrap(panelRef, { enabled: isOpen, onEscape: onClose });

  // Resolve ARIA label attributes (ariaLabelledBy takes precedence)
  const ariaProps: Record<string, string> = {};
  if (ariaLabelledBy) {
    ariaProps['aria-labelledby'] = ariaLabelledBy;
  } else if (ariaLabel) {
    ariaProps['aria-label'] = ariaLabel;
  }

  // Determine if header should render
  const hasHeader = !!(headerContent || headerImage || headerTitle);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className={cn(
              'fixed inset-0 bg-black/50 backdrop-blur-[4px] z-[60]',
              overlayClassName
            )}
          />

          {/* Panel wrapper - centered positioning */}
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center"
            onClick={onClose}
          >
            {/* Panel */}
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              {...ariaProps}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'bg-white rounded-2xl shadow-2xl relative w-full mx-4 min-w-[280px] max-h-[90vh] flex flex-col',
                resolveSize(size),
                className
              )}
            >
              {/* Close button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  aria-label="Đóng"
                  className="absolute top-3 right-3 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors z-10 cursor-pointer"
                >
                  <X size={20} />
                </button>
              )}

              {/* Header section */}
              {hasHeader && (
                <div className="px-6 pt-6">
                  {headerContent ? (
                    headerContent
                  ) : (
                    <>
                      {headerImage && (
                        <div className="flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={headerImage}
                            alt={headerImageAlt || ''}
                            className="max-h-[120px] object-contain"
                          />
                        </div>
                      )}
                      {headerTitle && (
                        <h2 className="font-serif font-bold text-lg text-center truncate">
                          {headerTitle}
                        </h2>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Body section */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
