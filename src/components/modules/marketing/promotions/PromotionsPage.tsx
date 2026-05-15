"use client";
import React, { useState, useMemo } from "react";
import {
  Search, Plus, Trash2, Edit,
  Tag, Calendar, Clock, Image as ImageIcon,
  CheckCircle2, AlertCircle, Percent, Megaphone
} from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";

// Mock Data
const MOCK_PROMOS = [
  { id: "1", name: "Summer Sale", code: "SUMMER20", discount: "20%", start_date: "2024-06-01", end_date: "2024-08-31", status: "active", description: "Diskon musim panas untuk semua item retail." },
  { id: "2", name: "Weekend Special", code: "WEEKEND10", discount: "10%", start_date: "2024-05-01", end_date: "2024-12-31", status: "active", description: "Khusus untuk transaksi di hari Sabtu & Minggu." },
  { id: "3", name: "New User Promo", code: "HELLOFLW", discount: "50rb", start_date: "2024-01-01", end_date: "2024-12-31", status: "expired", description: "Potongan harga untuk pengguna baru." },
];

export default function PromotionsPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", discount: "", start_date: "", end_date: "", status: "active", description: "" });

  const filtered = useMemo(() => {
    return MOCK_PROMOS.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const openModal = (promo?: any) => {
    if (promo) {
      setEditId(promo.id);
      setForm({ ...promo });
    } else {
      setEditId(null);
      setForm({ name: "", code: "", discount: "", start_date: "", end_date: "", status: "active", description: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Promosi berhasil ${editId ? "diperbarui" : "ditambahkan"}`);
    setModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-[#06060a] min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Promotions</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create and manage marketing campaigns and discount codes.</p>
        </div>
        <Button onClick={() => openModal()} startIcon={<Plus size={18} />}>
          New Promotion
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600">
            <Megaphone size={20} />
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">{MOCK_PROMOS.length}</p>
          <p className="text-xs font-medium text-gray-500">Total Campaigns</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-500/20 text-green-600">
            <CheckCircle2 size={20} />
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">{MOCK_PROMOS.filter(p => p.status === "active").length}</p>
          <p className="text-xs font-medium text-gray-500">Active Now</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600">
            <AlertCircle size={20} />
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">{MOCK_PROMOS.filter(p => p.status === "expired").length}</p>
          <p className="text-xs font-medium text-gray-500">Expired</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-11 rounded-xl border border-transparent bg-gray-50/50 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-white/5 dark:bg-gray-950 dark:text-white/90 dark:placeholder-gray-500"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(promo => (
          <div key={promo.id} className="group flex flex-col rounded-2xl border border-gray-100 bg-white transition-all hover:border-brand-100 hover:shadow-theme-xl dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400 dark:bg-gray-800 transition-colors group-hover:bg-brand-50 group-hover:text-brand-500">
                  <Tag size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(promo)} className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => setDeleteId(promo.id)} className="p-1.5 text-gray-400 hover:text-error-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">{promo.name}</h4>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    promo.status === "active" ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                  }`}>
                    {promo.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">{promo.description}</p>
              </div>

              <div className="mt-6 flex flex-col gap-3 rounded-xl border border-gray-50 bg-gray-50/30 p-4 dark:border-gray-800/50 dark:bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Promo Code</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">{promo.code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Discount</span>
                  <span className="text-lg font-semibold text-brand-600 dark:text-brand-400">{promo.discount}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t border-gray-50 pt-4 dark:border-gray-800">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-gray-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12} /> Validity</span>
                  <span className="text-gray-600 dark:text-gray-300">Until {new Date(promo.end_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-xl">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <h4 className="text-base font-bold text-gray-800 dark:text-white/90">{editId ? "Edit Promotion" : "Create New Campaign"}</h4>
          <p className="text-sm text-gray-400">Configure your campaign details and discount rules.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Campaign Name</Label>
              <InputField placeholder="e.g. Summer Sale" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <Label required>Promo Code</Label>
              <InputField placeholder="e.g. SUMMER20" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Discount Value</Label>
              <InputField placeholder="e.g. 20% or 50000" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} />
            </div>
            <div>
              <Label required>Status</Label>
              <select 
                value={form.status} 
                onChange={e => setForm({...form, status: e.target.value})}
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Start Date</Label>
              <InputField type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            </div>
            <div>
              <Label required>End Date</Label>
              <InputField type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
            </div>
          </div>
          <div>
            <Label>Campaign Description</Label>
            <TextArea placeholder="Describe your campaign..." value={form.description} onChange={val => setForm({...form, description: val})} />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">{editId ? "Update" : "Launch Campaign"}</Button>
          </div>
        </form>
      </Modal>

      <AlertDialog 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={async () => { toast.success("Promotion deleted"); setDeleteId(null); }}
        title="Delete Campaign?"
        description="This will permanently end this campaign and deactivate the promo code. Continue?"
        variant="danger"
      />
    </div>
  );
}
