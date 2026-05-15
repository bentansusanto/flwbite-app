"use client";
import React, { useState, useMemo } from "react";
import {
  Search, Plus, Trash2, Shield, UserCheck, UserX, Edit, Eye, EyeOff, Check, X,
  Mail, Calendar, ChevronUp, ChevronDown, Building2, Lock, Users, Crown, ShieldCheck, CreditCard
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation,
  useDeleteUserMutation, useGetRolesQuery,
} from "@/store/api/userManagementApi";
import { useGetBranchesQuery } from "@/store/api/branchApi";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

const ROLE_BADGE: Record<string, string> = {
  owner:   "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  admin:   "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  cashier: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
};

// "auth type" — determines login method
type AuthType = "staff" | "cashier";

const PasswordRule = ({ label, fulfilled }: { label: string; fulfilled: boolean }) => (
  <div className="flex items-center gap-1.5 transition-all">
    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${fulfilled ? "border-green-500 bg-green-500 text-white" : "border-gray-200 bg-white text-transparent"}`}>
      <Check size={10} strokeWidth={4} />
    </div>
    <span className={`text-[10.5px] font-medium tracking-tight ${fulfilled ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
      {label}
    </span>
  </div>
);

const DEFAULT_FORM = {
  name: "", email: "", username: "", password: "", pin: "",
  role: "", branch_id: "",
};

type SortField = "name" | "email" | "role" | "created_at";

export default function UsersPage() {
  const { data: usersData, isLoading, refetch } = useGetUsersQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: branchesData }  = useGetBranchesQuery(undefined);
  const { data: rolesData }     = useGetRolesQuery(undefined);
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortField, setSortField]   = useState<SortField>("created_at");
  const [sortOrder, setSortOrder]   = useState<"asc" | "desc">("desc");
  const [modalOpen, setModalOpen]   = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [editId, setEditId]         = useState<string | null>(null);
  const [authType, setAuthType]     = useState<AuthType>("staff");
  const [form, setForm]             = useState(DEFAULT_FORM);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const allUsers: any[]    = useMemo(() => usersData?.data ?? [], [usersData]);
  const allBranches: any[] = useMemo(() => branchesData?.data ?? [], [branchesData]);
  const allRoles: any[]    = useMemo(() => rolesData?.data ?? [], [rolesData]);

  const branchOptions = useMemo(
    () => allBranches.map((b: any) => ({ label: b.name, value: b.id })),
    [allBranches]
  );

  // Staff roles = all roles except "owner" and "cashier"
  const staffRoleOptions = useMemo(
    () => allRoles
      .filter((r: any) => r.name !== "owner" && r.name !== "cashier")
      .map((r: any) => ({ label: r.name.charAt(0).toUpperCase() + r.name.slice(1), value: r.name })),
    [allRoles]
  );

  // ─── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = [...allUsers];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q)
      );
    }
    if (filterRole !== "all") r = r.filter(u => u.role === filterRole);
    r.sort((a, b) => {
      const av = String(a[sortField] ?? "").toLowerCase();
      const bv = String(b[sortField] ?? "").toLowerCase();
      return sortOrder === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return r;
  }, [allUsers, search, filterRole, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
  };

  const openModal = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setAuthType("staff");
    setErrors({});
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEdit = (user: any) => {
    setEditId(user.id);
    setAuthType(user.role === "cashier" ? "cashier" : "staff");
    setForm({
      name:      user.name || "",
      email:     user.email || "",
      username:  user.username || "",
      password:  "", // Keep empty on edit unless user wants to change it
      pin:       "", // Keep empty on edit unless user wants to change it
      role:      user.role || "",
      branch_id: user.branch_id || "",
    });
    setErrors({});
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleAuthTypeChange = (type: AuthType) => {
    setAuthType(type);
    // Reset role-specific fields when switching type
    setForm(f => ({
      ...f,
      role: type === "cashier" ? "cashier" : "",
      username: "", password: "", pin: "",
    }));
    setErrors({});
  };

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())   e.name  = "Nama wajib diisi";
    if (!form.email.trim())  e.email = "Email wajib diisi";
    if (!form.branch_id)     e.branch_id = "Cabang wajib dipilih";

    if (authType === "staff") {
      if (!form.role)               e.role     = "Role wajib dipilih";
      if (!form.username.trim())    e.username = "Username wajib diisi";
      
      // Password validation rules
      const pwd = form.password;
      const hasUpper = /[A-Z]/.test(pwd);
      const hasNumber = /[0-9]/.test(pwd);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
      const isLongEnough = pwd.length >= 8;

      if (!editId) {
        if (!isLongEnough) e.password = "Password minimal 8 karakter";
        else if (!hasUpper || !hasNumber || !hasSpecial) e.password = "Password belum memenuhi kriteria";
      } else if (pwd) {
        if (!isLongEnough) e.password = "Password minimal 8 karakter";
        else if (!hasUpper || !hasNumber || !hasSpecial) e.password = "Password belum memenuhi kriteria";
      }
    }
    if (authType === "cashier") {
      // PIN only required if creating or if filled during edit
      if (!editId && !/^\d{6}$/.test(form.pin)) e.pin = "PIN harus 6 digit angka";
      if (editId && form.pin && !/^\d{6}$/.test(form.pin)) e.pin = "PIN harus 6 digit angka";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit — payload sesuai CreateUserRequest ───────────────────────────────
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      const payload: Record<string, any> = {
        name:      form.name,
        email:     form.email,
        branch_id: form.branch_id,
        role:      authType === "cashier" ? "cashier" : form.role,
      };
      if (authType === "staff") {
        payload.username = form.username;
        if (form.password) payload.password = form.password;
      } else {
        if (form.pin) payload.pin = form.pin;
      }

      if (editId) {
        await updateUser({ id: editId, ...payload }).unwrap();
        toast.success("User berhasil diperbarui");
      } else {
        await createUser(payload).unwrap();
        toast.success("User berhasil dibuat");
      }
      setModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || `Gagal ${editId ? "memperbarui" : "membuat"} user`);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId).unwrap();
      toast.success("User berhasil dihapus");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menghapus user");
    } finally { setDeleteId(null); }
  };

  // ─── UI helpers ─────────────────────────────────────────────────────────────
  const SortIcon = ({ field }: { field: SortField }) =>
    sortField !== field
      ? <ChevronUp size={13} className="text-gray-300" />
      : sortOrder === "asc"
        ? <ChevronUp size={13} className="text-brand-500" />
        : <ChevronDown size={13} className="text-brand-500" />;

  const ThSort = ({ field, label }: { field: SortField; label: string }) => (
    <th className="px-4 py-3 text-left cursor-pointer select-none" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}<SortIcon field={field} />
      </div>
    </th>
  );

  const filterTabs = [
    { label: "Semua", value: "all" },
    { label: "Owner", value: "owner" },
    { label: "Admin", value: "admin" },
    { label: "Cashier", value: "cashier" },
  ];

  return (
    <div className="p-6 space-y-5 bg-gray-50/50 dark:bg-[#06060a] min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">User Management</h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Kelola akun pengguna dalam bisnis Anda.</p>
        </div>
        <Button startIcon={<Plus size={16} />} onClick={openModal}>Tambah User</Button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari nama, email, username..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 rounded-xl border border-transparent bg-gray-50/50 pl-9 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-white/5 dark:bg-gray-950 dark:text-white/90 dark:placeholder-gray-500"
          />
        </div>
        <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filterTabs.map(opt => (
            <button key={opt.value} onClick={() => setFilterRole(opt.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${filterRole === opt.value ? "bg-brand-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(["owner", "admin", "cashier"] as const).map(r => {
          const count = allUsers.filter(u => u.role === r).length;
          const icons = { 
            owner:   <Crown size={20} className="text-purple-600" />, 
            admin:   <ShieldCheck size={20} className="text-blue-600" />, 
            cashier: <CreditCard size={20} className="text-green-600" /> 
          } as const;
          const bgColors = {
            owner:   "bg-purple-100 dark:bg-purple-500/20",
            admin:   "bg-blue-100 dark:bg-blue-500/20",
            cashier: "bg-green-100 dark:bg-green-500/20"
          };
          
          return (
            <div key={r} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColors[r]}`}>
                {icons[r]}
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">{count}</p>
              <p className="text-xs font-medium text-gray-500 capitalize">{r}</p>
            </div>
          );
        })}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-500/20">
            <Users size={20} className="text-brand-600" />
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">{allUsers.length}</p>
          <p className="text-xs font-medium text-gray-500">Total Users</p>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-theme-xs dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/60 dark:border-white/5 dark:bg-white/[0.02]">
              <tr>
                <ThSort field="name" label="Nama" />
                <ThSort field="email" label="Email" />
                <ThSort field="role" label="Role" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                <ThSort field="created_at" label="Bergabung" />
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3.5"><div className="h-4 animate-pulse rounded bg-gray-100 dark:bg-gray-800" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <Shield size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Tidak ada user ditemukan</p>
                  </td>
                </tr>
              ) : (
                filtered.map((user: any) => (
                  <tr key={user.id} className="group hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-semibold text-white shadow-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white/90">{user.name}</p>
                          {user.username && <p className="text-xs text-gray-400">@{user.username}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Mail size={13} className="shrink-0" /><span>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_BADGE[user.role] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {user.is_active
                        ? <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400"><UserCheck size={11} />Aktif</span>
                        : <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800"><UserX size={11} />Nonaktif</span>
                      }
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={11} />
                        {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(user)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-500 dark:hover:bg-brand-500/10">
                          <Edit size={15} />
                        </button>
                        {user.role !== "owner" && (
                          <button onClick={() => setDeleteId(user.id)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                            <Trash2 size={15} />
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
        <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <p className="text-xs text-gray-400">{filtered.length} dari {allUsers.length} user</p>
        </div>
      </div>

      {/* ── Create User Modal ─────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-lg">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <h4 className="text-base font-bold text-gray-800 dark:text-white/90">
            {editId ? "Edit User" : "Tambah User Baru"}
          </h4>
          <p className="mt-0.5 text-sm text-gray-400">
            {editId ? `Mengedit akun ${form.name}` : "Pilih tipe login terlebih dahulu."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">

          {!editId && (
            <div>
              <Label required>Tipe Login</Label>
              <div className="mt-1 grid grid-cols-2 gap-3">
                {/* Staff card */}
                <button type="button" onClick={() => handleAuthTypeChange("staff")}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                    authType === "staff"
                      ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  }`}>
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${authType === "staff" ? "bg-brand-100 dark:bg-brand-500/20" : "bg-gray-100 dark:bg-gray-700"}`}>
                    <Users size={16} className={authType === "staff" ? "text-brand-600" : "text-gray-400"} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${authType === "staff" ? "text-brand-700 dark:text-brand-400" : "text-gray-700 dark:text-gray-300"}`}>Staff</p>
                    <p className="text-xs text-gray-400">Username &amp; password</p>
                    <p className="mt-0.5 text-xs text-gray-400 opacity-70">Admin, Finance, Gudang, dll</p>
                  </div>
                </button>

                {/* Cashier card */}
                <button type="button" onClick={() => handleAuthTypeChange("cashier")}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                    authType === "cashier"
                      ? "border-green-400 bg-green-50 dark:bg-green-500/10"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  }`}>
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${authType === "cashier" ? "bg-green-100 dark:bg-green-500/20" : "bg-gray-100 dark:bg-gray-700"}`}>
                    <Lock size={16} className={authType === "cashier" ? "text-green-600" : "text-gray-400"} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${authType === "cashier" ? "text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-300"}`}>Cashier</p>
                    <p className="text-xs text-gray-400">PIN 6 digit</p>
                    <p className="mt-0.5 text-xs text-gray-400 opacity-70">Khusus kasir POS</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── Common: Name + Email ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Nama Lengkap</Label>
              <InputField placeholder="John Doe" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                error={!!errors.name} hint={errors.name} />
            </div>
            <div>
              <Label required>Email</Label>
              <InputField type="email" placeholder="john@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                error={!!errors.email} hint={errors.email} />
            </div>
          </div>

          {/* ── Branch ── */}
          <div>
            <Label required>Cabang</Label>
            {branchOptions.length === 0 ? (
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">
                <Building2 size={15} /><span>Belum ada cabang — buat cabang terlebih dahulu</span>
              </div>
            ) : (
              <Select options={branchOptions} defaultValue={form.branch_id}
                onChange={val => setForm(f => ({ ...f, branch_id: val }))}
                placeholder="Pilih cabang..." />
            )}
            {errors.branch_id && <p className="mt-1 text-xs text-error-500">{errors.branch_id}</p>}
          </div>

          {/* ── STAFF fields: Role dropdown + Username + Password ── */}
          {authType === "staff" && (
            <div className="space-y-4 rounded-xl border border-brand-100 bg-brand-50/40 p-4 dark:border-brand-900/40 dark:bg-brand-500/5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                <Users size={13} />Staff — Login dengan username &amp; password
              </p>

              {/* Row: Role + Username */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label required>Role</Label>
                  {staffRoleOptions.length === 0 ? (
                    <p className="mt-1 text-xs text-gray-400">Memuat roles...</p>
                  ) : (
                    <Select
                      options={staffRoleOptions}
                      defaultValue={form.role}
                      onChange={val => setForm(f => ({ ...f, role: val }))}
                      placeholder="Pilih role staff..."
                    />
                  )}
                  {errors.role && <p className="mt-1 text-xs text-error-500">{errors.role}</p>}
                </div>

                <div>
                  <Label required>Username</Label>
                  <InputField placeholder="johndoe" value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    error={!!errors.username} hint={errors.username} />
                </div>
              </div>

              {/* Row: Password */}
              <div>
                <Label>{editId ? "Password Baru (Opsional)" : "Password"}</Label>
                <InputField 
                  type={showPassword ? "text" : "password"} 
                  placeholder={editId ? "Kosongkan jika tetap" : "Masukkan password"} 
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  error={!!errors.password} 
                  hint={errors.password}
                  suffixIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                
                {/* Password Rules Checklist */}
                {(form.password || !editId) && (
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg border border-gray-100 bg-gray-50/50 p-2.5 dark:border-gray-800 dark:bg-gray-900/50">
                    <PasswordRule label="Min. 8 Karakter" fulfilled={form.password.length >= 8} />
                    <PasswordRule label="Huruf Kapital" fulfilled={/[A-Z]/.test(form.password)} />
                    <PasswordRule label="Angka" fulfilled={/[0-9]/.test(form.password)} />
                    <PasswordRule label="Karakter Spesial" fulfilled={/[!@#$%^&*(),.?":{}|<>]/.test(form.password)} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CASHIER field: PIN only ── */}
          {authType === "cashier" && (
            <div className="space-y-2 rounded-xl border border-green-100 bg-green-50/40 p-4 dark:border-green-900/40 dark:bg-green-500/5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                <Lock size={13} />Cashier — Login dengan PIN 6 digit
              </p>
              <div>
                <Label>{editId ? "PIN Baru (6 digit - Opsional)" : "PIN (6 digit angka)"}</Label>
                <div className="relative">
                  <InputField
                    placeholder={editId ? "Kosongkan jika tetap" : "000000"} maxLength={6} value={form.pin}
                    onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                    error={!!errors.pin} hint={errors.pin}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    {form.pin.length}/6
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Buat User"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm ───────────────────────────────────────────── */}
      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus User"
        description="Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="danger"
      />
    </div>
  );
}
