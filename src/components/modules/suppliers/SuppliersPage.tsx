"use client";
import React, { useState, useMemo } from "react";
import {
  Search, Plus, Trash2, Edit,
  Users, Mail, Phone, MapPin, 
  CheckCircle2, Clock, Truck, Filter, Loader2, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import { 
  useGetSuppliersQuery, 
  useGetSupplierCategoriesQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation
} from "@/store/api/supplierApi";

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", category_id: "", status: "active" });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: suppliersData, isLoading: isLoadingSuppliers } = useGetSuppliersQuery(undefined);
  const { data: categoriesData } = useGetSupplierCategoriesQuery(undefined);
  
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();

  const suppliers = suppliersData?.data || [];
  const categories = categoriesData?.data || [];

  const categoryOptions = useMemo(() => {
    return categories.map((cat: any) => ({
      value: cat.id,
      label: cat.name
    }));
  }, [categories]);

  const filtered = useMemo(() => {
    return suppliers.filter((s: any) => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [suppliers, search]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filtered.length);

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
  };

  const handlePageSizeChange = (s: number) => {
    setPageSize(s);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearch(q);
    setCurrentPage(1);
  };

  const openModal = (supplier?: any) => {
    if (supplier) {
      setEditId(supplier.id);
      setForm({ 
        name: supplier.name, 
        email: supplier.email || "", 
        phone: supplier.phone || "", 
        address: supplier.address || "", 
        category_id: supplier.category_id || "",
        status: supplier.status || "active"
      });
    } else {
      setEditId(null);
      setForm({ name: "", email: "", phone: "", address: "", category_id: "", status: "active" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateSupplier({ id: editId, ...form }).unwrap();
        toast.success("Pemasok berhasil diperbarui");
      } else {
        await createSupplier(form).unwrap();
        toast.success("Pemasok berhasil dibuat");
      }
      setModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSupplier(deleteId).unwrap();
      toast.success("Pemasok berhasil dihapus");
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Gagal menghapus pemasok");
    }
  };

  if (isLoadingSuppliers) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Pemasok</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola pemasok produk dan informasi kontak Anda.</p>
        </div>
        <Button onClick={() => openModal()} startIcon={<Plus size={18} />}>
          Tambah Pemasok
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-500/20 text-brand-600">
            <Truck size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{suppliers.length}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Pemasok</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-500/20 text-green-600">
            <CheckCircle2 size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{suppliers.filter((s: any) => s.status === "active").length || 0}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mitra Aktif</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600">
            <Clock size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">0</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pesanan Tertunda</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-3xl border border-gray-100 bg-white shadow-theme-xs dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md overflow-hidden">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm w-full">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pemasok..."
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full h-11 rounded-xl border border-transparent bg-gray-50/50 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-white/5 dark:bg-gray-950 dark:text-white/90 dark:placeholder-gray-500"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-white/[0.03]">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Nama Pemasok</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Info Kontak</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Alamat</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {paginatedSuppliers.map((supplier: any) => (
                <tr key={supplier.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 font-semibold dark:bg-gray-800">
                        {supplier.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{supplier.name}</p>
                        <p className="text-xs text-gray-400">{supplier.category?.name || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail size={12} /> {supplier.email || "-"}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone size={12} /> {supplier.phone || "-"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin size={14} className="mt-0.5 shrink-0" /> {supplier.address || "-"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      supplier.status === "active" || !supplier.status
                        ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                    }`}>
                      <div className={`h-1 w-1 rounded-full ${(supplier.status === "active" || !supplier.status) ? "bg-success-500" : "bg-gray-400"}`} />
                      {supplier.status === "active" ? "aktif" : (supplier.status === "inactive" ? "nonaktif" : (supplier.status || "aktif"))}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(supplier)} className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg dark:hover:bg-brand-500/10 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setDeleteId(supplier.id)} className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 rounded-lg dark:hover:bg-error-500/10 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center mb-4 border border-gray-100 dark:border-white/5">
                        <Truck className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-base font-bold text-gray-900 dark:text-white">Tidak ada data Pemasok</p>
                      <p className="text-sm mt-1 max-w-sm">Data pemasok tidak ditemukan. Pastikan filter pencarian sudah benar.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3.5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: info + page size */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400">
              {filtered.length === 0 ? "0 pemasok" : `${startItem}–${endItem} dari ${filtered.length} pemasok`}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Tampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-7 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {[5, 10, 25, 50].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="text-xs text-gray-400">per halaman</span>
            </div>
          </div>

          {/* Right: page buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
              title="Halaman pertama"
            >
              <ChevronDown size={13} className="rotate-90" />
              <ChevronDown size={13} className="-ml-2 rotate-90" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
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
                    onClick={() => handlePageChange(p)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                      currentPage === p
                        ? "bg-brand-500 text-white shadow-sm"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="-rotate-90" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
              title="Halaman terakhir"
            >
              <ChevronDown size={13} className="-rotate-90" />
              <ChevronDown size={13} className="-ml-2 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-xl">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <h4 className="text-base font-bold text-gray-800 dark:text-white/90">{editId ? "Edit Pemasok" : "Tambah Pemasok Baru"}</h4>
          <p className="text-sm text-gray-400">Masukkan detail kontak dan bisnis pemasok.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Nama Pemasok</Label>
              <InputField placeholder="Cth. Global Electronics" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <Label required>Kategori</Label>
              <Select 
                options={categoryOptions} 
                placeholder="Pilih kategori" 
                value={form.category_id}
                onChange={val => setForm({...form, category_id: val})} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Nomor Telepon</Label>
              <InputField placeholder="08123456xxx" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <Label required>Alamat Email</Label>
              <InputField type="email" placeholder="kontak@pemasok.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>
          <div>
            <Label>Alamat</Label>
            <TextArea placeholder="Alamat bisnis lengkap..." value={form.address} onChange={val => setForm({...form, address: val})} />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (editId ? "Perbarui" : "Buat")}
            </Button>
          </div>
        </form>
      </Modal>

      <AlertDialog 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete}
        title="Hapus Pemasok?"
        description="Apakah Anda yakin ingin menghapus pemasok ini? Ini akan memengaruhi riwayat pembelian Anda."
        variant="danger"
      />
    </div>
  );
}
