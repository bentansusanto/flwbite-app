"use client";

import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Edit,
  Megaphone,
  Plus,
  Search,
  Tag,
  Trash2
} from "lucide-react";
import { useMemo, useState } from "react";
import { usePromotionHook } from "./hooks";
import PromotionForm from "./PromotionForm";

export default function PromotionsPage() {
  const [search, setSearch] = useState("");
  const {
    promotions,
    branches,
    products,
    categories,
    isFetching,
    isLoading,
    isModalOpen,
    selectedPromotion,
    isAlertOpen,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  } = usePromotionHook();

  const filtered = useMemo(() => {
    return promotions.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [promotions, search]);

  const activeCount = useMemo(() => {
    return promotions.filter((p) => p.status === "ACTIVE").length;
  }, [promotions]);

  const expiredCount = useMemo(() => {
    return promotions.filter((p) => p.status === "EXPIRED").length;
  }, [promotions]);

  // Helper to format values for display
  const getCleanValue = (valStr: string) => {
    try {
      return JSON.parse(valStr);
    } catch (e) {
      return valStr;
    }
  };

  const getConditionLabel = (type: string, value: string) => {
    const cleanVal = getCleanValue(value);
    switch (type) {
      case "MIN_QTY":
        return `Beli min. ${cleanVal} item`;
      case "MIN_PURCHASE":
        return `Min. belanja Rp ${Number(cleanVal).toLocaleString("id-ID")}`;
      case "BUY_X_GET_Y":
        return `Beli ${cleanVal} item`;
      case "NEW_CUSTOMER":
        return "Khusus Customer Baru";
      case "PRODUCT_CATEGORY":
        return "Khusus Kategori Produk Terpilih";
      case "SPECIFIC_ITEMS":
        return "Khusus Produk Pilihan";
      default:
        return type;
    }
  };

  const getActionLabel = (type: string, value: string) => {
    const cleanVal = getCleanValue(value);
    switch (type) {
      case "DISCOUNT_PERCENT":
        return `Diskon ${cleanVal}%`;
      case "DISCOUNT_AMOUNT":
        return `Potongan Rp ${Number(cleanVal).toLocaleString("id-ID")}`;
      case "FREE_ITEM":
        return `Gratis ${cleanVal} Item`;
      case "FIXED_PRICE":
        return `Harga Tetap Rp ${Number(cleanVal).toLocaleString("id-ID")}`;
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Promotions</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and manage dynamic discount campaigns, quantity bundles, and category promos.
          </p>
        </div>
        <Button onClick={() => handleOpenModal(null)} startIcon={<Plus size={18} />}>
          New Promotion
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600">
            <Megaphone size={20} />
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">
            {isFetching ? "..." : promotions.length}
          </p>
          <p className="text-xs font-medium text-gray-500">Total Campaigns</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-500/20 text-green-600">
            <CheckCircle2 size={20} />
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">
            {isFetching ? "..." : activeCount}
          </p>
          <p className="text-xs font-medium text-gray-500">Active Now</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600">
            <AlertCircle size={20} />
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">
            {isFetching ? "..." : expiredCount}
          </p>
          <p className="text-xs font-medium text-gray-500">Expired</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 rounded-xl border border-transparent bg-gray-50/50 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-white/5 dark:bg-gray-950 dark:text-white/90 dark:placeholder-gray-500"
        />
      </div>

      {/* Grid List or Loading / Empty States */}
      {isFetching ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
              <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800"></div>
              <div className="mt-5 h-5 w-2/3 rounded-lg bg-gray-100 dark:bg-gray-800"></div>
              <div className="mt-2 h-4 w-full rounded-lg bg-gray-50 dark:bg-gray-800/50"></div>
              <div className="mt-6 space-y-2 border-t border-gray-50 pt-4 dark:border-gray-800">
                <div className="h-3 w-1/3 rounded-lg bg-gray-50 dark:bg-gray-800/50"></div>
                <div className="h-3 w-1/2 rounded-lg bg-gray-50 dark:bg-gray-800/50"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 py-16 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-white/[0.02] mb-4 border border-gray-100 dark:border-white/5">
            <Tag size={32} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">Tidak ada data Promosi</h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm text-center">Data promosi tidak ditemukan. Mulai dengan membuat kampanye promosi pertama Anda.</p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => handleOpenModal(null)}
          >
            Launch Campaign
          </Button>
        </div>
      ) : (
        /* Grid List */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((promo) => (
            <div
              key={promo.id}
              className="group flex flex-col rounded-2xl border border-gray-100 bg-white transition-all hover:border-brand-100 hover:shadow-theme-xl dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md"
            >
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400 dark:bg-gray-800 transition-colors group-hover:bg-brand-50 group-hover:text-brand-500">
                    <Tag size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(promo)}
                      className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-1.5 text-gray-400 hover:text-error-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">{promo.name}</h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        promo.status === "ACTIVE"
                          ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                          : promo.status === "EXPIRED"
                          ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                      }`}
                    >
                      {promo.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                    {promo.description || "No description provided."}
                  </p>
                </div>

                {/* Display Rules List */}
                <div className="mt-6 space-y-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Aturan Promosi</span>
                  <div className="space-y-2">
                    {promo.rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-3 rounded-xl border border-gray-50 bg-gray-50/30 dark:border-gray-800/50 dark:bg-white/[0.01] flex flex-col gap-1"
                      >
                        <div className="font-semibold text-brand-600 dark:text-brand-400">
                          {idx + 1}. {getActionLabel(rule.action_type, rule.action_value)}
                        </div>
                        <div className="text-gray-400 text-[11px]">
                          Syarat: {getConditionLabel(rule.condition_type, rule.condition_value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validity and Branches footer */}
                <div className="mt-6 space-y-2 border-t border-gray-50 pt-4 dark:border-gray-800">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={12} /> Validity
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {new Date(promo.start_date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short"
                      })}{" "}
                      -{" "}
                      {new Date(promo.end_date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-4xl max-h-[85vh] flex flex-col" showCloseButton={false}>
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 p-5 dark:border-gray-800 z-50 rounded-t-2xl">
          <h4 className="text-base font-bold text-gray-800 dark:text-white/90">
            {selectedPromotion ? "Edit Promotion Campaign" : "Launch New Campaign"}
          </h4>
          <p className="text-sm text-gray-400">Configure your marketing target branches and complex promotion rules.</p>
        </div>
        <PromotionForm
          initialData={selectedPromotion}
          branches={branches}
          products={products}
          categories={categories}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Campaign?"
        description="This will permanently end this marketing campaign and deactivate all discount rules. Continue?"
        variant="danger"
      />
    </div>
  );
}
