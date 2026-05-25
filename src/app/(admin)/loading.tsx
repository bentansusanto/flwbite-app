import React from "react";

export default function AdminLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="relative flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-brand-600 animate-spin dark:border-gray-800 dark:border-t-brand-500"></div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Memuat halaman...</p>
      </div>
    </div>
  );
}
