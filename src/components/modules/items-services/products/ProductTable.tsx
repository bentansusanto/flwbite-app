"use client";
import React from "react";
import { Edit, Trash2, ChevronDown, ChevronRight, ChevronUp, Search, Package, ShoppingBag, Utensils, Briefcase } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { SortField, SortOrder, ProductType } from "./hooks";

const TYPE_BADGE: Record<string, string> = {
  retail: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  "f&b": "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  service: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
};

const TypeIcon = ({ type, size = 16 }: { type: string; size?: number }) => {
  if (type === "retail") return <ShoppingBag size={size} />;
  if (type === "f&b") return <Utensils size={size} />;
  if (type === "service") return <Briefcase size={size} />;
  return <Package size={size} />;
};

const SortIcon = ({ field, sortField, sortOrder }: { field: SortField; sortField: SortField; sortOrder: SortOrder }) => {
  if (sortField !== field) return <ChevronDown size={13} className="opacity-30" />;
  return sortOrder === "asc" ? <ChevronUp size={13} className="text-brand-500" /> : <ChevronDown size={13} className="text-brand-500" />;
};

interface Props {
  products: any[];
  filteredCount: number;
  totalCount: number;
  isFetching: boolean;
  searchQuery: string;
  filterType: "all" | ProductType;
  sortField: SortField;
  sortOrder: SortOrder;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  expandedProductId: string | null;
  onSearch: (q: string) => void;
  onFilterType: (t: "all" | ProductType) => void;
  onSort: (f: SortField) => void;
  onToggleExpand: (id: string) => void;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  onEdit: (p: any) => void;
  onDelete: (id: string) => void;
  onOpenCreate: () => void;
}

const FILTER_TABS = [
  { label: "Semua", value: "all" },
  { label: "Retail", value: "retail" },
  { label: "F&B", value: "f&b" },
  { label: "Service", value: "service" },
] as const;

