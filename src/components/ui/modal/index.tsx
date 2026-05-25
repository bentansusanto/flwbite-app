"use client";
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  isFullscreen?: boolean;
  isScrollable?: boolean;
  showCloseButton?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  className = "",
  isFullscreen = false,
  isScrollable = false,
  showCloseButton = true,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full bg-white dark:bg-gray-900"
    : `relative w-full rounded-t-3xl rounded-b-none sm:rounded-2xl bg-white dark:bg-gray-900 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-2xl overflow-hidden border-t sm:border border-gray-100 dark:border-gray-800 ${className}`;

  return (
    <div className="fixed inset-0 z-[999999] flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={contentClasses}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        {!isFullscreen && (
          <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        )}
        {/* Close Button - Now Sticky */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-[70] p-2 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}

        {title && (
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
        )}

        <div className={`relative ${isScrollable ? "max-h-[85vh] overflow-y-auto no-scrollbar" : ""}`}>
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
