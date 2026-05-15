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
  Clock
} from "lucide-react";
import Button from "@/components/ui/button/Button";

// Mock Data
const MOCK_LOGS = [
  { 
    id: "LOG-001", 
    timestamp: "2024-05-10T11:20:00Z", 
    user: "Budi Santoso",
    role: "Admin",
    action: "UPDATE_PRODUCT",
    module: "Inventory",
    description: "Changed stock for Espresso Beans from 40 to 45",
    ip_address: "192.168.1.45",
    severity: "info"
  },
  { 
    id: "LOG-002", 
    timestamp: "2024-05-10T10:45:00Z", 
    user: "Siti Aminah",
    role: "Staff",
    action: "CREATE_ORDER",
    module: "Sales",
    description: "Created new order #INV-20240510-001",
    ip_address: "192.168.1.52",
    severity: "success"
  },
  { 
    id: "LOG-003", 
    timestamp: "2024-05-10T09:15:00Z", 
    user: "System",
    role: "System",
    action: "LOGIN_FAILED",
    module: "Auth",
    description: "Multiple failed login attempts detected",
    ip_address: "203.14.55.21",
    severity: "warning"
  },
];

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
    <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-[#06060a] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Audit Logs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Trace every system activity, user action, and data change.</p>
        </div>

        <div className="flex gap-2">
            <Button variant="outline" startIcon={<RefreshCcw size={18} />}>Export Logs</Button>
            <Button startIcon={<Filter size={18} />}>Clear Filters</Button>
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
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 border border-transparent dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 dark:text-gray-300 border border-transparent dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer">
            <option value="">All Modules</option>
            <option value="Inventory">Inventory</option>
            <option value="Sales">Sales</option>
            <option value="Auth">Auth</option>
          </select>
        </div>

        <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
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
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module / Action</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(log.timestamp).toLocaleDateString('id-ID')}</p>
                      <p className="text-xs font-medium text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <User className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{log.user}</p>
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">{log.role}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md w-fit">
                          {getActionIcon(log.module)}
                          <span className="text-[10px] font-bold uppercase tracking-wider">{log.module}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{log.action}</p>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium max-w-[300px] truncate">{log.description}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getSeverityBadge(log.severity)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} className="max-w-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
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
                    <p className="text-xs font-bold text-indigo-600">{selectedLog?.action}</p>
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