export const ProductTable: React.FC<Props> = ({
  products, filteredCount, totalCount, isFetching,
  searchQuery, filterType, sortField, sortOrder,
  currentPage, totalPages, pageSize, expandedProductId,
  onSearch, onFilterType, onSort, onToggleExpand,
  onPageChange, onPageSizeChange, onEdit, onDelete, onOpenCreate,
}) => {
  const startItem = filteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredCount);
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-transparent bg-gray-50/50 pl-9 pr-3 text-sm outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-white/5 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500"
          />
        </div>
        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 p-1 dark:border-gray-800 dark:bg-white/[0.03]">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onFilterType(tab.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                filterType === tab.value
                  ? "bg-white shadow-sm text-gray-800 dark:bg-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="border-b border-gray-50 px-5 py-2.5 dark:border-gray-800">
        <p className="text-xs text-gray-400">
          {isFetching ? "Memuat..." : `Menampilkan ${filteredCount} dari ${totalCount} produk`}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-white/5 dark:bg-white/[0.03]">
              <th className="w-8 px-3 py-3.5" />
              <th className="px-4 py-3.5 text-left">
                <button onClick={() => onSort("name")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Produk <SortIcon field="name" sortField={sortField} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3.5 text-left">
                <button onClick={() => onSort("category_name")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Kategori <SortIcon field="category_name" sortField={sortField} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3.5 text-left">
                <button onClick={() => onSort("type")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Tipe <SortIcon field="type" sortField={sortField} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3.5 text-center">
                <button onClick={() => onSort("variants")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mx-auto">
                  Varian <SortIcon field="variants" sortField={sortField} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Stok</th>
              <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {isFetching ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-3 py-4"><div className="h-4 w-4 rounded bg-gray-100 dark:bg-gray-800 mx-auto" /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-32 rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="h-3 w-44 rounded bg-gray-50 dark:bg-gray-800/50" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4"><div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4 text-center"><div className="h-5 w-6 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto" /></td>
                  <td className="px-4 py-4 text-center"><div className="h-5 w-10 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto" /></td>
                  <td className="px-4 py-4" />
                </tr>
              ))
            ) : products.length > 0 ? (
              products.map((product: any) => {
                const isExpanded = expandedProductId === product.id;
                return (
                  <React.Fragment key={product.id}>
                    <tr
                      className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02] ${isExpanded ? "bg-gray-50/80 dark:bg-white/[0.02]" : ""}`}
                    >
                      {/* Expand toggle */}
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => onToggleExpand(product.id)}
                          className={`flex h-5 w-5 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 ${isExpanded ? "text-brand-500" : ""}`}
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </td>
                      {/* Name */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 shrink-0 overflow-hidden items-center justify-center rounded-lg ${
                            product.image ? "bg-transparent" : "bg-emerald-800 text-white dark:bg-emerald-900"
                          }`}>
                            {product.image ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <TypeIcon type={product.type} size={15} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white/90">{product.name}</p>
                            {product.description && (
                              <p className="mt-0.5 line-clamp-1 max-w-[220px] text-xs text-gray-400">{product.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{product.category_name || "—"}</td>
                      {/* Type */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${TYPE_BADGE[product.type] || "bg-gray-100 text-gray-500"}`}>
                          {product.type}
                        </span>
                      </td>
                      {/* Variants count */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {product.variants?.length || 0}
                        </span>
                      </td>
                      {/* Stock */}
                      <td className="px-4 py-4 text-center">
                        {product.is_stock_tracked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />Ya
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />Tidak
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => onEdit(product)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800 transition-colors" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => onDelete(product.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-error-500 dark:hover:bg-red-500/10 transition-colors" title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded: Variants */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="border-t-0 bg-gray-50/50 px-4 pb-4 pt-0 dark:bg-white/[0.01]">
                          <div className="ml-11 rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50">
                            <div className="border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
                              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Varian Produk</p>
                            </div>
                            {product.variants?.length > 0 ? (
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-50 dark:border-gray-800">
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Nama Varian</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Harga Jual</th>
                                    {product.type === "retail" && (
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Harga Modal</th>
                                    )}
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-400">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                  {product.variants.map((v: any) => (
                                    <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                      <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300">{v.name}</td>
                                      <td className="px-4 py-2.5 text-right text-gray-600 dark:text-gray-400">
                                        Rp {Number(v.price).toLocaleString("id-ID")}
                                      </td>
                                      {product.type === "retail" && (
                                        <td className="px-4 py-2.5 text-right text-gray-500 dark:text-gray-500">
                                          {v.cost_price != null
                                            ? `Rp ${Number(v.cost_price).toLocaleString("id-ID")}`
                                            : <span className="text-gray-300 dark:text-gray-600">—</span>
                                          }
                                        </td>
                                      )}
                                      <td className="px-4 py-2.5 text-center">
                                        {v.is_active ? (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />Aktif
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800">
                                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />Nonaktif
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="px-4 py-4 text-xs text-gray-400">Belum ada varian untuk produk ini.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                      <Package size={26} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-700 dark:text-white/90">Tidak ada produk ditemukan</p>
                    <p className="mt-1 text-xs text-gray-400">Coba ubah filter atau kata kunci pencarian.</p>
                    <Button className="mt-4" variant="outline" onClick={onOpenCreate}>Buat Produk</Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — always visible */}
      <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3.5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: info + page size */}
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400">
            {isFetching ? "Memuat..." : filteredCount === 0 ? "0 produk" : `${startItem}–${endItem} dari ${filteredCount} produk`}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {[5, 10, 25, 50].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-xs text-gray-400">per halaman</span>
          </div>
        </div>

        {/* Right: page buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            title="Halaman pertama"
          >
            <ChevronDown size={13} className="rotate-90" />
            <ChevronDown size={13} className="-ml-2 rotate-90" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronDown size={13} className="rotate-90" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .reduce<(number | string)[]>((acc, p, idx, arr) => {
              if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              typeof p === "string" ? (
                <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    currentPage === p
                      ? "bg-brand-500 text-white shadow-sm"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  {p}
                </button>
              )
            )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronDown size={13} className="-rotate-90" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            title="Halaman terakhir"
          >
            <ChevronDown size={13} className="-rotate-90" />
            <ChevronDown size={13} className="-ml-2 -rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};
