"use client";
import { useStockTakes } from "./hooks";
import { useGetStocksByBranchQuery } from "@/store/api/stockApi";
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Building2,
  Calendar,
  Eye,
  AlertTriangle,
  RefreshCcw,
  ArrowRightLeft,
  ShieldCheck,
  ClipboardCheck
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useGetStockTakeByIdQuery } from "@/store/api/stockTakeApi";

export default function StockTakesPage() {
  const {
    selectedBranchId,
    setSelectedBranchId,
    search,
    setSearch,
    branches,
    isLoadingBranches,
    filteredStockTakes,
    isLoadingStockTakes,
    handleCreate,
    handleUpdate,
    isCreating,
    isUpdating,
    user
  } = useStockTakes();

  const [selectedTakeId, setSelectedTakeId] = useState<string | null>(null);
  const { data: selectedTakeData, isFetching: isFetchingDetail } = useGetStockTakeByIdQuery(
    selectedTakeId!,
    { skip: !selectedTakeId }
  );
  const selectedTake = selectedTakeData?.data;

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFrozen, setIsFrozen] = useState(false);

  const [form, setForm] = useState({
    branch_id: "",
    note: "",
    items: [] as any[]
  });

  // Fetch stocks for the selected branch in the form
  const { data: branchStocksData, isFetching: isFetchingStocks } = useGetStocksByBranchQuery(
    form.branch_id,
    { skip: !form.branch_id || currentStep !== 1 }
  );

  const handleOpenCreate = () => {
    setSelectedTakeId(null);
    setCurrentStep(1);
    setIsFrozen(false);
    setForm({
      branch_id: selectedBranchId || "",
      note: "",
      items: []
    });
    setIsFormModalOpen(true);
  };

  const updateItem = (index: number, field: string, val: any) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: val };
    setForm({ ...form, items: newItems });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!form.branch_id) {
        toast.error("Please select a branch.");
        return;
      }
      if (!isFrozen) {
        toast.error("Please confirm that operations are frozen.");
        return;
      }

      // Initialize items from branch stocks
      const stocks = branchStocksData?.data || [];
      if (stocks.length === 0) {
        toast.error("No products found in this branch to audit.");
        return;
      }

      setForm(prev => ({
        ...prev,
        items: stocks.map((s: any) => ({
          variant_id: s.variant_id,
          product_name: s.product_name,
          variant_name: s.variant_name,
          sku: s.sku,
          system_stock: s.actual_stock || 0,
          physical_stock: s.actual_stock || 0,
          note: ""
        }))
      }));
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      branch_id: form.branch_id,
      note: form.note,
      items: form.items.map(item => ({
        variant_id: item.variant_id,
        expected_qty: item.system_stock,
        actual_qty: item.physical_stock,
        note: item.note
      }))
    };

    const success = await handleCreate(payload);
    if (success) setIsFormModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
            <AlertTriangle className="w-3 h-3" />
            Cancelled
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
    <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-[#06060a] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Stock Takes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Conduct and manage inventory audits and adjustments.</p>
        </div>

        <Button onClick={handleOpenCreate} startIcon={<Plus size={18} />} className="shadow-lg shadow-indigo-500/20">
          New Stock Take
        </Button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 dark:bg-gray-900/40 dark:backdrop-blur-md dark:border-white/5">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 dark:bg-indigo-500/10">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Audits</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{filteredStockTakes.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 dark:bg-gray-900/40 dark:backdrop-blur-md dark:border-white/5">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 dark:bg-amber-500/10">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Discrepancies</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {filteredStockTakes.filter((st: any) => st.status === 'completed').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 dark:bg-gray-900/40 dark:backdrop-blur-md dark:border-white/5">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 dark:bg-emerald-500/10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Status</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">Active</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900/40 dark:backdrop-blur-md dark:border-white/5">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by code or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none transition-all shadow-sm dark:text-white"
          >
            <option value="">All Branches</option>
            {branches.map((branch: any) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setSearch("")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-xl transition-colors dark:hover:bg-indigo-500/10"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 dark:bg-white/[0.03] dark:border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Items</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoadingStockTakes ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-gray-50/20 dark:bg-gray-800/20"></td>
                  </tr>
                ))
              ) : filteredStockTakes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500 dark:text-gray-400 font-medium">
                    No stock takes found.
                  </td>
                </tr>
              ) : (
                filteredStockTakes.map((take: any) => (
                  <tr key={take.id} className="hover:bg-gray-50/50 transition-colors group dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{take.code}</p>
                          <p className="text-xs text-gray-400">{format(new Date(take.created_at), "dd MMM yyyy HH:mm")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50/50 px-2 py-1 rounded-md w-fit dark:bg-indigo-500/10">
                        <Building2 className="w-3.5 h-3.5" />
                        {take.branch_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">{take.items_count || 0}</td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(take.status)}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                      {take.status === 'DRAFT' && (
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, id: take.id })}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                          title="Approve Audit"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedTakeId(take.id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} className="max-w-2xl">
        <div className="p-6 dark:bg-gray-900">
          {/* Progress Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 pr-14">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Step {currentStep} of 3</p>
                <p className="text-sm font-bold text-gray-900 truncate dark:text-white">
                  {currentStep === 1 && "Prepare Audit"}
                  {currentStep === 2 && "Physical Count"}
                  {currentStep === 3 && "Audit Summary"}
                </p>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Freeze Orders */}
            {currentStep === 1 && (
              <div className="space-y-6 py-4">
                <div className="text-center space-y-2">
                   <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:bg-amber-500/10">
                      <AlertTriangle className="w-8 h-8" />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">Operational Freeze</h3>
                   <p className="text-sm text-gray-500 font-medium">To ensure data accuracy, please confirm that no transactions are being processed.</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 font-medium dark:bg-gray-800 dark:border-gray-700">
                   <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isFrozen}
                        onChange={e => setIsFrozen(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white">
                        I confirm that all POS terminals at this branch are currently suspended and no new orders will be made during this audit.
                      </span>
                   </label>
                </div>

                <div className="space-y-1">
                  <Label required>Audit Branch</Label>
                  <select
                    className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    value={form.branch_id}
                    onChange={e => setForm({...form, branch_id: e.target.value})}
                    required
                  >
                    <option value="">Select Branch...</option>
                    {branches.map((branch: any) => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Physical Count */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Physical Inventory Check</h4>
                  <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider dark:bg-indigo-500/20">
                    {form.items.length} Items to audit
                  </div>
                </div>

                <div className="max-h-[350px] overflow-y-auto pr-2 -mr-2 space-y-3 no-scrollbar">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 dark:bg-gray-800 dark:border-gray-700">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{item.product_name}</p>
                          <p className="text-xs font-medium text-gray-400">{item.variant_name}</p>
                          <p className="text-xs font-medium text-gray-400 mt-1">System: <span className="font-bold text-gray-600 dark:text-gray-300">{item.system_stock}</span></p>
                        </div>
                        <div className="w-32">
                          <InputField
                            type="number"
                            value={item.physical_stock}
                            onChange={e => updateItem(idx, 'physical_stock', parseFloat(e.target.value) || 0)}
                            className="h-10 text-center font-bold"
                          />
                        </div>
                      </div>
                      {(item.physical_stock !== item.system_stock) && (
                        <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700">
                           <InputField
                             placeholder="Reason for discrepancy..."
                             value={item.note}
                             onChange={e => updateItem(idx, 'note', e.target.value)}
                             className="h-9 text-xs bg-white dark:bg-gray-900"
                           />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Summary */}
            {currentStep === 3 && (
              <div className="space-y-6">
                 <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-center dark:bg-indigo-500/10 dark:border-indigo-500/20">
                    <CheckCircle2 className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Audit Ready</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1 dark:text-gray-400">Please review the discrepancy summary below before final approval.</p>
                 </div>

                 <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Discrepancy Summary</p>
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm dark:bg-gray-900 dark:border-gray-800">
                       <table className="w-full text-left">
                          <thead className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider dark:bg-gray-800 dark:border-gray-800">
                             <tr>
                                <th className="px-4 py-2">Item</th>
                                <th className="px-4 py-2 text-center">Diff</th>
                                <th className="px-4 py-2">Reason</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                             {form.items.map((item, idx) => {
                               const diff = item.physical_stock - item.system_stock;
                               return (
                                <tr key={idx} className="text-xs">
                                   <td className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300">{item.product_name}</td>
                                   <td className="px-4 py-3 text-center">
                                      <span className={`font-bold ${diff !== 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                         {diff > 0 ? '+' : ''}{diff}
                                      </span>
                                   </td>
                                   <td className="px-4 py-3 text-gray-500 italic font-medium dark:text-gray-400">{item.note || "-"}</td>
                                </tr>
                               );
                             })}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <Label>Final Audit Note</Label>
                    <textarea
                      className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[80px] dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      placeholder="Add final comments for management..."
                      value={form.note}
                      onChange={e => setForm({...form, note: e.target.value})}
                    />
                 </div>
              </div>
            )}

            <div className="mt-8 flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              {currentStep > 1 && (
                <Button type="button" variant="outline" className="flex-1 dark:border-gray-700 dark:text-gray-300" onClick={handleBack}>Back</Button>
              )}
              {currentStep < 3 ? (
                <Button type="button" className="flex-1" onClick={handleNext} loading={isFetchingStocks}>Continue</Button>
              ) : (
                <Button type="submit" className="flex-1" startIcon={<ShieldCheck size={18} />} loading={isCreating}>Approve Audit</Button>
              )}
            </div>
          </form>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedTakeId} onClose={() => setSelectedTakeId(null)} className="max-w-2xl">
        <div className="p-6 dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center dark:bg-indigo-500/10">
              <ClipboardCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Stock Take Details</h3>
              <p className="text-sm text-gray-500 font-medium dark:text-gray-400">Audit summary and results.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date & Time</p>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {selectedTake && format(new Date(selectedTake.created_at), "dd MMM yyyy HH:mm")}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Audit Code</p>
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{selectedTake?.code}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Branch</p>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{selectedTake?.branch_name}</div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                <div>{selectedTake && getStatusBadge(selectedTake.status)}</div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Audit Items</p>
              <div className="max-h-[300px] overflow-y-auto rounded-2xl border border-gray-100 dark:border-gray-800 min-h-[100px] flex flex-col">
                {isFetchingDetail ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-3">
                    <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-sm font-medium text-gray-400">Loading audit details...</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky top-0">
                       <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3 text-center">System</th>
                          <th className="px-4 py-3 text-center">Actual</th>
                          <th className="px-4 py-3 text-center">Adj</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                       {selectedTake?.items?.length === 0 ? (
                         <tr>
                           <td colSpan={4} className="px-4 py-10 text-center text-gray-500">No items found in this audit.</td>
                         </tr>
                       ) : (
                         selectedTake?.items?.map((item: any) => (
                            <tr key={item.id} className="dark:bg-gray-900/50">
                               <td className="px-4 py-3">
                                  <p className="font-bold text-gray-800 dark:text-gray-200">{item.product_name}</p>
                                  <p className="text-[10px] text-gray-400">{item.variant_name}</p>
                                  {item.note && (
                                    <p className="text-[10px] text-rose-500 italic mt-1 font-medium bg-rose-50 px-1.5 py-0.5 rounded w-fit dark:bg-rose-500/10 dark:text-rose-400">
                                      Reason: {item.note}
                                    </p>
                                  )}
                               </td>
                               <td className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">{item.expected_qty}</td>
                               <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">{item.actual_qty}</td>
                               <td className="px-4 py-3 text-center">
                                  <span className={`font-bold ${item.adjustment_qty !== 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                     {item.adjustment_qty > 0 ? '+' : ''}{item.adjustment_qty}
                                  </span>
                               </td>
                            </tr>
                         ))
                       )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Audit Note</p>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 italic font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                {isFetchingDetail ? "Loading notes..." : (selectedTake?.note || "No notes provided.")}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
             <Button variant="outline" className="flex-1 dark:border-gray-700 dark:text-gray-300" onClick={() => setSelectedTakeId(null)}>Close</Button>

             {selectedTake?.status === 'DRAFT' && (
                <Button
                  className="flex-1"
                  startIcon={<ShieldCheck size={18} />}
                  loading={isUpdating}
                  onClick={() => setConfirmModal({ isOpen: true, id: selectedTake.id })}
                >
                  Approve Audit
                </Button>
             )}

             {selectedTake?.status === 'COMPLETED' && (
                <Button className="flex-1" startIcon={<ArrowRightLeft size={16} />}>Export Report</Button>
             )}
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        className="max-w-md"
      >
        <div className="p-8 text-center dark:bg-gray-900">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-emerald-500/10">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirm Approval</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Are you sure you want to approve this audit? This action will permanently adjust your system stock to match the physical count.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 dark:border-gray-700 dark:text-gray-300"
              onClick={() => setConfirmModal({ isOpen: false, id: null })}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={isUpdating}
              onClick={async () => {
                if (confirmModal.id) {
                  const success = await handleUpdate(confirmModal.id, { status: 'COMPLETED' });
                  if (success) {
                    setConfirmModal({ isOpen: false, id: null });
                  }
                }
              }}
            >
              Confirm & Approve
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
