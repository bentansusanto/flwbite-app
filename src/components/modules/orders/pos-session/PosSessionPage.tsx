"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import {
  History,
  Plus,
  Building2,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Search,
  Filter,
  RefreshCcw,
  XCircle,
  PlayCircle,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useGetBranchesQuery } from "@/store/api/branchApi";
import { useGetSessionByIdQuery, useGetSessionsQuery } from "@/store/api/posSessionApi";
import { toast } from "sonner";
import { closeSessionSchema } from "./schema";

export default function PosSessionPage() {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: branchesData, isLoading: isLoadingBranches } = useGetBranchesQuery({});
  const branches = branchesData?.data || [];

  const { data: sessionsData, isLoading: isLoadingSessions, refetch } = useGetSessionsQuery({
    branch_id: branchFilter || undefined
  });
  const sessions = sessionsData?.data || [];

  // Pagination & Filtering Logic
  const filteredSessions = sessions.filter(s =>
    s.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const activeSessionsCount = sessions.filter(s => s.status.toLowerCase() === 'open').length;

  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = sessions
    .filter(s => s.start_time.startsWith(today))
    .reduce((acc, s) => acc + (s.expected_cash - s.opening_balance), 0);

  const totalCashOnHand = sessions
    .filter(s => s.status.toLowerCase() === 'open')
    .reduce((acc, s) => acc + s.expected_cash, 0);

  const totalPages = Math.ceil(filteredSessions.length / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredSessions.length);
  const paginatedSessions = filteredSessions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRefresh = () => {
    refetch();
    toast.success("Data refreshed");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            <CheckCircle2 className="w-3 h-3" />
            TUTUP
          </span>
        );
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
            <PlayCircle className="w-3 h-3" />
            BUKA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-[#06060a] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            POS Sessions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-normal">Monitor and manage cashier shifts and daily cash flow.</p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Active Sessions</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{activeSessionsCount} <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 ml-1">Across branches</span></p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Today's Revenue</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(todayRevenue)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Cash On Hand</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCashOnHand)}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by staff name or session ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 border border-transparent dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-transparent dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer dark:text-gray-300"
          >
            <option value="">{isLoadingBranches ? "Loading branches..." : "All Branches"}</option>
            {branches.map((branch: any) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session & Staff</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shift Timing</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Cash Movement</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoadingSessions ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading sessions...</td>
                </tr>
              ) : paginatedSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">No sessions found</td>
                </tr>
              ) : paginatedSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{session.id}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{session.user_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800 px-2 py-1 rounded-md w-fit text-xs font-bold">
                      <Building2 className="w-3.5 h-3.5" />
                      {session.branch_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                        <Clock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                        {new Date(session.start_time).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </div>
                      {session.end_time && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <XCircle className="w-3.5 h-3.5 text-gray-300" />
                          {new Date(session.end_time).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Revenue</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(session.expected_cash - session.opening_balance)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(session.status.toLowerCase())}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button
                         onClick={() => {
                           setSelectedSessionId(session.id);
                           setIsDetailModalOpen(true);
                         }}
                         className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                       >
                         <Eye className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination — consistent with Products */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3.5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400 font-medium">
              {filteredSessions.length === 0 ? "0 sessions" : `${startItem}–${endItem} of ${filteredSessions.length} sessions`}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium">Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-7 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-indigo-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 font-bold"
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
                        ? "bg-indigo-600 text-white shadow-sm"
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
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
              title="Last page"
            >
              <ChevronDown size={13} className="-rotate-90" />
              <ChevronDown size={13} className="-ml-2 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      <SessionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSessionId(null);
        }}
        sessionId={selectedSessionId}
      />
    </div>
  );
}

function SessionDetailModal({ isOpen, onClose, sessionId }: { isOpen: boolean; onClose: () => void; sessionId: string | null }) {
  const { data: sessionData, isLoading } = useGetSessionByIdQuery(sessionId || "", {
    skip: !sessionId || !isOpen,
  });
  const session = sessionData?.data;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl" isScrollable>
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-8 py-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detail Sesi POS</h3>
                {session?.status === 'OPEN' ? (
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold border border-emerald-100 dark:border-emerald-500/20">BUKA</span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-[10px] font-bold border border-gray-200 dark:border-gray-700">TUTUP</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Informasi lengkap transaksi dan shift kasir.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6">

        {isLoading ? (
          <div className="py-20 text-center text-gray-400">Memuat detail...</div>
        ) : !session ? (
          <div className="py-20 text-center text-rose-500">Gagal memuat data sesi.</div>
        ) : (
          <div className="space-y-8">
            {/* Time & Personnel */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white border-l-4 border-indigo-500 pl-3">Waktu & Personel</h4>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg"><Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Buka Sesi</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(session.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg"><XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Tutup Sesi</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {session.end_time ? new Date(session.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':') : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"><Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Kasir</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{session.user_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"><Building2 className="w-4 h-4 text-gray-600 dark:text-gray-400" /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Cabang</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{session.branch_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            {session.payment_methods && Object.keys(session.payment_methods).length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white border-l-4 border-amber-500 pl-3">Metode Pembayaran</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(session.payment_methods).map(([method, amount]: [string, any]) => (
                    <div key={method} className="p-4 bg-white dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                          <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">{method}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financials */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white border-l-4 border-emerald-500 pl-3">Rekonsiliasi Kas</h4>
              <div className="bg-white dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Saldo Awal</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(session.opening_balance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Total Penjualan (Revenue)</span>
                    <span className={`font-semibold ${session.expected_cash - session.opening_balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {session.expected_cash - session.opening_balance >= 0 ? "+" : ""}{formatCurrency(session.expected_cash - session.opening_balance)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Ekspektasi Kas (Total)</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(session.expected_cash)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Input Kas Fisik (Saat Tutup)</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(session.closing_balance)}</span>
                  </div>
                  <div className={`mt-6 p-4 rounded-2xl flex justify-between items-center transition-all ${
                    session.difference === 0
                      ? 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                      : session.difference < 0
                        ? 'bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400'
                        : 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        session.difference === 0 ? 'bg-white dark:bg-gray-700' : 'bg-white/60 dark:bg-gray-700/60'
                      }`}>
                        <AlertCircle className={`w-5 h-5 ${
                          session.difference === 0 ? 'text-gray-400 dark:text-gray-500' : session.difference < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Selisih Kas</span>
                        <p className="text-sm font-bold leading-tight">DIFFERENCE</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold tracking-tight">
                      {session.difference > 0 ? "+" : ""}{formatCurrency(session.difference)}
                    </span>
                  </div>
                </div>
                {session.notes && (
                  <div className="p-5 bg-indigo-50/30 dark:bg-indigo-500/5 border-t border-indigo-100/50 dark:border-indigo-900/30">
                    <div className="flex items-start gap-3">
                      <div className="mt-1"><History className="w-3.5 h-3.5 text-indigo-400" /></div>
                      <div className="italic text-sm text-indigo-900/70 dark:text-indigo-300/70">
                        <p className="font-bold text-[10px] uppercase not-italic text-indigo-400 mb-1 tracking-widest">Catatan Sesi</p>
                        "{session.notes}"
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
