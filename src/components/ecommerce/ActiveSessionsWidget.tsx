"use client";
import React from "react";
import { useGetSessionsQuery } from "@/store/api/posSessionApi";
import { formatCurrency } from "../../utils/format";
import { format } from "date-fns";
import { StoreIcon, UserCircleIcon } from "lucide-react";
import Link from "next/link";
import { ArrowUpIcon } from "@/icons";

export default function ActiveSessionsWidget() {
  const { data: sessionsData, isLoading } = useGetSessionsQuery({});

  // Filter only OPEN sessions and take the first few
  const activeSessions = (sessionsData?.data || []).filter(s => s.status === "OPEN");

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-theme-sm px-4 pb-3 pt-4 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md sm:px-6 h-full flex flex-col">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-theme-sm p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white/90">
          Sesi Kasir Aktif
        </h3>
        <Link 
          href="/orders/new" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Buka POS
          <ArrowUpIcon className="rotate-90 w-3 h-3" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
        {activeSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
              <StoreIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Tidak ada sesi aktif</p>
            <p className="text-xs text-gray-500 mt-1">Belum ada kasir yang membuka sesi hari ini.</p>
          </div>
        ) : (
          activeSessions.map((session) => (
            <div 
              key={session.id} 
              className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center shrink-0">
                    <UserCircleIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{session.user_name}</p>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{session.branch_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    ACTIVE
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">Mulai</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {format(new Date(session.start_time), "HH:mm")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 mb-0.5">Saldo Awal</p>
                  <p className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    {formatCurrency(session.opening_balance)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
