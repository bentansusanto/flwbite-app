"use client";
import React, { useState, useMemo } from "react";
import {
  Search, Plus, Star, ArrowUpRight, History, 
  Settings2, Gift, TrendingUp, Filter, Users,
  Coins, Wallet, ArrowDownRight
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

// Mock Data
const MOCK_HISTORY = [
  { id: "1", customer: "John Doe", type: "earn", amount: 150, description: "Purchase #ORD-8823", date: "2024-05-07 10:30" },
  { id: "2", customer: "Jane Smith", type: "redeem", amount: 500, description: "Redeem Voucher 50k", date: "2024-05-06 14:20" },
  { id: "3", customer: "Budi Santoso", type: "earn", amount: 25, description: "Purchase #ORD-8810", date: "2024-05-06 09:15" },
];

export default function LoyaltyPointsPage() {
  const [search, setSearch] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState({ earning_rate: "1000", redemption_value: "10" });

  const stats = [
    { label: "Total Poin Diberikan", value: "1,250,400", icon: <Coins size={20} />, color: "text-brand-600", bg: "bg-brand-100", trend: "+8.2%" },
    { label: "Poin Ditukar", value: "450,200", icon: <Gift size={20} />, color: "text-purple-600", bg: "bg-purple-100", trend: "+12.5%" },
    { label: "Poin Beredar", value: "800,200", icon: <Wallet size={20} />, color: "text-amber-600", bg: "bg-amber-100", trend: "-2.4%" },
  ];

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Konfigurasi Loyalty berhasil disimpan");
    setIsConfigOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Poin Loyalitas</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Atur hadiah poin dan lacak keterlibatan loyalitas pelanggan.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsConfigOpen(true)} startIcon={<Settings2 size={18} />}>
            Konfigurasi Aturan
          </Button>
          <Button startIcon={<Plus size={18} />}>
            Penyesuaian Manual
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.color} dark:bg-opacity-20`}>
              {item.icon}
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold text-gray-800 dark:text-white">{item.value}</p>
                <p className="text-xs font-medium text-gray-500">{item.label}</p>
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${
                item.trend.startsWith('+') ? 'bg-success-50 text-success-600' : 'bg-red-50 text-red-600'
              }`}>
                {item.trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {item.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Settings Summary Banner */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-900/30 dark:bg-brand-500/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-brand-700 dark:text-brand-400">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Tingkat Perolehan Saat Ini</p>
              <p className="text-sm font-bold">Rp {parseInt(config.earning_rate).toLocaleString()} dibelanjakan = 1 Poin didapatkan</p>
            </div>
          </div>
          <div className="h-10 w-px bg-brand-200 hidden sm:block dark:bg-brand-800" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
              <Gift size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Nilai Penukaran</p>
              <p className="text-sm font-bold">1 Poin = Rp {parseInt(config.redemption_value).toLocaleString()} diskon</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-3xl border border-gray-100 bg-white shadow-theme-xs dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <History size={18} className="text-gray-400" />
            <h4 className="font-bold text-gray-800 dark:text-white/90">Transaksi Poin Terbaru</h4>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari pelanggan..." 
                className="h-9 w-48 rounded-lg border border-transparent pl-9 pr-4 text-xs outline-none focus:border-brand-300 dark:border-white/5 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm"
              />
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400">
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Aktivitas</th>
                <th className="px-6 py-4 text-right">Perubahan Poin</th>
                <th className="px-6 py-4 text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {MOCK_HISTORY.map(row => (
                <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500 dark:bg-gray-800">
                        {row.customer.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-white/90">{row.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{row.description}</td>
                  <td className={`px-6 py-4 text-right font-semibold text-sm ${row.type === 'earn' ? 'text-success-600' : 'text-red-600'}`}>
                    {row.type === 'earn' ? '+' : '-'}{row.amount}
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-gray-400">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Config Modal */}
      <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} className="max-w-md">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
              <Settings2 size={20} />
            </div>
            <h4 className="text-base font-bold text-gray-800 dark:text-white/90">Aturan Loyalitas</h4>
          </div>
        </div>
        <form onSubmit={handleSaveConfig} className="p-5 space-y-5">
          <div className="space-y-3">
            <Label>Tingkat Perolehan (IDR per 1 poin)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
              <InputField className="pl-12" value={config.earning_rate} onChange={e => setConfig({...config, earning_rate: e.target.value})} />
            </div>
            <p className="text-[11px] text-gray-400">Atur berapa Rupiah yang harus dibelanjakan pelanggan untuk mendapatkan 1 poin loyalitas.</p>
          </div>
          <div className="space-y-3 pt-2">
            <Label>Nilai Penukaran (IDR per 1 poin)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
              <InputField className="pl-12" value={config.redemption_value} onChange={e => setConfig({...config, redemption_value: e.target.value})} />
            </div>
            <p className="text-[11px] text-gray-400">Atur nilai diskon untuk setiap 1 poin yang ditukarkan.</p>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsConfigOpen(false)}>Batal</Button>
            <Button type="submit" className="flex-1">Simpan Konfigurasi</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
