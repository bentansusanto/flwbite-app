"use client";
import React, { useState, useMemo } from "react";
import { Search, Shield, ChevronRight, Lock, X, Plus, Pencil, Trash2 } from "lucide-react";
import { useGetRolesQuery, useDeleteRoleMutation } from "@/store/api/userManagementApi";
import { useGetCurrentSubscriptionQuery, useGetPlanByIdQuery } from "@/store/api/subscriptionApi";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useGetMeTenantQuery } from "@/store/api/tenantApi";
import { RoleModal } from "./RoleModal";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { toast } from "sonner";

const ACTION_BADGE: Record<string, string> = {
  create: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  read:   "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  update: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  delete: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  manage: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
};

export default function RolesPage() {
  const { data: rolesData, isLoading, refetch } = useGetRolesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [deleteRole] = useDeleteRoleMutation();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const [roleToEdit, setRoleToEdit] = useState<any | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Subscription check
  const { data: subData } = useGetCurrentSubscriptionQuery(undefined);
  const planId = subData?.data?.plan_id;
  const hasNoPlan = !planId || planId === "00000000-0000-0000-0000-000000000000";
  const { data: planData } = useGetPlanByIdQuery(planId || "", {
    skip: hasNoPlan,
  });
  
  const { data: tenantRes } = useGetMeTenantQuery(undefined);
  const isDemo = tenantRes?.data?.is_demo;
  const isProPlan = planData?.data?.name?.toLowerCase() === "pro";
  const canAddRole = isProPlan || isDemo;

  const filteredRoles = useMemo(() => {
    if (!rolesData?.data) return [];
    if (!search) return rolesData.data;
    return rolesData.data.filter((role: any) =>
      role.name.toLowerCase().includes(search.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [rolesData, search]);

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRole(roleToDelete.id).unwrap();
      toast.success("Berhasil menghapus role!");
      setRoleToDelete(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menghapus role.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditRole = (role: any) => {
    setRoleToEdit(role);
    setIsCreateOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setRoleToEdit(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Roles & Permissions</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Define access levels and manage permissions for your team.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari role..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-transparent bg-gray-50/50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-white/5 dark:bg-gray-950 dark:text-white/90 dark:placeholder-gray-500"
            />
          </div>
          {canAddRole && (
            <Button startIcon={<Plus size={16} />} onClick={() => setIsCreateOpen(true)}>
              Tambah Role
            </Button>
          )}
        </div>
      </div>

      {/* Grid Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
              <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800"></div>
              <div className="mt-4 h-5 w-2/3 rounded-lg bg-gray-100 dark:bg-gray-800"></div>
              <div className="mt-2 h-4 w-full rounded-lg bg-gray-50 dark:bg-gray-800/50"></div>
            </div>
          ))}
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 py-20 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
            <Lock size={32} className="text-gray-300 dark:text-gray-600" />
          </div>
          <h4 className="mt-4 text-lg font-bold text-gray-900 dark:text-white/90">No roles found</h4>
          <p className="mt-1 text-gray-500 dark:text-gray-400">No roles match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role: any) => {
            const permissions: any[] = role.permissions ?? [];
            const grouped = permissions.reduce((acc: Record<string, any[]>, rp: any) => {
              const mod = rp.permission?.module || rp.module || "general";
              if (!acc[mod]) acc[mod] = [];
              acc[mod].push(rp.permission || rp);
              return acc;
            }, {});

            return (
              <div
                key={role.id}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white transition-all hover:border-brand-100 hover:shadow-md dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md dark:hover:border-brand-500/20"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                      <Shield size={24} />
                    </div>
                    {role.is_system && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                        System
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-bold capitalize text-gray-800 dark:text-white/90">
                      {role.name}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {role.description || "Access level for system users."}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-gray-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Capability
                      </span>
                      <span className="mt-0.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {permissions.length} Permissions
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!role.is_system && (
                        <>
                          <button
                            onClick={() => handleEditRole(role)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:hover:bg-blue-500/10"
                            title="Edit Role"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setRoleToDelete(role)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400 transition-colors hover:bg-red-50 hover:text-error-500 dark:bg-gray-800 dark:hover:bg-red-500/10"
                            title="Hapus Role"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedRole(role)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                        title="Lihat Detail"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Role Details Modal */}
      <Modal
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        className="max-w-2xl p-0 overflow-hidden"
      >
        {selectedRole && (
          <div className="flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-white/[0.02]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 shadow-sm">
                    <Shield size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-2xl font-bold capitalize text-gray-800 dark:text-white/90">
                        {selectedRole.name}
                      </h4>
                      {selectedRole.is_system && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                          System
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {selectedRole.description || "Access level for system users."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body: Permissions Grid */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="mb-4 flex items-center justify-between">
                <h5 className="text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">
                  Assigned Permissions
                </h5>
                <span className="rounded-lg bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  {selectedRole.permissions?.length ?? 0} Total
                </span>
              </div>

              {(!selectedRole.permissions || selectedRole.permissions.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <Lock size={40} className="mb-2" />
                  <p className="text-sm font-medium">No permissions assigned.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {Object.entries(
                    (selectedRole.permissions as any[]).reduce((acc: Record<string, any[]>, rp: any) => {
                      const mod = rp.permission?.module || rp.module || "general";
                      if (!acc[mod]) acc[mod] = [];
                      acc[mod].push(rp.permission || rp);
                      return acc;
                    }, {})
                  ).map(([module, perms]) => (
                    <div key={module} className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-brand-500/70">{module}</p>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((p: any) => (
                          <div
                            key={p.id}
                            className={`flex items-center gap-1.5 rounded-lg border border-gray-100 px-2.5 py-1.5 dark:border-gray-800 ${ACTION_BADGE[p.action] || "bg-gray-50 text-gray-500 dark:bg-gray-800"}`}
                          >
                            <div className={`h-1.5 w-1.5 rounded-full ${p.action === 'manage' ? 'bg-purple-500' : p.action === 'delete' ? 'bg-red-500' : 'bg-current opacity-40'}`} />
                            <span className="text-xs font-bold capitalize">{p.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <RoleModal 
        isOpen={isCreateOpen} 
        onClose={handleCloseModal} 
        roleToEdit={roleToEdit} 
      />

      <AlertDialog
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Role?"
        description={`Apakah Anda yakin ingin menghapus role "${roleToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
