"use client";
import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  RefreshCcw,
  Eye,
  Calendar,
  Building2,
  ChevronDown,
  ArrowUpRight,
  CreditCard,
  Banknote,
  CheckCircle2,
  XCircle,
  Undo2,
  Download,
  Printer,
  Bluetooth
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import { useGetBranchesQuery } from "@/store/api/branchApi";
import { useTransactionFilters, useTransactionActions } from "./hooks";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { useGetTransactionsQuery, Order, useRefundOrderMutation } from "@/store/api/orderApi";
import { useGetProductsQuery } from "@/store/api/productApi";

export default function TransactionHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTrx, setSelectedTrx] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRefundConfirmOpen, setIsRefundConfirmOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  const { data: branchesData, isLoading: isLoadingBranches } = useGetBranchesQuery({});
  const branches = branchesData?.data || [];

  const { data: productsData } = useGetProductsQuery({});
  const products = productsData?.data || [];

  const filterFormik = useTransactionFilters((values) => {
    // Filter logic
  });

  const { data: transactionsData, isLoading: isLoadingTrx, refetch } = useGetTransactionsQuery(filterFormik.values);
  const transactions: Order[] = transactionsData?.data || [];

  const { handlePrintReceipt, isPrintingBt } = useTransactionActions();

  const getOrderTypeBadge = (trx: Order) => {
    const itemTypes = (trx.items || []).map((item: any) => {
      const prod = products.find((p: any) => 
        p.id === item.product_id || 
        (p.variants && p.variants.some((v: any) => v.id === item.variant_id))
      );
      return prod?.type?.toUpperCase();
    }).filter(Boolean);

    const uniqueTypes = Array.from(new Set(itemTypes));

    if (uniqueTypes.length > 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/30">
          Campuran ({uniqueTypes.join(" + ")})
        </span>
      );
    }

    const singleType = uniqueTypes[0] || trx.type?.toUpperCase() || "RETAIL";

    switch (singleType) {
      case "SERVICE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-200/40 dark:border-violet-900/30">
            Service
          </span>
        );
      case "FNB":
      case "F&B":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/30">
            F&B
          </span>
        );
      case "RETAIL":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/40 dark:border-blue-900/30">
            Product
          </span>
        );
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();

  const handleRefund = async () => {
    if (!selectedTrx) return;
    if (!refundReason.trim()) {
      toast.error("Refund reason is required");
      return;
    }
    try {
      await refundOrder({ id: selectedTrx.id, reason: refundReason }).unwrap();
      toast.success(`Transaction ${selectedTrx.order_number} has been refunded.`);
      setIsRefundConfirmOpen(false);
      setIsDetailOpen(false);
      setRefundReason("");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to process refund");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'CANCELLED':
      case 'VOIDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            <Undo2 className="w-3 h-3" />
            Refunded
          </span>
        );
      default:
        return <span className="text-[10px] font-bold uppercase tracking-tight bg-gray-50 text-gray-700 px-2.5 py-1 rounded-lg">{status}</span>;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'CASH': return <Banknote className="w-3.5 h-3.5 text-emerald-500" />;
      case 'QRIS': return <ArrowUpRight className="w-3.5 h-3.5 text-brand-500" />;
      default: return <CreditCard className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  // Pagination Logic
  const filteredTrx = transactions.filter(t =>
    t.order_number.toLowerCase().includes((filterFormik.values.search || "").toLowerCase()) ||
    (t.customer_name || "").toLowerCase().includes((filterFormik.values.search || "").toLowerCase())
  );
  const totalPages = Math.ceil(filteredTrx.length / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredTrx.length);
  const paginatedTrx = filteredTrx.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transaction History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-normal">View and analyze all sales transactions across your business.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            startIcon={<RefreshCcw size={18} />} 
            className="shadow-lg shadow-brand-500/20" 
            onClick={() => refetch()}
            loading={isLoadingTrx}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Transactions</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{transactions.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(transactions.filter(t => !['REFUNDED', 'VOIDED', 'CANCELLED'].includes(t.status.toUpperCase())).reduce((acc, t) => acc + t.final_amount, 0))}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Undo2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Refunds / Cancelled</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {transactions.filter(t => ['REFUNDED', 'VOIDED', 'CANCELLED'].includes(t.status.toUpperCase())).length}
              <span className="text-xs font-medium text-rose-600 ml-1">items</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Search by Order Number or Customer..."
              value={filterFormik.values.search}
              onChange={filterFormik.handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 border border-transparent dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              name="branch_id"
              value={filterFormik.values.branch_id}
              onChange={filterFormik.handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-transparent dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700 dark:text-gray-300"
            >
              <option value="">{isLoadingBranches ? "Loading branches..." : "All Branches"}</option>
              {branches.map((branch: any) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input
              type="date"
              name="start_date"
              value={filterFormik.values.start_date}
              onChange={filterFormik.handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-transparent dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoadingTrx ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 font-medium italic">Fetching transaction history...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order No & Date</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Final Amount</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {paginatedTrx.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{trx.order_number}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                          {new Date(trx.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{trx.customer_name || "Walk-in Customer"}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getOrderTypeBadge(trx)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(trx.final_amount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      {getStatusBadge(trx.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTrx(trx);
                          setIsDetailOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3.5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400 font-medium">
              {filteredTrx.length === 0 ? "0 transactions" : `${startItem}–${endItem} of ${filteredTrx.length} transactions`}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium">Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-7 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 font-bold"
              >
                {[5, 10, 25, 50].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="text-xs text-gray-400 font-medium">per page</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
              title="First page"
            >
              <ChevronDown size={13} className="rotate-90" />
              <ChevronDown size={13} className="-ml-2 rotate-90" />
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
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
                    onClick={() => setCurrentPage(p)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      currentPage === p
                        ? "bg-brand-600 text-white shadow-sm"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="-rotate-90" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:classNamebg-gray-800 disabled:opacity-40 transition-colors"
              title="Last page"
            >
              <ChevronDown size={13} className="-rotate-90" />
              <ChevronDown size={13} className="-ml-2 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} className="max-w-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800 pr-12">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTrx?.order_number}</h3>
                {selectedTrx && getStatusBadge(selectedTrx.status)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                {selectedTrx && new Date(selectedTrx.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-8 bg-gray-50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Customer</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedTrx?.customer_name || "Walk-in Customer"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Type</p>
              <div className="mt-1">
                {selectedTrx && getOrderTypeBadge(selectedTrx)}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Final Amount</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(selectedTrx?.final_amount || 0)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Status</p>
              <div className="mt-1">
                {selectedTrx && getStatusBadge(selectedTrx.status)}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 px-1 uppercase tracking-wider text-xs">Order Items</h4>
            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                    <th className="whitespace-nowrap px-4 py-3">Item Name</th>
                    <th className="whitespace-nowrap px-4 py-3 text-center">Qty</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Price</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {selectedTrx?.items.map((item: any) => (
                    <tr key={item.id} className="text-sm font-medium">
                      <td className="whitespace-nowrap px-4 py-3 text-gray-800 dark:text-gray-200">{item.variant_name || "Unknown Product"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-gray-600 dark:text-gray-400">{item.qty}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-gray-500 dark:text-gray-500">{formatCurrency(item.price)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedTrx?.notes && (
              <div className="mt-4 p-4 bg-orange-50/30 dark:bg-orange-500/5 rounded-2xl border border-dashed border-orange-200/50 dark:border-orange-500/20">
                <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase mb-1.5 tracking-widest">Order Notes</p>
                <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
                  "{selectedTrx.notes}"
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4 mb-8">
            <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(selectedTrx?.total_amount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
              <span>Tax</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(selectedTrx?.tax_amount || 0)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2">
              <span>Total Paid</span>
              <span className="text-brand-600 dark:text-brand-400">{formatCurrency(selectedTrx?.final_amount || 0)}</span>
            </div>
          </div>

          {selectedTrx?.status === 'REFUNDED' && selectedTrx?.refund_reason && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 rounded-2xl">
              <p className="text-[10px] font-bold text-red-500 uppercase mb-1.5 tracking-widest">Refund Reason</p>
              <p className="text-sm font-medium text-red-700 dark:text-red-400 leading-relaxed">{selectedTrx.refund_reason}</p>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
             <Button type="button" variant="outline" className="flex-1 font-bold dark:border-gray-700 dark:text-gray-300" onClick={() => setIsDetailOpen(false)}>Close</Button>
             
             <Button
                type="button"
                variant="outline"
                disabled={isPrintingBt}
                className="flex-1 font-bold border-brand-200 text-brand-700 hover:bg-brand-50 hover:border-brand-300 dark:border-brand-900/50 dark:text-brand-400 dark:hover:bg-brand-900/20"
                startIcon={isPrintingBt ? <span className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-600 rounded-full animate-spin" /> : <Bluetooth size={18} />}
                onClick={() => handlePrintReceipt(selectedTrx)}
              >
                Print Bluetooth
              </Button>

             {['COMPLETED', 'PAID'].includes(selectedTrx?.status?.toUpperCase() || "") && (
               <Button
                type="button"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold"
                startIcon={<Undo2 size={18} />}
                onClick={() => setIsRefundConfirmOpen(true)}
               >
                 Refund Order
               </Button>
             )}
          </div>
        </div>
      </Modal>

      {/* Refund Confirmation Modal */}
      <Modal isOpen={isRefundConfirmOpen} onClose={() => { setIsRefundConfirmOpen(false); setRefundReason(""); }} className="max-w-md">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400 border-4 border-amber-100 dark:border-amber-900/30">
            <Undo2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Process Refund?</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
            This will mark transaction <span className="font-bold text-gray-800 dark:text-gray-200">{selectedTrx?.order_number}</span> as refunded. This action is tracked in the audit log.
          </p>

          <div className="text-left mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Refund <span className="text-red-500">*</span>
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g., Wrong item selected by customer"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none h-24"
            ></textarea>
          </div>

          <div className="flex gap-3">
             <Button variant="outline" className="flex-1 dark:border-gray-700 dark:text-gray-300" onClick={() => { setIsRefundConfirmOpen(false); setRefundReason(""); }} disabled={isRefunding}>Cancel</Button>
             <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20" onClick={handleRefund} disabled={isRefunding || !refundReason.trim()}>
               {isRefunding ? 'Processing...' : 'Confirm Refund'}
             </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
