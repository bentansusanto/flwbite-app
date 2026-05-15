"use client";
import React, { useState, useMemo } from "react";
import {
  Search, Plus, Trash2, Edit,
  Percent, FileText, CheckCircle2, XCircle, Info, Calculator
} from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";

// Mock Data
const MOCK_TAXES = [
  { id: "1", name: "VAT (PPN)", rate: 11, type: "percentage", status: "active", description: "Value Added Tax applicable for all items." },
  { id: "2", name: "Service Charge", rate: 5, type: "percentage", status: "active", description: "Standard service charge for dine-in." },
  { id: "3", name: "Pajak Daerah", rate: 10, type: "percentage", status: "inactive", description: "Local government tax for specific products." },
];

export default function TaxesPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", rate: "", status: "active", description: "" });

  const filtered = useMemo(() => {
    return MOCK_TAXES.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const openModal = (tax?: any) => {
    if (tax) {
      setEditId(tax.id);
      setForm({ name: tax.name, rate: tax.rate.toString(), status: tax.status, description: tax.description });
    } else {
      setEditId(null);
      setForm({ name: "", rate: "", status: "active", description: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Pajak berhasil ${editId ? "diperbarui" : "ditambahkan"}`);
    setModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-[#06060a] min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Taxes</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure and manage tax rates for your business.</p>
        </div>
        <Button onClick={() => openModal()} startIcon={<Plus size={18} />}>
          Add Tax
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search tax rules..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-11 rounded-xl border border-transparent bg-gray-50/50 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-white/5 dark:bg-gray-950 dark:text-white/90 dark:placeholder-gray-500"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(tax => (
          <div key={tax.id} className="group relative rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-brand-100 hover:shadow-theme-xl dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                <Percent size={24} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(tax)} className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => setDeleteId(tax.id)} className="p-1.5 text-gray-400 hover:text-error-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-800 dark:text-white/90">{tax.name}</h4>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  tax.status === "active" ? "bg-success-50 text-success-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {tax.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">{tax.description}</p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-gray-800">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Rate</span>
                <span className="mt-0.5 text-xl font-semibold text-brand-600 dark:text-brand-400">{tax.rate}%</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400 dark:bg-gray-800">
                <Info size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-lg">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <h4 className="text-base font-bold text-gray-800 dark:text-white/90">{editId ? "Edit Tax Rule" : "Create New Tax"}</h4>
          <p className="text-sm text-gray-400">Specify tax name and percentage rate.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <Label required>Tax Name</Label>
            <InputField placeholder="e.g. VAT (PPN)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <Label required>Rate (%)</Label>
            <InputField type="number" placeholder="0" value={form.rate} onChange={e => setForm({...form, rate: e.target.value})} />
          </div>
          <div>
            <Label>Description</Label>
            <TextArea placeholder="Explain what this tax is for..." value={form.description} onChange={val => setForm({...form, description: val})} />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">{editId ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>

      <AlertDialog 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={async () => { toast.success("Tax rule deleted"); setDeleteId(null); }}
        title="Delete Tax Rule?"
        description="This will remove the tax from all future transactions. Are you sure?"
        variant="danger"
      />
    </div>
  );
}
