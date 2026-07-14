"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { ShoppingCart, Clock, User, Trash2, ArrowRight, Package, Eye, Users } from "lucide-react";

interface OrderQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingOrders: any[];
  paidOrders: any[];
  onResume: (order: any) => void;
  onCancel: (orderId: string) => void;
  onComplete: (orderId: string) => Promise<void>;
  isLoading?: boolean;
}

export const OrderQueueModal = ({
  isOpen,
  onClose,
  pendingOrders = [],
  paidOrders = [],
  onResume,
  onCancel,
  onComplete,
  isLoading = false
}: OrderQueueModalProps) => {
  const [activeTab, setActiveTab] = React.useState<"pending" | "paid">("pending");
  const [viewingOrder, setViewingOrder] = React.useState<any | null>(null);
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / 60000);

    if (diffInMinutes < 1) return "Baru saja";
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    return then.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const currentOrders = activeTab === "pending" ? pendingOrders : paidOrders;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Antrian Pesanan"
        className="max-w-3xl w-[95%] sm:w-[90%] mx-auto"
      >
        <div className="flex flex-col h-auto max-h-[50vh] sm:max-h-[60vh] lg:h-[650px] lg:max-h-[85vh]">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === "pending" ? "text-brand-600 dark:text-brand-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              Menunggu Bayar ({pendingOrders.length})
              {activeTab === "pending" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-500" />}
            </button>
            <button
              onClick={() => setActiveTab("paid")}
              className={`flex-1 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === "paid" ? "text-brand-600 dark:text-brand-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              Sedang Disiapkan ({paidOrders.length})
              {activeTab === "paid" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-500" />}
            </button>
          </div>

          <div className="p-4 border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-800/20">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center italic">
              {activeTab === "pending"
                ? "Pesanan yang disimpan namun belum dibayar."
                : "Pesanan lunas yang sedang dalam proses penyiapan."}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : currentOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300">
                  <Users size={40} />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-bold">Antrian Kosong</p>
                  <p className="text-gray-400 text-sm">Tidak ada pesanan di kategori ini.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {currentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:border-brand-600 transition-all group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          activeTab === "pending" ? "bg-orange-50 text-orange-600" : "bg-brand-50 text-brand-600"
                        }`}>
                          <Users size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-[200px]">
                              {order.customer_name || "Pelanggan"}
                            </h4>
                            {order.table_number && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold rounded-md">
                                MEJA {order.table_number}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Package size={12} /> {order.items?.length || 0} Produk
                            </span>
                            <span>•</span>
                            <span>{getTimeAgo(order.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6 lg:gap-8 border-t lg:border-t-0 pt-4 lg:pt-0">
                        <div className="text-left lg:text-right">
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Total</p>
                          <p className="text-base sm:text-lg font-bold text-brand-600 dark:text-brand-400">{formatCurrency(order.final_amount || order.total_amount)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="p-2 sm:p-3 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/10 rounded-xl transition-all"
                            title="Lihat Detail"
                          >
                            <Eye size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          {activeTab === "pending" ? (
                            <>
                              <button
                                onClick={() => onCancel(order.id)}
                                className="p-2 sm:p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                title="Batalkan Pesanan"
                              >
                                <Trash2 size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <Button
                                onClick={() => {
                                  onResume(order);
                                }}
                                className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-sm"
                                endIcon={<ArrowRight size={18} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
                              >
                                Panggil
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={async () => {
                                setProcessingId(order.id);
                                try {
                                  await onComplete(order.id);
                                } finally {
                                  setProcessingId(null);
                                }
                              }}
                              disabled={processingId === order.id}
                              className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-sm"
                            >
                              {processingId === order.id ? "Memproses..." : "Selesaikan"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" onClick={onClose} className="w-full h-12 rounded-xl text-gray-500 dark:text-gray-400 dark:border-gray-700">
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal Overlay */}
      {viewingOrder && (
        <Modal
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          title="Detail Pesanan"
          className="max-w-lg w-[90%] mx-auto z-[99999]"
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-600">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{viewingOrder.customer_name || "Pelanggan"}</h4>
                  <p className="text-xs text-gray-400">ID Pesanan: {viewingOrder.order_number || viewingOrder.id.slice(0, 8)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                  activeTab === "pending" ? "bg-orange-50 text-orange-600" : "bg-brand-50 text-brand-600"
                }`}>
                  {activeTab === "pending" ? "Belum Bayar" : "Diproses"}
                </span>
              </div>
            </div>

            <div className="space-y-4 max-h-[50vh] sm:max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
              {viewingOrder.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between gap-4 group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs font-bold">
                      {item.qty}x
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.variant_name || "Produk"}</p>
                      {item.notes && <p className="text-[11px] text-gray-400 italic">"{item.notes}"</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(item.total || (item.price * item.qty))}</p>
                    <p className="text-[10px] text-gray-400">@{formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            {viewingOrder.notes && (
              <div className="p-4 bg-orange-50/30 dark:bg-orange-500/5 rounded-2xl border border-dashed border-orange-200/50 dark:border-orange-500/20">
                <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase mb-1.5 tracking-widest">Catatan Pesanan</p>
                <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
                  "{viewingOrder.notes}"
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(viewingOrder.total_amount)}</span>
              </div>
              {viewingOrder.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pajak</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(viewingOrder.tax_amount)}</span>
                </div>
              )}
              {viewingOrder.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 text-red-500">Diskon</span>
                  <span className="font-medium text-red-500">-{formatCurrency(viewingOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="font-bold text-gray-900 dark:text-white">Total Akhir</span>
                <span className="text-xl font-black text-brand-600">{formatCurrency(viewingOrder.final_amount || viewingOrder.total_amount)}</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setViewingOrder(null)}
              className="w-full h-11 rounded-xl"
            >
              Tutup Detail
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};
