"use client";
import React, { useState, useMemo } from "react";
import {
  Search, Plus, Trash2, Edit,
  FileText, ShoppingCart, User, Calendar,
  CheckCircle2, Clock, AlertCircle, Filter, 
  ChevronRight, DollarSign, Loader2, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { 
  useGetPurchaseOrdersQuery, 
  useCreatePurchaseOrderMutation,
  useCancelPurchaseOrderMutation 
} from "@/store/api/purchaseApi";
import { useGetSuppliersQuery } from "@/store/api/supplierApi";
import { useGetBranchesQuery } from "@/store/api/branchApi";
import { useGetProductsQuery } from "@/store/api/productApi";

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ 
    branch_id: "",
    supplier_id: "", 
    note: "",
    items: [{ variant_id: "", quantity: 1, price: 0 }] 
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: poData, isLoading: isLoadingPO, isFetching: isFetchingPO } = useGetPurchaseOrdersQuery(undefined);
  const { data: branchData } = useGetBranchesQuery(undefined);
  const { data: supplierData } = useGetSuppliersQuery(undefined);
  const { data: productData } = useGetProductsQuery(undefined);
  
  const [createPO, { isLoading: isCreating }] = useCreatePurchaseOrderMutation();
  const [cancelPO, { isLoading: isCancelling }] = useCancelPurchaseOrderMutation();

  const orders = poData?.data || [];
  const branches = branchData?.data || [];
  const suppliers = supplierData?.data || [];
  const products = productData?.data || [];

  // Create flat list of variants for item selection
  const variantOptions = useMemo(() => {
    const options: { label: string, value: string, price: number }[] = [];
    products.forEach((p: any) => {
      p.variants?.forEach((v: any) => {
        options.push({
          label: `${p.name} - ${v.name}`,
          value: v.id,
          price: v.cost_price || 0
        });
      });
    });
    return options;
  }, [products]);

  const filtered = useMemo(() => {
    return orders.filter((o: any) => 
      o.code.toLowerCase().includes(search.toLowerCase()) || 
      suppliers.find((s: any) => s.id === o.supplier_id)?.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [orders, search, suppliers]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filtered.length);

  const calculateTotal = () => {
    return form.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { variant_id: "", quantity: 1, price: 0 }] });
  };

  const removeItem = (index: number) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems.length > 0 ? newItems : [{ variant_id: "", quantity: 1, price: 0 }] });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...form.items];
    let updatedItem = { ...newItems[index], [field]: value };
    
    // Auto-fill price if variant is selected
    if (field === 'variant_id') {
      const selectedVariant = variantOptions.find(v => v.value === value);
      if (selectedVariant) {
        updatedItem.price = selectedVariant.price;
      }
    }
    
    newItems[index] = updatedItem;
    setForm({ ...form, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPO(form).unwrap();
      toast.success("Purchase Order created successfully");
      setModalOpen(false);
      setForm({ branch_id: "", supplier_id: "", note: "", items: [{ variant_id: "", quantity: 1, price: 0 }] });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create PO");
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "received":
      case "completed": return "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400";
      case "ordered":
      case "pending": return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
      case "draft": return "bg-gray-100 text-gray-500 dark:bg-gray-800";
      case "cancelled": return "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Purchase Orders</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create and track orders sent to your suppliers.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} startIcon={<Plus size={18} />}>
          Create PO
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600">
            <FileText size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{orders.length}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total POs</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600">
            <Clock size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{orders.filter((o:any) => o.status === "pending").length}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Orders</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-500/20 text-green-600">
            <DollarSign size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">
              Rp {orders.reduce((acc: number, o: any) => acc + (o.total || 0), 0).toLocaleString()}
            </p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Value</p>
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
                placeholder="Search PO Code or supplier..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-11 rounded-xl border border-transparent bg-gray-50/50 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-white/5 dark:bg-gray-950 dark:text-white/90 dark:placeholder-gray-500"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-white/[0.03]">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Order Details</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Supplier</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Total Amount</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoadingPO ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-500" />
                    <p className="mt-2 text-sm text-gray-500">Loading purchase orders...</p>
                  </td>
                </tr>
              ) : paginatedOrders.map((order: any) => (
                <tr key={order.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate max-w-[150px]">{order.code}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} /> {new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {suppliers.find((s: any) => s.id === order.supplier_id)?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400">{order.items?.length || 0} items ordered</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">Rp {(order.total || 0).toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg dark:hover:bg-brand-500/10 transition-colors">
                        <Edit size={16} />
                      </button>
                      {(order.status === 'PENDING' || order.status === 'pending' || order.status === 'ORDERED' || order.status === 'ordered') && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCancelId(order.id); }} 
                          className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 rounded-lg dark:hover:bg-error-500/10 transition-colors"
                          title="Cancel Order"
                        >
                          <AlertCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoadingPO && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                        <ShoppingCart size={26} className="text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-700 dark:text-white/90">No purchase orders found</p>
                      <p className="mt-1 text-xs text-gray-400">Try changing your search keywords or create a new one.</p>
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
              {filtered.length === 0 ? "0 order" : `${startItem}–${endItem} dari ${filtered.length} order`}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Tampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => {setPageSize(Number(e.target.value)); setCurrentPage(1);}}
                className="h-7 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {[5, 10, 25, 50].map((s: number) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="text-xs text-gray-400">per halaman</span>
            </div>
          </div>

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
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="rotate-90" />
            </button>
            
            <span className="px-4 text-xs font-medium text-gray-600 dark:text-gray-400">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="-rotate-90" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="-rotate-90" />
              <ChevronDown size={13} className="-ml-2 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-4xl">
        <div className="border-b border-gray-100 p-4 sm:p-5 dark:border-gray-800">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-800 dark:text-white/90">Create Purchase Order</h4>
              <p className="text-xs sm:text-sm text-gray-400">Add products and quantities for this order.</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Target Branch</Label>
              <select 
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                value={form.branch_id}
                onChange={e => setForm({...form, branch_id: e.target.value})}
                required
              >
                <option value="">Select Branch...</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label required>Supplier</Label>
              <select 
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                value={form.supplier_id}
                onChange={e => setForm({...form, supplier_id: e.target.value})}
                required
              >
                <option value="">Select Supplier...</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">Order Items</h5>
              <Button type="button" variant="outline" size="sm" onClick={addItem} startIcon={<Plus size={14} />}>
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 sm:gap-3 items-end bg-gray-50/50 p-3 rounded-xl dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <div className="col-span-12 sm:col-span-5">
                    <Label className="text-[11px] sm:text-xs">Product / Variant</Label>
                    <select 
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                      value={item.variant_id}
                      onChange={e => updateItem(index, 'variant_id', e.target.value)}
                      required
                    >
                      <option value="">Select Product...</option>
                      {variantOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-span-3 sm:col-span-2">
                    <Label className="text-[11px] sm:text-xs">Qty</Label>
                    <InputField 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))}
                      className="h-10 text-xs px-2"
                    />
                  </div>
                  <div className="col-span-7 sm:col-span-4">
                    <Label className="text-[11px] sm:text-xs">Unit Price (Rp)</Label>
                    <InputField 
                      type="number" 
                      placeholder="0" 
                      value={item.price} 
                      onChange={e => updateItem(index, 'price', parseInt(e.target.value))}
                      className="h-10 text-xs px-2"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-0.5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Order Note (Optional)</Label>
            <textarea 
              rows={2}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
              placeholder="E.g. Delivery before 10 AM, handle with care..."
              value={form.note}
              onChange={e => setForm({...form, note: e.target.value})}
            />
          </div>

          <div className="flex flex-col items-end gap-2 border-t border-gray-100 pt-5 dark:border-gray-800">
            <div className="flex items-center gap-6">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Grand Total</span>
              <span className="text-lg font-bold text-gray-800 dark:text-white">Rp {calculateTotal().toLocaleString()}</span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto mt-4">
              <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 sm:flex-none px-8" disabled={isCreating}>
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Order"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <AlertDialog 
        isOpen={!!cancelId} 
        onClose={() => setCancelId(null)} 
        onConfirm={async () => { 
          try {
            await cancelPO(cancelId!).unwrap();
            toast.success("Purchase Order cancelled successfully");
          } catch (err: any) {
            toast.error(err?.data?.message || "Failed to cancel PO");
          } finally {
            setCancelId(null);
          }
        }}
        title="Cancel Purchase Order?"
        description="This will mark the order as CANCELLED. You will still be able to see it in the history for tracking purposes."
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
}
