"use client";

import React from "react";
import { useTheme, BrandColor } from "@/context/ThemeContext";
import { Palette, Moon, Sun, Monitor, Check } from "lucide-react";

export const SettingsPage = () => {
  const { theme, toggleTheme, brandColor, setBrandColor } = useTheme();

  const colorPalettes: { id: BrandColor; name: string; hex: string }[] = [
    { id: "green", name: "Teal (Default)", hex: "#0d9488" },
    { id: "blue", name: "Ocean Blue", hex: "#2563eb" },
    { id: "orange", name: "Sunset Orange", hex: "#ea580c" },
    { id: "purple", name: "Royal Purple", hex: "#9333ea" },
    { id: "rose", name: "Rose Red", hex: "#e11d48" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
        <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
          Sesuaikan tampilan dashboard dan preferensi pribadi Anda.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        
        {/* Appearance & Theme Section */}
        <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand-500" />
              Tampilan & Tema
            </h2>
          </div>
          
          <div className="p-6 grid gap-8">
            
            {/* Color Theme Picker */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Warna Utama Merek
              </h3>
              <div className="flex flex-wrap gap-4">
                {colorPalettes.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => setBrandColor(palette.id)}
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                      brandColor === palette.id ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110" : ""
                    }`}
                    style={{ backgroundColor: palette.hex }}
                    title={palette.name}
                  >
                    {brandColor === palette.id && (
                      <Check className="w-6 h-6 text-white absolute" />
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Warna ini akan diterapkan pada semua tombol utama, tautan aktif, dan sorotan visual di seluruh aplikasi.
              </p>
            </div>

            <hr className="border-gray-100 dark:border-white/5" />

            {/* Dark Mode Toggle */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Tema Antarmuka
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Light Mode Option */}
                <button
                  onClick={() => theme !== "light" && toggleTheme()}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    theme === "light" 
                      ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10" 
                      : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
                >
                  <Sun className={`w-6 h-6 ${theme === "light" ? "text-brand-600" : "text-gray-400"}`} />
                  <span className={`text-sm font-semibold ${theme === "light" ? "text-brand-700 dark:text-brand-400" : "text-gray-600 dark:text-gray-400"}`}>
                    Mode Terang
                  </span>
                </button>

                {/* Dark Mode Option */}
                <button
                  onClick={() => theme !== "dark" && toggleTheme()}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    theme === "dark" 
                      ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10" 
                      : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
                >
                  <Moon className={`w-6 h-6 ${theme === "dark" ? "text-brand-600" : "text-gray-400"}`} />
                  <span className={`text-sm font-semibold ${theme === "dark" ? "text-brand-700 dark:text-brand-400" : "text-gray-600 dark:text-gray-400"}`}>
                    Mode Gelap
                  </span>
                </button>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
