"use client";
import React, { useState, useMemo } from "react";
import {
  Search, Plus, Trash2, UserCheck, UserX, Edit,
  Mail, Phone, Calendar, Users, Star, ArrowUpRight, UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

// Mock Data
const MOCK_CUSTOMERS = [
  { id: "1", name: "John Doe", email: "john@example.com", phone: "08123456789", points: 1250, status: "active", joined_at: "2024-01-15" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", phone: "08987654321", points: 450, status: "active", joined_at: "2024-02-10" },
  { id: "3", name: "Michael Brown", email: "michael@example.com", phone: "08112233445", points: 0, status: "inactive", joined_at: "2024-03-01" },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", status: "active" });

  const filtered = useMemo(() => {
    return MOCK_CUSTOMERS.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    );
  }, [search]);

  const openModal = (customer?: any) => {
    if (customer) {
      setEditId(customer.id);
      setForm({ name: customer.name, email: customer.email, phone: customer.phone, status: customer.status });
    } else {
      setEditId(null);
      setForm({ name: "", email: "", phone: "", status: "active" });
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Customer berhasil ${editId ? "diperbarui" : "ditambahkan"}`);
    setModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-[#06060a] min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Customers</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your customer relationships and loyalty programs.</p>
        </div>
        <Button onClick={() => openModal()} startIcon={<Plus size={18} />}>
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-500/20 text-brand-600">
            <Users size={20} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">{MOCK_CUSTOMERS.length}</p>
              <p className="text-xs font-medium text-gray-500">Total Customers</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-success-600 bg-success-50 px-2 py-1 rounded-full">
              <ArrowUpRight size={12} /> 12%
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-500/20 text-green-600">
            <UserCheck size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{MOCK_CUSTOMERS.filter(c => c.status === "active").length}</p>
            <p className="text-xs font-medium text-gray-500">Active Customers</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600">
            <Star size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">1,250</p>
            <p className="text-xs font-medium text-gray-500">Avg. Loyalty Points</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-3xl border border-gray-100 bg-white shadow-theme-xs dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md overflow-hidden">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 rounded-xl border border-transparent bg-gray-50/50 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-white/5 dark:bg-gray-950 dark:text-white/90 dark:placeholder-gray-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-white/[0.03]">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Contact</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Loyalty Points</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Joined Date</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map(customer => (
                <tr key={customer.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 font-bold dark:bg-brand-500/10">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{customer.name}</p>
                        <p className="text-xs text-gray-400">ID: #{customer.id.padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Mail size={13} className="text-gray-400" /> {customer.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Phone size={13} className="text-gray-400" /> {customer.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                      <Star size={12} /> {customer.points.toLocaleString()} pts
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={14} className="text-gray-400" /> {new Date(customer.joined_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      customer.status === "active"
                        ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${customer.status === "active" ? "bg-success-500" : "bg-gray-400"}`} />
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(customer)} className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg dark:hover:bg-brand-500/10 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setDeleteId(customer.id)} className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 rounded-lg dark:hover:bg-error-500/10 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-lg">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
              <UserPlus size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-800 dark:text-white/90">{editId ? "Edit Customer" : "Add New Customer"}</h4>
              <p className="text-sm text-gray-400">Complete the information below.</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <Label required>Full Name</Label>
            <InputField placeholder="e.g. John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Email Address</Label>
              <InputField type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <Label required>Phone Number</Label>
              <InputField placeholder="08123456xxx" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">{editId ? "Update Customer" : "Create Customer"}</Button>
          </div>
        </form>
      </Modal>

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => { toast.success("Customer deleted"); setDeleteId(null); }}
        title="Delete Customer?"
        description="Are you sure you want to delete this customer? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}
