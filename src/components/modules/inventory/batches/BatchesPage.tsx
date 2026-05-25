"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import {
  Boxes,
  Search,
  Filter,
  Plus,
  Calendar,
  Eye,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Tag,
  Package,
  History,
  Edit
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

// Mock Data
const MOCK_BATCHES = [
  { 
    id: "BCH-001", 
    product: "Espresso Beans", 
    variant: "Arabica 1kg",
    sku: "EB-ARB-001",
    lot_number: "LOT-2024-X1",
    production_date: "2024-04-01",
    expiry_date: "2025-04-01",
    quantity: 50,
    unit: "kg",
    status: "active"
  },
  { 
    id: "BCH-002", 
    product: "Fresh Milk", 
    variant: "Diamond 1L",
    sku: "MILK-D-001",
    lot_number: "D-998822",
    production_date: "2024-05-08",
    expiry_date: "2024-05-15",
    quantity: 12,
    unit: "pcs",
    status: "expiring_soon"
  },
];

export default function BatchesPage() {
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  
  const [form, setForm] = useState({
    product_id: "",
    variant_id: "",
    lot_number: "",
    production_date: "",
    expiry_date: "",
    quantity: 0,
    unit: "pcs"
  });

  const handleOpenCreate = () => {
    setEditingBatch(null);
    setForm({
      product_id: "",
      variant_id: "",
      lot_number: "",
      production_date: "",
      expiry_date: "",
      quantity: 0,
      unit: "pcs"
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (batch: any) => {
    setEditingBatch(batch);
    setForm({
      product_id: batch.id,
      variant_id: batch.variant,
      lot_number: batch.lot_number,
      production_date: batch.production_date,
      expiry_date: batch.expiry_date,
      quantity: batch.quantity,
      unit: batch.unit
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save
    setIsFormModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        );
      case 'expiring_soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-amber-50 text-amber-700">
            <AlertCircle className="w-3 h-3" />
            Expiring Soon
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-rose-50 text-rose-700">
            <AlertCircle className="w-3 h-3" />
            Expired
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

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            Product Batches
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage product lots, production dates, and expiry tracking.</p>
        </div>

        <Button onClick={handleOpenCreate} startIcon={<Plus size={18} />} className="shadow-lg shadow-brand-200">
          New Batch
        </Button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Batches</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">42</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Healthy</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">38</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Warning</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">3</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Expired</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">1</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md rounded-3xl shadow-theme-xs border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm w-full">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product, SKU, or lot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 rounded-xl border border-transparent bg-gray-50/50 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-white/5 dark:bg-gray-950 dark:text-white/90 dark:placeholder-gray-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
               <div className="relative">
                 <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <select className="h-11 rounded-xl border border-gray-200 bg-white pl-9 pr-10 text-sm font-medium outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 appearance-none">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="expiring_soon">Expiring Soon</option>
                    <option value="expired">Expired</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
               </div>
               
               <button onClick={() => setSearch("")} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 h-11 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 transition-colors">
                 <RefreshCcw size={16} /> Reset
               </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lot Number</th>
                <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Production</th>
                <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Expiry</th>
                <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">In-Stock</th>
                <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {MOCK_BATCHES.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                         <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{batch.product}</p>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-tight">{batch.variant}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-1.5 text-brand-600 bg-brand-50/50 px-2 py-1 rounded-md w-fit">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold uppercase">{batch.lot_number}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <p className="text-sm font-semibold text-gray-700">{new Date(batch.production_date).toLocaleDateString('id-ID')}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                     <div className="flex flex-col items-center">
                        <p className={`text-sm font-bold ${batch.status === 'expiring_soon' ? 'text-amber-600' : batch.status === 'expired' ? 'text-rose-600' : 'text-gray-700'}`}>
                          {new Date(batch.expiry_date).toLocaleDateString('id-ID')}
                        </p>
                        {batch.status === 'expiring_soon' && <span className="text-[10px] font-medium text-amber-500">Expiring in 7 days</span>}
                     </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <p className="text-sm font-bold text-gray-900">{batch.quantity} <span className="text-xs font-medium text-gray-400">{batch.unit}</span></p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    {getStatusBadge(batch.status)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                         onClick={() => handleOpenEdit(batch)}
                         className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                         title="Edit Batch"
                      >
                         <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => setSelectedBatch(batch)}
                        className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                        title="Batch Detail"
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
      </div>

      {/* Form Modal */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} className="max-w-xl">
        <div className="p-4 sm:p-6 dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 pr-12">
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{editingBatch ? 'Edit Batch' : 'Create New Batch'}</h3>
              <p className="text-sm text-gray-500 font-medium">Please fill in the batch information.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label required>Product / Variant</Label>
              <select 
                className="appearance-none w-full h-11 pr-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                value={form.product_id}
                onChange={e => setForm({...form, product_id: e.target.value})}
                required
              >
                <option value="">Select Product...</option>
                <option value="1">Espresso Beans (Arabica 1kg)</option>
                <option value="2">Fresh Milk (Diamond 1L)</option>
              </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <Label required>Lot Number / Batch ID</Label>
              <InputField 
                placeholder="e.g. LOT-2024-X1" 
                value={form.lot_number}
                onChange={e => setForm({...form, lot_number: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label required>Production Date</Label>
                <InputField 
                  type="date"
                  value={form.production_date}
                  onChange={e => setForm({...form, production_date: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label required>Expiry Date</Label>
                <InputField 
                  type="date"
                  value={form.expiry_date}
                  onChange={e => setForm({...form, expiry_date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label required>Initial Quantity</Label>
                <InputField 
                  type="number"
                  placeholder="0"
                  value={form.quantity}
                  onChange={e => setForm({...form, quantity: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-1">
                <Label required>Unit</Label>
                <select 
                  className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  value={form.unit}
                  onChange={e => setForm({...form, unit: e.target.value})}
                  required
                >
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="liter">liter</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">
                {editingBatch ? 'Save Changes' : 'Create Batch'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedBatch} onClose={() => setSelectedBatch(null)} className="max-w-lg">
        <div className="p-4 sm:p-6 dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 pr-12">
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center">
              <Boxes className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Batch Details</h3>
              <p className="text-sm text-gray-500 font-medium">Tracking and quality information.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
               <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <Package className="w-8 h-8 text-brand-200" />
               </div>
               <div>
                  <p className="text-lg font-bold text-gray-900">{selectedBatch?.product}</p>
                  <p className="text-sm font-semibold text-gray-500">{selectedBatch?.variant}</p>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">SKU: {selectedBatch?.sku}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lot Number</p>
                <div className="text-sm font-bold text-brand-600 uppercase">{selectedBatch?.lot_number}</div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Stock</p>
                <div className="text-sm font-bold text-gray-900">{selectedBatch?.quantity} {selectedBatch?.unit}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Production Date</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {selectedBatch && new Date(selectedBatch.production_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry Date</p>
                <div className="flex items-center gap-2 text-sm font-bold text-rose-600">
                  <Calendar className="w-4 h-4 text-rose-300" />
                  {selectedBatch && new Date(selectedBatch.expiry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                <div>{selectedBatch && getStatusBadge(selectedBatch.status)}</div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
             <Button variant="outline" className="flex-1" onClick={() => setSelectedBatch(null)}>Close</Button>
             <Button className="flex-1">Manage Stock</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
