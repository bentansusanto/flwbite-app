"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, Trash2, Edit,
  Package, Truck, Calendar, FileCheck,
  CheckCircle2, Clock, AlertCircle, Filter, 
  ChevronRight, Box, Loader2, ChevronDown, RefreshCcw
} from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { 
  useGetPurchaseOrdersQuery, 
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseReceivingMutation,
  useGetPurchaseReceivingsQuery 
} from "@/store/api/purchaseApi";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetSuppliersQuery } from "@/store/api/supplierApi";

export default function PurchaseReceivingPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ 
    purchase_order_id: "", 
    branch_id: "",
    received_at: new Date().toISOString(),
    status: "COMPLETED",
    note: "",
    items: [] as { product_variant_id: string, qty: number, cost: number }[] 
  });

  // Local state for displaying items in modal (mapping variant IDs to names)
  const [displayItems, setDisplayItems] = useState<any[]>([]);

  const { data: poListData, isLoading: isLoadingPOList } = useGetPurchaseOrdersQuery(undefined);
  const { data: receivingData, isLoading: isLoadingReceiving } = useGetPurchaseReceivingsQuery(undefined);
  const { data: productData } = useGetProductsQuery(undefined);
  const { data: supplierData } = useGetSuppliersQuery(undefined);
  
  // To get items for selected PO
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);
  const { data: selectedPOData, isFetching: isFetchingPODetails } = useGetPurchaseOrderByIdQuery(selectedPOId as string, {
    skip: !selectedPOId
  });

  // Find supplier name for the selected PO
  const selectedPOSupplier = useMemo(() => {
    if (!selectedPOData?.data || !supplierData?.data) return null;
    return supplierData.data.find((s: any) => s.id === selectedPOData.data.supplier_id);
  }, [selectedPOData, supplierData]);

  const [receiveGoods, { isLoading: isReceiving }] = useCreatePurchaseReceivingMutation();

  const allPOs = poListData?.data || [];
  const receipts = receivingData?.data || [];
  
  // Only POs that can be received
  const poList = useMemo(() => {
    return allPOs.filter((po: any) => {
      const s = po.status?.toUpperCase();
      return s === "PENDING" || s === "ORDERED" || s === "PARTIAL";
    });
  }, [allPOs]);

  const products = productData?.data || [];

  // Flat variants map for lookup
  const variantsMap = useMemo(() => {
    const map: Record<string, string> = {};
    products.forEach((p: any) => {
      p.variants?.forEach((v: any) => {
        map[v.id] = `${p.name} - ${v.name}`;
      });
    });
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    return receipts.filter((r: any) => {
      const po = allPOs.find((p: any) => p.id === r.purchase_order_id);
      return r.id.toLowerCase().includes(search.toLowerCase()) || 
             (po?.code || "").toLowerCase().includes(search.toLowerCase());
    });
  }, [receipts, search, allPOs]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filtered.length);

  // Update form items when selected PO data arrives
  useEffect(() => {
    if (selectedPOData?.data) {
      const po = selectedPOData.data;
      const initialItems = po.items.map((item: any) => ({
        product_variant_id: item.variant_id,
        qty: 0,
        cost: item.price
      }));
      setForm(prev => ({ 
        ...prev, 
        purchase_order_id: po.id, 
        branch_id: po.branch_id,
        items: initialItems 
      }));
      
      const display = po.items.map((item: any) => {
        const alreadyReceived = item.received_quantity || 0;
        const remaining = item.quantity - alreadyReceived;
        return {
          ...item,
          name: variantsMap[item.variant_id] || "Unknown Item",
          qty_ordered: item.quantity,
          qty_already_received: alreadyReceived,
          qty_remaining: remaining,
          current_receive: 0, // Default to 0 for safety, forcing user to input
          raw_input: "0"
        };
      });
      setDisplayItems(display);
    }
  }, [selectedPOData, variantsMap]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.purchase_order_id) {
      toast.error("Silakan pilih Purchase Order");
      return;
    }
    try {
      await receiveGoods(form).unwrap();
      toast.success("Barang diterima dan stok diperbarui");
      setModalOpen(false);
      setForm({ purchase_order_id: "", branch_id: "", received_at: new Date().toISOString(), status: "COMPLETED", note: "", items: [] });
      setSelectedPOId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menerima barang");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Penerimaan Barang</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola dan konfirmasi pengiriman masuk dari pemasok.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} startIcon={<Plus size={18} />}>
          Terima Barang
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600">
            <Package size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{receipts.length}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Diterima</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600">
            <Clock size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{poList.length}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Menunggu PO</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-500/20 text-green-600">
            <FileCheck size={20} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">
              {receipts.filter((r: any) => new Date(r.received_at).toDateString() === new Date().toDateString()).length}
            </p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Item Hari Ini</p>
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
                placeholder="Cari ID penerimaan atau nomor PO..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-11 rounded-xl border border-transparent bg-gray-50/50 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-white/5 dark:bg-gray-950 dark:text-white/90 dark:placeholder-gray-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 h-11 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 transition-colors">
                <Filter size={16} /> Filter
              </button>
              <button onClick={() => { setSearch(""); setCurrentPage(1); }} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 h-11 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 transition-colors">
                 <RefreshCcw size={16} /> Reset
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-white/[0.03]">
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Detail Penerimaan</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Sumber PO</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Pemasok</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoadingReceiving ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-500" />
                    <p className="mt-2 text-sm text-gray-500">Memuat penerimaan...</p>
                  </td>
                </tr>
              ) : paginatedReceipts.map((receipt: any) => {
                const po = allPOs.find((p: any) => p.id === receipt.purchase_order_id);
                const supplier = supplierData?.data?.find((s: any) => s.id === po?.supplier_id);
                
                return (
                  <tr key={receipt.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate max-w-[150px]">
                          {receipt.code}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={12} /> {new Date(receipt.received_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {po?.code || "Loading..."}
                      </p>
                      <p className="text-xs text-gray-400">Ref: {po?.id.slice(0, 8).toUpperCase() || "..."}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {supplier?.name || "Pemasok Tidak Diketahui"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        receipt.status === 'COMPLETED' ? 'bg-success-50 text-success-600 dark:bg-success-500/10' : 
                        receipt.status === 'PARTIAL' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' :
                        'bg-gray-100 text-gray-500 dark:bg-gray-800'
                      }`}>
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg dark:hover:bg-brand-500/10 transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!isLoadingReceiving && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center mb-4 border border-gray-100 dark:border-white/5">
                        <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-base font-bold text-gray-900 dark:text-white">Tidak ada data Penerimaan Barang</p>
                      <p className="text-sm mt-1 max-w-sm">Data penerimaan barang tidak ditemukan. Pastikan filter pencarian sudah benar.</p>
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
              {filtered.length === 0 ? "0 receipt" : `${startItem}–${endItem} dari ${filtered.length} receipt`}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Tampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => {setPageSize(Number(e.target.value)); setCurrentPage(1);}}
                className="appearance-none h-7 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {[5, 10, 25, 50].map((s) => (
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
              <Box size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-800 dark:text-white/90">Terima Barang</h4>
              <p className="text-xs sm:text-sm text-gray-400">Catat stok masuk dari Purchase Order.</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label required className="mb-0">Sumber Purchase Order</Label>
                <div className="flex gap-2">
                  {selectedPOSupplier && (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                      {selectedPOSupplier.name}
                    </span>
                  )}
                  {selectedPOData?.data && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      selectedPOData.data.status === 'RECEIVED' ? 'bg-success-50 text-success-600 dark:bg-success-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
                    }`}>
                      {selectedPOData.data.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative">
                <select 
                  className="appearance-none w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all font-medium"
                  value={form.purchase_order_id}
                  onChange={e => {
                    setForm({...form, purchase_order_id: e.target.value});
                    setSelectedPOId(e.target.value);
                  }}
                  required
                >
                  <option value="">Pilih nomor PO...</option>
                  {poList.map((po: any) => (
                    <option key={po.id} value={po.id}>
                      {po.code || po.id.slice(0, 8).toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <Label required>Status Penerimaan</Label>
              <div className="relative">
                <select 
                  className="appearance-none w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all font-medium"
                  value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}
                  required
                >
                  <option value="COMPLETED">COMPLETED (Semua Diterima)</option>
                  <option value="PARTIAL">PARTIAL (Diterima Sebagian)</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Catatan</Label>
              <InputField 
                placeholder="Cth. Kemasan rusak pada item #2" 
                value={form.note} 
                onChange={e => setForm({...form, note: e.target.value})} 
              />
            </div>
            <div>
              <Label required>Tanggal Diterima</Label>
              <InputField 
                type="date"
                value={form.received_at.split('T')[0]} 
                onChange={e => setForm({...form, received_at: new Date(e.target.value).toISOString()})} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">Item Diterima</h5>
              {isFetchingPODetails && <Loader2 className="h-4 w-4 animate-spin text-brand-500" />}
            </div>

            <div className="space-y-3">
              {displayItems.length === 0 && !isFetchingPODetails && (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-400">Pilih Purchase Order untuk melihat item.</p>
                </div>
              )}
              {displayItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 sm:gap-3 items-end bg-gray-50/50 p-3 rounded-xl dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <div className="col-span-12 sm:col-span-6">
                    <Label className="text-[11px] sm:text-xs">Nama Produk</Label>
                    <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-white">
                      {item.name}
                    </div>
                  </div>
                   <div className="col-span-6 sm:col-span-3">
                    <Label className="text-[11px] sm:text-xs text-gray-400">Status Pesanan</Label>
                    <div className="h-10 flex flex-col justify-center px-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 text-[10px] leading-tight">
                      <span className="text-gray-500">Total: {item.qty_ordered}</span>
                      <span className="text-success-600 font-medium">Diterima: {item.qty_already_received}</span>
                      <span className="text-brand-600 font-bold">Sisa: {item.qty_remaining}</span>
                    </div>
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <Label className="text-[11px] sm:text-xs text-brand-600 font-semibold">Qty Diterima Sebenarnya</Label>
                    <InputField 
                      type="number" 
                      placeholder="0" 
                      min="0"
                      max={(item.qty_ordered - item.qty_received).toString()}
                      value={item.current_receive === 0 && item.raw_input === "" ? "" : item.current_receive} 
                      error={item.current_receive > item.qty_remaining}
                      hint={item.current_receive > item.qty_remaining ? `Maksimal ${item.qty_remaining}` : ""}
                      onChange={e => {
                        const valStr = e.target.value;
                        const valNum = parseInt(valStr) || 0;
                        
                        // Update form state
                        const newItems = [...form.items];
                        newItems[index].qty = valNum;
                        setForm({ ...form, items: newItems });

                        // Update display items for UI/validation
                        const newDisplay = [...displayItems];
                        newDisplay[index].current_receive = valNum;
                        newDisplay[index].raw_input = valStr; // track raw string to allow empty
                        setDisplayItems(newDisplay);
                      }}
                      className="h-10 text-xs px-2 border-brand-200 focus:border-brand-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" className="flex-1 sm:flex-none px-8" disabled={isReceiving || !form.purchase_order_id}>
              {isReceiving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Konfirmasi Penerimaan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
