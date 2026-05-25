"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Apakah Anda yakin?",
  description = "Tindakan ini tidak dapat dibatalkan.",
  confirmLabel = "Lanjutkan",
  cancelLabel = "Batal",
  variant = "danger",
  isLoading = false,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const confirmButtonClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/30 text-white dark:bg-red-600 dark:hover:bg-red-700"
      : variant === "warning"
      ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/30 text-white"
      : "bg-brand-500 hover:bg-brand-600 focus:ring-brand-500/30 text-white";

  return createPortal(
    <>
      {/* Backdrop: portal into body so it's above z-99999 navbar */}
      <div
        className="fixed inset-0 z-[9999999] bg-black/50 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Panel Container */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 pointer-events-none"
        aria-modal="true"
        role="alertdialog"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {/* Panel */}
        <div className="pointer-events-auto w-full max-w-[400px] rounded-2xl bg-white dark:bg-gray-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-6">
          {/* Content */}
          <div className="space-y-2 mb-6">
            <h2
              id="alert-dialog-title"
              className="text-base font-semibold text-gray-900 dark:text-white"
            >
              {title}
            </h2>
            <p
              id="alert-dialog-description"
              className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed"
            >
              {description}
            </p>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-100 dark:border-gray-800 -mx-6 mb-4" />

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-xs focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonClass}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
