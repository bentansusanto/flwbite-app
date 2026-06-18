import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import Link from "next/link";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-white dark:bg-gray-900 overflow-hidden">
        {/* Branding Side */}
        <div className="hidden lg:flex lg:w-1/2 p-12 text-white flex-col justify-between relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/images/pos_bg.png')" }}>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-brand-950/85 dark:bg-black/80 z-0"></div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none z-[0]">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-[100px]" />
          </div>
          
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/flwbite-logo-web.svg" alt="Flwbite Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-white text-2xl tracking-tight">Flwbite.</span>
            </Link>

            <div className="space-y-6 max-w-md">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
                Kembangkan Bisnis Anda dengan AI.
              </h1>
              <p className="text-gray-400 text-lg">
                Bergabunglah dengan ribuan pengusaha yang telah mengoptimalkan operasional mereka dengan ekosistem POS cerdas kami.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-gray-300 italic mb-4">
                "Flwbite telah mengubah cara kami mengelola inventaris. Fitur prediksinya sangat akurat dan menghemat waktu kami."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div>
                  <p className="font-semibold text-white">Andi Pratama</p>
                  <p className="text-sm text-gray-500">Pemilik Coffee Shop</p>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-8">
              © 2026 Flwbite Inc. All rights reserved.
            </p>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 z-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex justify-center mb-8">
               <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gray-900 dark:bg-white flex items-center justify-center">
                    <span className="text-white dark:text-gray-900 font-bold text-sm">F</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Flwbite.</span>
                </Link>
            </div>
            {children}
          </div>
        </div>

        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
    </div>
  );
};
