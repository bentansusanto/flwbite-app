"use client";
import React, { useState, useMemo } from "react";
import {
  Plus, Search, Edit, Trash2, Building2, MapPin,
  Phone, Star, ChevronUp, ChevronDown, Globe, Users,
  ExternalLink, Info, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetBranchesQuery, useCreateBranchMutation,
  useUpdateBranchMutation, useDeleteBranchMutation,
} from "@/store/api/branchApi";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BranchForm {
  name: string;
  address: string;
  phone_number: string;
  city: string;
  country: string;
  zip_code: string;
  is_main: boolean;
}

const DEFAULT_FORM: BranchForm = {
  name: "", address: "", phone_number: "",
  city: "", country: "", zip_code: "", is_main: false,
};

type SortField = "name" | "city" | "country" | "created_at" | "staff_count";

// ─── Component ────────────────────────────────────────────────────────────────
export default function BranchPage() {
  const { data: branchData, isLoading, refetch } = useGetBranchesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();

  // State Management
  const [search, setSearch]         = useState("");
  const [sortField, setSortField]   = useState<SortField>("created_at");
  const [sortOrder, setSortOrder]   = useState<"asc" | "desc">("desc");
  const [modalOpen, setModalOpen]   = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [form, setForm]             = useState<BranchForm>(DEFAULT_FORM);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(10);

  const allBranches: any[] = useMemo(() => branchData?.data ?? [], [branchData]);

  // ─── Filter + Sort Logic ────────────────────────────────────────────────────
  const processedData = useMemo(() => {
    let r = [...allBranches];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(b =>
        b.name?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q)
      );
    }
    r.sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [allBranches, search, sortField, sortOrder]);

  // Pagination Logic
  const totalCount = processedData.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedData = processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (branch: any) => {
    setEditId(branch.id);
    setForm({
      name:         branch.name ?? "",
      address:      branch.address ?? "",
      phone_number: branch.phone_number ?? "",
      city:         branch.city ?? "",
      country:      branch.country ?? "",
      zip_code:     branch.zip_code ?? "",
      is_main:      branch.is_main ?? false,
    });
    setErrors({});
    setModalOpen(true);
  };

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nama cabang wajib diisi";
    if (form.phone_number && !/^\+?[0-9]{10,15}$/.test(form.phone_number.replace(/\s/g, ""))) {
      e.phone_number = "Format nomor telepon tidak valid";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      if (editId) {
        await updateBranch({ id: editId, ...form }).unwrap();
        toast.success("Cabang berhasil diperbarui");
      } else {
        await createBranch(form).unwrap();
        toast.success("Cabang berhasil dibuat");
      }
      setModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menyimpan cabang");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBranch(deleteId).unwrap();
      toast.success("Cabang berhasil dihapus");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menghapus cabang");
    } finally {
      setDeleteId(null);
    }
  };

  // ─── UI Helpers ─────────────────────────────────────────────────────────────
  const SortIcon = ({ field }: { field: SortField }) =>
    sortField !== field
      ? <ChevronDown size={13} className="opacity-30" />
      : sortOrder === "asc"
        ? <ChevronUp size={13} className="text-brand-500" />
        : <ChevronDown size={13} className="text-brand-500" />;

  const ThSort = ({ field, label, className = "" }: { field: SortField; label: string, className?: string }) => (
    <th className={`px-4 py-3.5 text-left cursor-pointer select-none ${className}`} onClick={() => handleSort(field)}>
      <button className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}<SortIcon field={field} />
      </button>
    </th>
  );

  const isSaving = isCreating || isUpdating;
  const mainBranch = allBranches.find(b => b.is_main);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-[#06060a] min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Daftar Cabang</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kelola infrastruktur outlet dan distribusi staff bisnis Anda.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" startIcon={<ExternalLink size={16} />} className="hidden md:flex">
             Export
           </Button>
           <Button startIcon={<Plus size={16} />} onClick={openCreate}>
             Cabang Baru
           </Button>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Main Branch Card */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/30 p-5 dark:border-white/5 dark:bg-amber-500/10 dark:backdrop-blur-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Kantor Pusat</p>
              <h4 className="mt-1 text-lg font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                {mainBranch?.name || "Belum ada"}
              </h4>
              <p className="mt-1 text-xs text-gray-500 truncate">{mainBranch?.city || "-"}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
              <Star size={18} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Total Branches */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Total Cabang</p>
              <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{allBranches.length}</h4>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10">
              <Building2 size={20} />
            </div>
          </div>
        </div>

        {/* Total Staff */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Total Staff</p>
              <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {allBranches.reduce((acc, b) => acc + (b.staff_count || 0), 0)}
              </h4>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-500 dark:bg-purple-500/10">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Coverage */}
        <div className="rounded-2xl border border-brand-100 bg-brand-50/20 p-5 dark:border-white/5 dark:bg-brand-500/10 dark:backdrop-blur-md">
           <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <Globe size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Cakupan Wilayah</span>
           </div>
           <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(allBranches.map(b => b.city)).size} <span className="text-sm font-medium text-gray-400">Kota</span>
           </h4>
        </div>
      </div>

      {/* ── Table Container ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
        {/* Toolbar Consistent with ProductTable */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari cabang..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-transparent bg-gray-50/50 pl-9 pr-3 text-sm outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-white/5 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <div className="flex items-center gap-2">
             <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                {isLoading ? "Memuat..." : `Menampilkan ${totalCount} cabang`}
             </span>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-white/5 dark:bg-white/[0.03]">
                <ThSort field="name" label="Outlet" className="pl-6" />
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Info Kontak</th>
                <ThSort field="city" label="Lokasi" />
                <ThSort field="staff_count" label="Staff" />
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoading ? (
                [...Array(pageSize)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-5 pl-6">
                        <div className="h-4 rounded-lg bg-gray-100 dark:bg-gray-800" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300 dark:bg-gray-800">
                       <Building2 size={32} />
                    </div>
                    <h5 className="mt-4 font-bold text-gray-900 dark:text-white">Belum Ada Cabang</h5>
                    <p className="mt-1 text-sm text-gray-400">Mulai ekspansi bisnis Anda dengan menambah cabang.</p>
                    <Button variant="outline" size="sm" className="mt-6" onClick={openCreate}>Tambah Sekarang</Button>
                  </td>
                </tr>
              ) : (
                paginatedData.map((branch: any) => (
                  <tr key={branch.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    {/* Outlet Name */}
                    <td className="px-4 py-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${
                          branch.is_main 
                          ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" 
                          : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                        }`}>
                          {branch.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white/90">{branch.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400 truncate max-w-[180px]">
                            <MapPin size={10} className="shrink-0" /> {branch.address || "Alamat belum diatur"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-4">
                       <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          {branch.phone_number ? (
                            <>
                               <Phone size={12} className="text-gray-400" />
                               <span className="font-medium text-xs">{branch.phone_number}</span>
                            </>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                       </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-4">
                       <div className="flex flex-col">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{branch.city || "N/A"}</span>
                          <span className="text-[10px] uppercase text-gray-400">{branch.country || "ID"}</span>
                       </div>
                    </td>

                    {/* Staff Count */}
                    <td className="px-4 py-4">
                       <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {branch.staff_count || 0}
                       </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                       {branch.is_main ? (
                         <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            <Star size={10} fill="currentColor" /> Pusat
                         </span>
                       ) : (
                         <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            Cabang
                         </span>
                       )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(branch)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-brand-50 hover:text-brand-500 dark:hover:bg-brand-500/10">
                            <Edit size={14} />
                          </button>
                          {!branch.is_main && (
                            <button onClick={() => setDeleteId(branch.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                              <Trash2 size={14} />
                            </button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Professional Pagination Consistent with ProductTable */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3.5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Info & Page Size */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400">
              {isLoading ? "Memuat..." : totalCount === 0 ? "0 cabang" : `${startItem}–${endItem} dari ${totalCount} cabang`}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Tampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="h-7 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {[5, 10, 25, 50].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="text-xs text-gray-400">per halaman</span>
            </div>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="rotate-90" />
              <ChevronDown size={13} className="-ml-2 rotate-90" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="-rotate-90" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="-rotate-90" />
              <ChevronDown size={13} className="-ml-2 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-xl">
        <div className="border-b border-gray-100 p-6 dark:border-gray-800">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                <Building2 size={20} />
             </div>
             <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editId ? "Edit Cabang" : "Tambah Cabang"}
                </h4>
                <p className="text-xs text-gray-400 font-medium">Informasi operasional outlet bisnis.</p>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-4">
               <div>
                 <Label required>Nama Outlet</Label>
                 <InputField placeholder="Flwbite Kemang" value={form.name}
                   onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                   error={!!errors.name} hint={errors.name} />
               </div>
               <div>
                 <Label>No. Telepon</Label>
                 <InputField placeholder="+62 812..." value={form.phone_number}
                   onChange={e => setForm(f => ({ ...f, phone_number: e.target.value.replace(/[^0-9+]/g, '') }))}
                   error={!!errors.phone_number} hint={errors.phone_number} />
               </div>
               <div>
                 <Label>Kota</Label>
                 <InputField placeholder="Jakarta Selatan" value={form.city}
                   onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
               </div>
            </div>
            <div className="space-y-4">
               <div>
                 <Label>Alamat Lengkap</Label>
                 <TextArea value={form.address} onChange={val => setForm(f => ({ ...f, address: val }))}
                   placeholder="Jl. Raya No. 123..." className="h-[106px]" />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Negara</Label>
                    <InputField placeholder="ID" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Kode Pos</Label>
                    <InputField placeholder="12xxx" value={form.zip_code} onChange={e => setForm(f => ({ ...f, zip_code: e.target.value }))} />
                  </div>
               </div>
            </div>
          </div>

          <div className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
            form.is_main 
            ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-500/5" 
            : "border-gray-100 bg-gray-50/30 dark:border-gray-800"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${form.is_main ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-400 dark:bg-gray-800"}`}>
                <Star size={18} fill={form.is_main ? "currentColor" : "none"} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Cabang Utama</p>
                <p className="text-[10px] text-gray-500">Gunakan sebagai referensi inventaris pusat.</p>
              </div>
            </div>
            <button type="button" role="switch" onClick={() => setForm(f => ({ ...f, is_main: !f.is_main }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.is_main ? "bg-amber-500" : "bg-gray-200 dark:bg-gray-700"
              }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                form.is_main ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Buat Cabang"}
            </Button>
          </div>
        </form>
      </Modal>

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Cabang?"
        description="Menghapus cabang akan memutuskan akses staff terkait. Data lama tetap tersimpan."
        confirmLabel="Hapus"
        variant="danger"
      />
    </div>
  );
}
