"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useGetTransactionsQuery } from "@/store/api/orderApi";
import { formatCurrency } from "../../utils/format";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowUpIcon } from "@/icons";

export default function RecentOrders() {
  const { data: trxData, isLoading } = useGetTransactionsQuery({ 
    page: 1, 
    limit: 7 
  });

  const transactions = trxData?.data || [];

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-theme-sm px-4 pb-3 pt-4 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-12 bg-gray-50 dark:bg-gray-800/50 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-theme-sm px-4 pb-3 pt-4 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white/90">
          Pesanan Terbaru
        </h3>
        <Link 
          href="/reports/sales" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Lihat Semua Laporan
          <ArrowUpIcon className="rotate-90 w-3 h-3" />
        </Link>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-white/5 border-y bg-gray-50/50 dark:bg-white/[0.03]">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 whitespace-nowrap font-bold text-slate-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">ID Pesanan</TableCell>
              <TableCell isHeader className="px-4 py-3 whitespace-nowrap font-bold text-slate-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">Pelanggan</TableCell>
              <TableCell isHeader className="px-4 py-3 whitespace-nowrap font-bold text-slate-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">Harga</TableCell>
              <TableCell isHeader className="px-4 py-3 whitespace-nowrap font-bold text-slate-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">Tanggal</TableCell>
              <TableCell isHeader className="px-4 py-3 whitespace-nowrap font-bold text-slate-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
            {transactions.map((trx: any) => (
              <TableRow key={trx.id}>
                <TableCell className="px-4 py-3 whitespace-nowrap font-medium text-gray-800 text-theme-sm dark:text-white/90">{trx.order_number}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">{trx.customer_name || "Tamu"}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap font-medium text-gray-800 text-theme-sm dark:text-white/90">{formatCurrency(trx.total_amount)}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-gray-500 text-theme-sm dark:text-gray-400">{format(new Date(trx.created_at), "dd MMM HH:mm")}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Badge size="sm" color={trx.status === "PAID" || trx.status === "COMPLETED" ? "success" : trx.status === "PENDING" ? "warning" : "error"}>
                    {trx.status === "PAID" ? "DIBAYAR" : trx.status === "COMPLETED" ? "SELESAI" : trx.status === "PENDING" ? "TERTUNDA" : trx.status === "FAILED" ? "GAGAL" : trx.status === "CANCELED" ? "DIBATALKAN" : trx.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
