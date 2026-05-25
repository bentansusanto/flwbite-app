"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Building2, MapPin, Phone, Star, Mail, Edit, Trash2, Plus, Users, Globe, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetBranchesQuery, useCreateBranchMutation,
  useUpdateBranchMutation, useDeleteBranchMutation,
} from "@/store/api/branchApi";
import {
  useGetMeTenantQuery, useUpdateMeTenantMutation,
} from "@/store/api/tenantApi";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import ImageUpload from "@/components/form/ImageUpload";

export default function TenantPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "branches">("profile");

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: tenantRes, isLoading: isLoadingTenant, refetch: refetchTenant } = useGetMeTenantQuery(undefined);
  const { data: branchData, isLoading: isLoadingBranches, refetch: refetchBranches } = useGetBranchesQuery(undefined);

  const tenant = tenantRes?.data;
  const branches = useMemo(() => branchData?.data ?? [], [branchData]);

  // ─── Tenant Profile State & Handlers ─────────────────────────────────────────
  const [updateTenant, { isLoading: isUpdatingTenant }] = useUpdateMeTenantMutation();
  const [tenantForm, setTenantForm] = useState({
    name: "", email: "", phone: "", address: "", logo: "",
  });

  useEffect(() => {
    if (tenant) {
      setTenantForm({
        name: tenant.name || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        address: tenant.address || "",
        logo: tenant.logo || "",
      });
    }
  }, [tenant]);

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantForm.name) {
      toast.error("Nama wajib diisi");
      return;
    }
    try {
      await updateTenant(tenantForm).unwrap();
      toast.success("Profil tenant berhasil diperbarui");
      refetchTenant();
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal memperbarui profil");
    }
  };

  // ─── Branch Management State & Handlers ────────────────────────────────────
  const [createBranch, { isLoading: isCreatingBranch }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdatingBranch }] = useUpdateBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: "", address: "", phone_number: "",
    city: "", country: "", zip_code: "", is_main: false,
  });
  const [branchErrors, setBranchErrors] = useState<Record<string, string>>({});

  const openCreateBranch = () => {
    setEditId(null);
    setBranchForm({ name: "", address: "", phone_number: "", city: "", country: "", zip_code: "", is_main: false });
    setBranchErrors({});
    setModalOpen(true);
  };

  const openEditBranch = (b: any) => {
    setEditId(b.id);
    setBranchForm({
      name: b.name ?? "", address: b.address ?? "", phone_number: b.phone_number ?? "",
      city: b.city ?? "", country: b.country ?? "", zip_code: b.zip_code ?? "", is_main: b.is_main ?? false,
    });
    setBranchErrors({});
    setModalOpen(true);
  };

  const validateBranch = () => {
    const e: Record<string, string> = {};
    if (!branchForm.name.trim()) e.name = "Nama cabang wajib diisi";
    if (branchForm.phone_number && !/^\+?[0-9]{10,15}$/.test(branchForm.phone_number.replace(/\s/g, ""))) {
      e.phone_number = "Format nomor telepon tidak valid";
    }
    setBranchErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmitBranch = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateBranch()) return;
    try {
      if (editId) {
        await updateBranch({ id: editId, ...branchForm }).unwrap();
        toast.success("Cabang berhasil diperbarui");
      } else {
        await createBranch(branchForm).unwrap();
        toast.success("Cabang berhasil dibuat");
      }
      setModalOpen(false);
      refetchBranches();
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menyimpan cabang");
    }
  };

  const handleDeleteBranch = async () => {
    if (!deleteId) return;
    try {
      await deleteBranch(deleteId).unwrap();
      toast.success("Cabang berhasil dihapus");
      refetchBranches();
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menghapus cabang");
    } finally {
      setDeleteId(null);
    }
  };

  const isSavingBranch = isCreatingBranch || isUpdatingBranch;

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Tenants & Cabang</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kelola profil bisnis (tenant) dan seluruh cabang outlet Anda.
          </p>
        </div>
        {activeTab === "branches" && (
          <div className="flex items-center gap-3">
             <Button startIcon={<Plus size={16} />} onClick={openCreateBranch}>
               Cabang Baru
             </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "profile" 
            ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400" 
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Profil Bisnis
        </button>
        <button
          onClick={() => setActiveTab("branches")}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "branches" 
            ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400" 
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Kelola Cabang
        </button>
      </div>

      {/* Tab Content: Profile */}
      {activeTab === "profile" && (
        <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-gray-900/40">
          {isLoadingTenant ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="h-10 w-full rounded bg-gray-100 dark:bg-gray-800"></div>
            </div>
          ) : (
            <form onSubmit={handleUpdateTenant} className="space-y-6">
              <div className="flex items-center gap-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <ImageUpload 
                  value={tenantForm.logo}
                  onChange={(url) => setTenantForm(f => ({ ...f, logo: url }))}
                  label="Logo Bisnis"
                  className="shrink-0"
                />
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{tenant?.name}</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <Globe size={14} /> {tenant?.domain || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label required>Nama Bisnis</Label>
                  <InputField 
                    value={tenantForm.name} 
                    onChange={e => setTenantForm(f => ({ ...f, name: e.target.value }))} 
                    placeholder="Nama Tenant" 
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <InputField 
                    type="email"
                    value={tenantForm.email} 
                    onChange={e => setTenantForm(f => ({ ...f, email: e.target.value }))} 
                    placeholder="email@bisnis.com" 
                  />
                </div>
                <div>
                  <Label>Nomor Telepon</Label>
                  <InputField 
                    value={tenantForm.phone} 
                    onChange={e => setTenantForm(f => ({ ...f, phone: e.target.value }))} 
                    placeholder="+62 812..." 
                  />
                </div>
              </div>

              <div>
                <Label>Alamat Lengkap</Label>
                <TextArea 
                  value={tenantForm.address} 
                  onChange={val => setTenantForm(f => ({ ...f, address: val }))} 
                  placeholder="Alamat bisnis..." 
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button type="submit" disabled={isUpdatingTenant}>
                  {isUpdatingTenant ? "Menyimpan..." : "Simpan Profil"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab Content: Branches (Card Design) */}
      {activeTab === "branches" && (
        <div className="space-y-6">
          {isLoadingBranches ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"></div>
              ))}
            </div>
          ) : branches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
               <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300 dark:bg-gray-800">
                  <Building2 size={32} />
               </div>
               <h5 className="mt-4 font-bold text-gray-900 dark:text-white">Belum Ada Cabang</h5>
               <p className="mt-1 text-sm text-gray-400">Mulai ekspansi bisnis Anda dengan menambah cabang.</p>
               <Button variant="outline" size="sm" className="mt-6" onClick={openCreateBranch}>Tambah Cabang</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch: any) => (
                <div key={branch.id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/5 dark:bg-gray-900/40">
                  
                  {branch.is_main && (
                    <div className="absolute right-0 top-0 rounded-bl-xl bg-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      Pusat
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold shadow-sm ${
                      branch.is_main 
                      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" 
                      : "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                    }`}>
                      {branch.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 pr-12">{branch.name}</h4>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={12} className="shrink-0" />
                        <span className="line-clamp-1">{branch.city || "Lokasi belum diatur"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 mb-5 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} className="text-gray-400" />
                      <span>{branch.phone_number || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-gray-400" />
                      <span>{branch.staff_count || 0} Staff</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                    <p className="text-xs text-gray-400">
                      ID: <span className="font-mono text-[10px]">{branch.id.substring(0, 8)}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditBranch(branch)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800">
                        <Edit size={16} />
                      </button>
                      {!branch.is_main && (
                        <button onClick={() => setDeleteId(branch.id)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Create / Edit Branch Modal ─────────────────────────────────────────── */}
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

        <form onSubmit={handleSubmitBranch} className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-4">
               <div>
                 <Label required>Nama Outlet</Label>
                 <InputField placeholder="Flwbite Kemang" value={branchForm.name}
                   onChange={e => setBranchForm(f => ({ ...f, name: e.target.value }))}
                   error={!!branchErrors.name} hint={branchErrors.name} />
               </div>
               <div>
                 <Label>No. Telepon</Label>
                 <InputField placeholder="+62 812..." value={branchForm.phone_number}
                   onChange={e => setBranchForm(f => ({ ...f, phone_number: e.target.value.replace(/[^0-9+]/g, '') }))}
                   error={!!branchErrors.phone_number} hint={branchErrors.phone_number} />
               </div>
               <div>
                 <Label>Kota</Label>
                 <InputField placeholder="Jakarta Selatan" value={branchForm.city}
                   onChange={e => setBranchForm(f => ({ ...f, city: e.target.value }))} />
               </div>
            </div>
            <div className="space-y-4">
               <div>
                 <Label>Alamat Lengkap</Label>
                 <TextArea value={branchForm.address} onChange={val => setBranchForm(f => ({ ...f, address: val }))}
                   placeholder="Jl. Raya No. 123..." className="h-[106px]" />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Negara</Label>
                    <InputField placeholder="ID" value={branchForm.country} onChange={e => setBranchForm(f => ({ ...f, country: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Kode Pos</Label>
                    <InputField placeholder="12xxx" value={branchForm.zip_code} onChange={e => setBranchForm(f => ({ ...f, zip_code: e.target.value }))} />
                  </div>
               </div>
            </div>
          </div>

          <div className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
            branchForm.is_main 
            ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-500/5" 
            : "border-gray-100 bg-gray-50/30 dark:border-gray-800"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${branchForm.is_main ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-400 dark:bg-gray-800"}`}>
                <Star size={18} fill={branchForm.is_main ? "currentColor" : "none"} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Cabang Utama</p>
                <p className="text-[10px] text-gray-500">Gunakan sebagai referensi inventaris pusat.</p>
              </div>
            </div>
            <button type="button" role="switch" onClick={() => setBranchForm(f => ({ ...f, is_main: !f.is_main }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                branchForm.is_main ? "bg-amber-500" : "bg-gray-200 dark:bg-gray-700"
              }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                branchForm.is_main ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" className="flex-1" disabled={isSavingBranch}>
              {isSavingBranch ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Buat Cabang"}
            </Button>
          </div>
        </form>
      </Modal>

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteBranch}
        title="Hapus Cabang?"
        description="Menghapus cabang akan memutuskan akses staff terkait. Data lama tetap tersimpan."
        confirmLabel="Hapus"
        variant="danger"
      />
    </div>
  );
}
