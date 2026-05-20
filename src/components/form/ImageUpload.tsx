import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
}

export default function ImageUpload({ value, onChange, className = "", label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 512KB)
    if (file.size > 512 * 1024) {
      toast.error("Ukuran gambar maksimal 512KB");
      return;
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format gambar tidak didukung (gunakan JPG, PNG, atau WEBP)");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = Cookies.get("flwbite_token");
      const csrfToken = Cookies.get("csrf_token");
      
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengunggah gambar");
      }

      onChange(data.data.url);
      toast.success("Gambar berhasil diunggah");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat mengunggah gambar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange("");
  };

  return (
    <div className={className}>
      {label && <p className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>}
      <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/2 hover:bg-gray-100 dark:hover:bg-white/4 transition-all">
        {value ? (
          <div className="relative aspect-square w-full sm:w-32 sm:aspect-auto sm:h-32 rounded-xl overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleRemove}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform hover:scale-110 shadow-lg"
                title="Hapus Gambar"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full aspect-square sm:w-32 sm:aspect-auto sm:h-32 cursor-pointer">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-brand-500 animate-spin mb-2" />
              ) : (
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-brand-500 mb-2 transition-colors" />
              )}
              <p className="text-xs font-semibold text-gray-500 group-hover:text-brand-600 transition-colors">
                {isUploading ? "Mengunggah..." : "Upload"}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[100px]">JPG, PNG, WEBP max 512KB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg, image/png, image/jpg, image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}
