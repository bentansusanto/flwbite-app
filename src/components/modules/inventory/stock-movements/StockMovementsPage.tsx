"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  Building2,
  Calendar,
  Loader2,
  FileText,
  Eye
} from "lucide-react";
import { useStockMovements } from "./hooks";
import { format } from "date-fns";

export default function StockMovementsPage() {
  const {
    selectedBranchId,
    setSelectedBranchId,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    branches,
    isLoadingBranches,
    filteredMovements,
    isLoadingMovements,
    isFetchingMovements
  } = useStockMovements();
  const [selectedMovement, setSelectedMovement] = useState<any>(null);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-[#06060a] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Stock Movements
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track every inventory change across your branches.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="pl-9 pr-10 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-white/5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none shadow-sm cursor-pointer min-w-[200px] dark:text-white"
            >
              <option value="">Select Branch</option>
              {branches.map((branch: any) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product, variant, or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 border border-transparent dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 dark:text-gray-300 border border-transparent dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
            <option value="ADJUST">Adjustment</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>

        <button 
           className="flex items-center justify-center gap-2 px-4 py-2.5 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
           onClick={() => window.location.reload()}
        >
          <RefreshCcw className={`w-4 h-4 ${(isLoadingMovements || isFetchingMovements) ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product / Variant</th>
                {!selectedBranchId && <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</th>}
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Quantity</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoadingMovements ? (
                <tr>
                  <td colSpan={!selectedBranchId ? 7 : 6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                      <p className="text-gray-500 font-medium text-lg italic">Loading movements...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMovements.length > 0 ? (
                filteredMovements.map((m: any) => (
                  <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {format(new Date(m.created_at), "dd MMM yyyy")}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {format(new Date(m.created_at), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{m.product_name || "N/A"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{m.variant_name || "N/A"}</p>
                    </td>
                    {!selectedBranchId && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 px-2 py-1 rounded-md w-fit">
                          <Building2 className="w-3.5 h-3.5" />
                          {m.branch_name || "All Branches"}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-tight
                        ${m.type === 'IN' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          m.type === 'OUT' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' : 
                          'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}
                      `}>
                        {m.type === 'IN' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {m.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold">
                      <span className={m.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {m.type === 'IN' ? '+' : '-'}{Math.abs(m.quantity)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 px-2 py-1 rounded-md w-fit">
                        <FileText className="w-3.5 h-3.5" />
                        {m.reference_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedMovement(m)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={!selectedBranchId ? 7 : 6} className="px-6 py-32 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                         <History className="w-10 h-10 text-gray-200" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-600">No movements found</p>
                        <p className="text-sm">Try adjusting your filters or select a branch.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedMovement} onClose={() => setSelectedMovement(null)} className="max-w-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center">
              <History className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Movement Details</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive information for this transaction.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</p>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {selectedMovement && format(new Date(selectedMovement.created_at), "dd MMM yyyy, HH:mm")}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Branch</p>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {selectedMovement?.branch_name || "All Branches"}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product / Variant</p>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedMovement?.product_name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{selectedMovement?.variant_name}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200/50">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase
                    ${selectedMovement?.type === 'IN' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                      selectedMovement?.type === 'OUT' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' : 
                      'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}
                  `}>
                    {selectedMovement?.type}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantity</p>
                  <p className={`text-sm font-bold ${selectedMovement?.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {selectedMovement?.type === 'IN' ? '+' : '-'}{Math.abs(selectedMovement?.quantity || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reference</p>
                <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-xl w-fit">
                  <FileText className="w-4 h-4" />
                  {selectedMovement?.reference_type}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Note</p>
                <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-300 italic">
                  {selectedMovement?.note || "No notes available for this movement."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
