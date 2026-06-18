"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  Eye,
  RefreshCcw,
  User,
  Activity,
  Database,
  Globe,
  Terminal,
  Clock,
  Download,
  ChevronDown
} from "lucide-react";
import Button from "@/components/ui/button/Button";

// Mock Data
const MOCK_LOGS: any[] = [];

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'success':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Success</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">Warning</span>;
      case 'error':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">Error</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">Info</span>;
    }
  };

  const getActionIcon = (module: string) => {
    switch (module) {
      case 'Auth': return <Terminal className="w-4 h-4" />;
      case 'Inventory': return <Database className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
            Audit Logs
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Trace every system activity, user action, and data change.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
            <Button variant="outline" className="w-full sm:w-auto" startIcon={<Download size={18} />}>Export Logs</Button>
            <button onClick={() => setSearch("")} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 h-11 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 transition-colors"><RefreshCcw size={16} /> Reset</button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by action, description, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 border border-transparent dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select className="appearance-none w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 dark:text-gray-300 border border-transparent dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all cursor-pointer">
            <option value="">All Modules</option>
            <option value="Inventory">Inventory</option>
            <option value="Sales">Sales</option>
            <option value="Auth">Auth</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-colors">
          <Calendar className="w-4 h-4" />
          Select Date
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module / Action</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(log.timestamp).toLocaleDateString('id-ID')}</p>
                      <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400">
                          <User className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{log.user}</p>
                          <p className="text-xs text-gray-400">{log.role}</p>
                       </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                     <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-500/10 px-2 py-0.5 rounded-md w-fit">
                          {getActionIcon(log.module)}
                          <span className="text-[10px] font-semibold uppercase">{log.module}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                           {log.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                     </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-[300px] truncate">{log.description}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-center">
                    {getSeverityBadge(log.severity)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {MOCK_LOGS.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center mb-4 border border-gray-100 dark:border-white/5">
                        <Activity className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-base font-bold text-gray-900 dark:text-white">Tidak ada data Audit Log</p>
                      <p className="text-sm mt-1 max-w-sm">Data riwayat sistem tidak ditemukan. Log aktivitas akan muncul secara otomatis.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3.5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400">
              {MOCK_LOGS.length === 0 ? "0 logs" : `1–${MOCK_LOGS.length} dari ${MOCK_LOGS.length} logs`}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Tampilkan</span>
              <div className="relative">
                <select
                  className="appearance-none h-7 rounded-lg border border-gray-200 bg-white px-2 pr-6 text-xs text-gray-700 outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
              <span className="text-xs text-gray-400">per halaman</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="rotate-90" />
            </button>
            <span className="px-4 text-xs font-medium text-gray-600 dark:text-gray-400">
              1 / 1
            </span>
            <button
              disabled
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="-rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} className="max-w-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Log Details</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Technical audit information.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                     <Clock className="w-3 h-3" /> Timestamp
                   </p>
                   <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{selectedLog && new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                     <Globe className="w-3 h-3" /> IP Address
                   </p>
                   <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{selectedLog?.ip_address}</p>
                </div>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{selectedLog?.description}</p>
               </div>
               <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200/50 dark:border-gray-800">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Action Type</p>
                    <p className="text-xs font-bold text-brand-600">{selectedLog?.action}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Severity</p>
                    <div>{selectedLog && getSeverityBadge(selectedLog.severity)}</div>
                  </div>
               </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Log Trace ID</p>
              <code className="block p-2 bg-gray-900 text-gray-300 text-[10px] rounded-lg font-mono border border-gray-800">
                {selectedLog?.id} (TX_ID: 8872-9921-AA22)
              </code>
            </div>
          </div>

          <div className="mt-8">
             <Button variant="outline" className="w-full dark:border-gray-700 dark:text-gray-300" onClick={() => setSelectedLog(null)}>Close Trace</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
