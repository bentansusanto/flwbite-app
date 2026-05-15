"use client";
import React, { useState, useMemo } from "react";
import { Search, Key, ChevronUp, ChevronDown } from "lucide-react";
import { useGetPermissionsQuery } from "@/store/api/userManagementApi";

const ACTION_BADGE: Record<string, string> = {
  create: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  read:   "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  update: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  delete: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  manage: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
};

const ACTION_ORDER = ["create", "read", "update", "delete", "manage"];

export default function PermissionsPage() {
  const { data: permissionsData, isLoading } = useGetPermissionsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"module" | "action">("module");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const allPermissions: any[] = useMemo(() => permissionsData?.data ?? [], [permissionsData]);

  // Group by module
  const groupedByModule = useMemo(() => {
    let filtered = allPermissions;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.module?.toLowerCase().includes(q) || p.action?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    const groups: Record<string, any[]> = {};
    filtered.forEach(p => {
      const mod = p.module || "general";
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(p);
    });
    // Sort groups
    const sorted = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(sorted);
  }, [allPermissions, search]);

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronUp size={13} className="text-gray-300" />;
    return sortOrder === "asc" ? <ChevronUp size={13} className="text-brand-500" /> : <ChevronDown size={13} className="text-brand-500" />;
  };

  const totalModules = Object.keys(groupedByModule).length;
  const totalPerms = allPermissions.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Permissions</h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Semua izin akses yang tersedia dalam sistem.</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-400">Total Modul</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{totalModules}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-400">Total Permission</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{totalPerms}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari modul atau action..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
        />
      </div>

      {/* Permissions Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : Object.keys(groupedByModule).length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Key size={40} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Tidak ada permission ditemukan</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(groupedByModule).map(([module, perms]) => {
            // Sort perms by ACTION_ORDER
            const sortedPerms = [...perms].sort((a, b) => {
              const ai = ACTION_ORDER.indexOf(a.action);
              const bi = ACTION_ORDER.indexOf(b.action);
              return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
            });

            return (
              <div key={module} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                {/* Module Header */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                    <Key size={14} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize text-gray-800 dark:text-white/90">{module}</p>
                    <p className="text-xs text-gray-400">{perms.length} permissions</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {sortedPerms.map((p: any) => (
                    <div key={p.id} className="group relative">
                      <span className={`cursor-default rounded-lg px-3 py-1.5 text-xs font-semibold ${ACTION_BADGE[p.action] || "bg-gray-100 text-gray-500"}`}>
                        {p.action}
                      </span>
                      {p.description && (
                        <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-max max-w-[200px] -translate-x-1/2 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block dark:bg-gray-700">
                          {p.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
