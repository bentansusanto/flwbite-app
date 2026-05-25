"use client";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  ChevronDown,
  ChevronRight,
  Filter,
  History,
  Loader2,
  Package,
  Search
} from "lucide-react";
import { useProductStocks } from "./hooks";
import React, { useMemo, useState } from "react";

export default function ProductStocksPage() {
  const {
    selectedBranchId,
    setSelectedBranchId,
    search,
    setSearch,
    branches,
    filteredStocks, paginatedStocks, currentPage, setCurrentPage, pageSize, setPageSize,
    isLoadingStocks,
    lowStockCount,
    totalValue,
  } = useProductStocks();

  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const groupedStocks = useMemo(() => {
    const groups: Record<string, any> = {};
    paginatedStocks.forEach((stock: any) => {
      const key = stock.product_name;
      if (!groups[key]) {
        groups[key] = {
          id: key, // Use product name as ID for expansion since product_id is missing
          product_name: stock.product_name,
          variants: [],
          total_stock: 0,
          has_low_stock: false
        };
      }
      groups[key].variants.push(stock);
      groups[key].total_stock += stock.actual_stock;
      if (stock.actual_stock <= (stock.min_stock || 5)) {
        groups[key].has_low_stock = true;
      }
    });
    return Object.values(groups);
  }, [filteredStocks]);

  const toggleExpand = (id: string) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Product Stocks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and monitor inventory levels across branches.</p>
        </div>

        {/* Branch Selector */}
        <div className="relative flex h-11 items-center gap-2 bg-white dark:bg-gray-950 px-3 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
          <div className="text-gray-400">
            <Building2 size={18} />
          </div>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="h-full appearance-none bg-transparent border-none py-0 pl-1 pr-8 text-sm font-medium focus:ring-0 text-gray-700 dark:text-white"
          >
            <option value="" disabled>Select Branch</option>
            {branches.map((branch: any) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600">
            <Package size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{filteredStocks.length}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tracked Variants</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600">
            <AlertTriangle size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{lowStockCount}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Low Stock Alerts</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-500/20 text-green-600">
            <ArrowUpRight size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{totalValue}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Units</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-3xl border border-gray-100 bg-white shadow-theme-xs dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md overflow-hidden">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm w-full">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or variants..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-11 rounded-xl border border-transparent bg-gray-50/50 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-white/5 dark:bg-gray-950 dark:text-white/90 dark:placeholder-gray-500"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400">
                <Filter size={16} /> Filter
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-white/[0.03]">
                <th className="whitespace-nowrap w-10 px-5 py-4" />
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Product Name</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Variants</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Total Stock</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoadingStocks ? (
                <tr>
                  <td colSpan={!selectedBranchId ? 6 : 5} className="py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-500" />
                    <p className="mt-2 text-sm text-gray-500">Loading stock data...</p>
                  </td>
                </tr>
              ) : groupedStocks.map((group: any, index: number) => {
                const isExpanded = expandedProductId === group.id;

                return (
                  <React.Fragment key={group.id || `group-${index}`}>
                    <tr className={`group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors ${isExpanded ? 'bg-gray-50/50 dark:bg-white/[0.02]' : ''}`}>
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <button
                          onClick={() => toggleExpand(group.id)}
                          className={`flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800 ${isExpanded ? 'rotate-90 text-brand-500 bg-brand-50 dark:bg-brand-500/10' : ''}`}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                              {group.product_name}
                            </p>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Product</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-gray-100 px-2 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {group.variants.length}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <span className={`text-sm font-bold ${group.has_low_stock ? 'text-error-600' : 'text-gray-700 dark:text-gray-200'}`}>
                          {group.total_stock}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          group.has_low_stock ? 'bg-error-50 text-error-600 dark:bg-error-500/10' :
                          'bg-success-50 text-success-600 dark:bg-success-500/10'
                        }`}>
                          {group.has_low_stock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg dark:hover:bg-brand-500/10 transition-colors">
                            <History size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Variants View */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-gray-50/20 dark:bg-white/[0.01] px-5 pb-5 pt-0">
                          <div className="ml-14 relative border-l-2 border-gray-100 dark:border-white/5">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-gray-400">
                                  <th className="whitespace-nowrap px-6 py-2.5 text-xs font-bold uppercase tracking-wider">Variant Name</th>
                                  {!selectedBranchId && <th className="whitespace-nowrap px-6 py-2.5 text-xs font-bold uppercase tracking-wider">Branch</th>}
                                  <th className="whitespace-nowrap px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-center">Stock</th>
                                  <th className="whitespace-nowrap px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50/50 dark:divide-gray-800/50">
                                {group.variants.map((v: any) => {
                                  const isVLow = v.actual_stock <= (v.min_stock || 5);
                                  return (
                                    <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                      <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">{v.variant_name}</td>
                                      {!selectedBranchId && (
                                        <td className="whitespace-nowrap px-6 py-3">
                                          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-500 bg-brand-50/50 px-2 py-0.5 rounded-md w-fit">
                                            {v.branch_name}
                                          </div>
                                        </td>
                                      )}
                                      <td className="whitespace-nowrap px-6 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200">
                                        {v.actual_stock}
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-3 text-center">
                                        <span className={`inline-flex h-1.5 w-1.5 rounded-full ${isVLow ? 'bg-error-500' : 'bg-success-500'}`} />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {!isLoadingStocks && filteredStocks.length === 0 && (
                <tr>
                  <td colSpan={!selectedBranchId ? 6 : 5} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                        <Package size={26} className="text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-700 dark:text-white/90">No products found</p>
                      <p className="mt-1 text-xs text-gray-400">Try adjusting your search or selected branch.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      {/* Pagination */}
      <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3.5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400">
            {isLoadingStocks ? "Loading..." : filteredStocks.length === 0 ? "0 items" : `${((currentPage - 1) * pageSize) + 1}–${Math.min(currentPage * pageSize, filteredStocks.length)} of ${filteredStocks.length} items`}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="appearance-none h-7 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {[5, 10, 25, 50].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-xs text-gray-400">per page</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronDown size={13} className="rotate-90" />
            <ChevronDown size={13} className="-ml-2 rotate-90" />
          </button>
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronDown size={13} className="rotate-90" />
          </button>
          <div className="flex items-center justify-center px-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            {currentPage} / {Math.ceil(filteredStocks.length / pageSize) || 1}
          </div>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage >= Math.ceil(filteredStocks.length / pageSize)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronDown size={13} className="-rotate-90" />
          </button>
          <button
            onClick={() => setCurrentPage(Math.ceil(filteredStocks.length / pageSize))}
            disabled={currentPage >= Math.ceil(filteredStocks.length / pageSize)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronDown size={13} className="-rotate-90" />
            <ChevronDown size={13} className="-ml-2 -rotate-90" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
