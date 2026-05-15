"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { Package, ChevronRight } from "lucide-react";

interface Variant {
  id: string;
  sku?: string;
  name: string;
  price: number;
  stock?: number;
}

interface Product {
  id: string;
  name: string;
  type: "retail" | "f&b" | "service";
  image?: string;
  variants: Variant[];
}

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  stocks: any[];
  onSelect: (variant: Variant) => void;
}

export const VariantSelectionModal = ({
  isOpen,
  onClose,
  product,
  stocks,
  onSelect,
}: VariantSelectionModalProps) => {
  if (!product) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md w-[90%] mx-auto"
    >
      <div className="p-6 dark:bg-gray-900">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              "📦"
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{product.name}</h3>
            <p className="text-xs text-gray-500">Pilih varian untuk ditambahkan</p>
          </div>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
          {product.variants.map((variant) => {
            const currentStock = stocks.find(s => s.variant_id === variant.id)?.actual_stock || 0;
            const isOutOfStock = product.type === "retail" && currentStock <= 0;

            return (
              <button
                key={variant.id}
                disabled={isOutOfStock}
                onClick={() => {
                  onSelect(variant);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                  isOutOfStock 
                    ? "bg-gray-50/50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800 cursor-not-allowed opacity-60 grayscale" 
                    : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700"
                }`}
              >
                <div className="text-left">
                  <p className={`text-sm font-bold transition-colors ${
                    isOutOfStock ? "text-gray-400" : "text-gray-900 dark:text-white group-hover:text-indigo-600"
                  }`}>
                    {variant.name}
                  </p>
                  {product.type === "retail" && (
                    <p className={`text-[10px] font-medium mt-0.5 ${
                      isOutOfStock ? "text-red-400" : "text-gray-400"
                    }`}>
                      {isOutOfStock ? "Stok Kosong" : `Stok: ${currentStock}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${
                    isOutOfStock ? "text-gray-300" : "text-indigo-600 dark:text-indigo-400"
                  }`}>
                    {formatCurrency(variant.price)}
                  </span>
                  {!isOutOfStock && (
                    <div className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full h-11 text-xs font-bold rounded-xl"
          >
            Batal
          </Button>
        </div>
      </div>
    </Modal>
  );
};
