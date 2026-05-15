"use client";

import React, { useState } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus, ChevronRight, Filter, Power, Package, UserPlus, Users } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { PosSessionGuard } from "../pos-session/PosSessionGuard";
import { CloseSessionModal } from "../pos-session/CloseSessionModal";
import { CheckoutModal } from "./CheckoutModal";
import Cookies from "js-cookie";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetCategoriesQuery } from "@/store/api/categoryApi";
import { useCreateOrderMutation, usePayOrderMutation, useGetTransactionsQuery, useCancelOrderMutation, useCompleteOrderMutation } from "@/store/api/orderApi";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/drawer";
import { useGetStocksByBranchQuery } from "@/store/api/stockApi";
import { VariantSelectionModal } from "./VariantSelectionModal";
import { CustomerSelectionModal } from "./CustomerSelectionModal";
import { Modal } from "@/components/ui/modal";
import { OrderQueueModal } from "./OrderQueueModal";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";

interface CartItem {
  id: string; // product id
  variant_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export const NewOrdersPage = () => {
  const [selectedBusinessType, setSelectedBusinessType] = useState<"all" | "retail" | "f&b" | "service">("all");
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCloseSessionOpen, setIsCloseSessionOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [orderIdToCancel, setOrderIdToCancel] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");

  const role = Cookies.get("flwbite_role");
  const branchId = Cookies.get("flwbite_branch");

  // API Queries
  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery({});
  const { data: pendingOrdersData, isLoading: isLoadingPending } = useGetTransactionsQuery({
    status: "PENDING",
    branch_id: branchId
  }, { skip: !branchId });
  const { data: paidOrdersData, isLoading: isLoadingPaid } = useGetTransactionsQuery({
    status: "PAID",
    branch_id: branchId
  }, { skip: !branchId });
  const { data: stocksData } = useGetStocksByBranchQuery(branchId || "", { skip: !branchId });
  const [cancelOrder] = useCancelOrderMutation();
  const [completeOrder] = useCompleteOrderMutation();

  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [payOrder, { isLoading: isPaying }] = usePayOrderMutation();

  const products = productsData?.data || [];
  const categoriesList = categoriesData?.data || [];
  const pendingOrders = pendingOrdersData?.data || [];
  const paidOrders = paidOrdersData?.data || [];

  const handleResumeOrder = (order: any) => {
    if (cart.length > 0) {
      const confirm = window.confirm("Keranjang saat ini tidak kosong. Apakah Anda ingin menggantinya dengan pesanan dari antrian?");
      if (!confirm) return;
    }

    setCart(order.items.map((item: any) => ({
      id: item.product_id, // ensure correct field
      variant_id: item.variant_id,
      name: item.product_name || item.variant_name,
      price: item.price,
      quantity: item.qty,
      image: item.image
    })));

    if (order.customer_id) {
       setSelectedCustomer({ id: order.customer_id, name: order.customer_name });
    } else {
       setSelectedCustomer(null);
       setCustomerName(order.customer_name);
    }

    setTableNumber(order.table_number || "");
    setIsQueueModalOpen(false);
    toast.success(`Pesanan ${order.customer_name || ""} berhasil dipanggil.`);
  };

  const handleConfirmCancel = async () => {
    if (!orderIdToCancel) return;
    try {
      toast.loading("Membatalkan pesanan...", { id: "cancel-order" });
      await cancelOrder(orderIdToCancel).unwrap();
      toast.success("Pesanan berhasil dibatalkan.", { id: "cancel-order" });
      setIsCancelAlertOpen(false);
      setOrderIdToCancel(null);
    } catch (err) {
      toast.error("Gagal membatalkan pesanan.", { id: "cancel-order" });
    }
  };

  // Get categories that actually have products in them (and filter by business type if selected)
  const availableCategories = categoriesList.filter((cat: any) => {
    if (selectedBusinessType === "all") return true;
    return products.some((p: any) => p.category_id === cat.id && p.type === selectedBusinessType);
  });

  const categoryNames = ["All Items", ...availableCategories.map((c: any) => c.name)];

  const filteredProducts = products.filter((product: any) => {
    // 1. Business Type Filter
    const matchesBusinessType = selectedBusinessType === "all" || product.type === selectedBusinessType;

    // 2. Category Filter
    const selectedCatObj = categoriesList.find((c: any) => c.name === selectedCategory);
    const matchesCategory = selectedCategory === "All Items" ||
                           (product.category?.name === selectedCategory) ||
                           (selectedCatObj && product.category_id === selectedCatObj.id);

    // 3. Search Filter
    const searchLower = searchQuery.toLowerCase();
    const matchesName = product.name.toLowerCase().includes(searchLower);
    const matchesSKU = product.variants?.some((v: any) =>
      v.sku?.toLowerCase().includes(searchLower)
    );

    return matchesBusinessType && matchesCategory && (matchesName || matchesSKU);
  });

  const handleProductClick = (product: any) => {
    if (product.variants?.length === 1) {
      addToCart(product, product.variants[0]);
    } else if (product.variants?.length > 1) {
      setSelectedProduct(product);
      setIsVariantModalOpen(true);
    } else {
      toast.error("Produk ini tidak memiliki varian.");
    }
  };

  const addToCart = (product: any, variant: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.variant_id === variant.id);
      if (existing) {
        return prev.map(item => item.variant_id === variant.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        id: product.id,
        variant_id: variant.id,
        name: product.variants?.length > 1 ? `${product.name} (${variant.name})` : product.name,
        price: variant.price,
        quantity: 1,
        image: product.image
      }];
    });
  };

  const removeFromCart = (variant_id: string) => {
    setCart(prev => prev.filter(item => item.variant_id !== variant_id));
  };

  const updateQuantity = (variant_id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.variant_id === variant_id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleCheckoutConfirm = async (paymentMethod: "CASH" | "QRIS", amountPaid: number) => {
    if (!branchId) {
      toast.error("Cabang tidak terdeteksi. Silakan buka sesi kembali.");
      return;
    }

    try {
      const orderRes = await createOrder({
        type: selectedBusinessType === "all" ? "RETAIL" : selectedBusinessType.toUpperCase(),
        branch_id: branchId,
        customer_name: selectedCustomer?.name || "Customer",
        items: cart.map(item => ({
          variant_id: item.variant_id,
          qty: item.quantity
        })),
        tax_amount: tax,
        discount_amount: 0,
        notes: notes
      }).unwrap();

      const orderId = orderRes.data.id;

      await payOrder({
        order_id: orderId,
        payment_method: paymentMethod,
        amount: total
      }).unwrap();

      toast.success("Transaksi Berhasil!");
      setCart([]);
      setSelectedCustomer(null);
      setIsCheckoutOpen(false);
      setIsDrawerOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Terjadi kesalahan saat memproses pesanan.");
    }
  };

  const handleSaveOrder = async () => {
    if (!branchId) {
      toast.error("Cabang tidak terdeteksi.");
      return;
    }

    try {
      await createOrder({
        type: selectedBusinessType === "all" ? "RETAIL" : selectedBusinessType.toUpperCase(),
        branch_id: branchId,
        customer_name: selectedCustomer?.name || customerName || "Customer",
        table_number: tableNumber,
        items: cart.map(item => ({
          variant_id: item.variant_id,
          qty: item.quantity
        })),
        tax_amount: tax,
        discount_amount: 0,
        notes: notes
      }).unwrap();

      toast.success("Pesanan berhasil disimpan di antrian.");
      setCart([]);
      setSelectedCustomer(null);
      setCustomerName("");
      setTableNumber("");
      setNotes("");
      setIsSaveModalOpen(false);
      setIsDrawerOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menyimpan pesanan.");
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const CartItemsList = () => (
    <div className="space-y-4">
      {cart.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-2xl">🛒</div>
          <div>
            <p className="text-gray-900 dark:text-white font-semibold">Keranjang Kosong</p>
            <p className="text-gray-400 text-sm">Pilih produk untuk mulai memesan</p>
          </div>
        </div>
      ) : (
        cart.map((item) => (
          <div key={item.variant_id} className="flex gap-4 group items-center">
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</h5>
              <p className="text-xs text-gray-500">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 dark:bg-white/[0.05] dark:border dark:border-white/10 rounded-xl p-1">
                <button
                  onClick={() => updateQuantity(item.variant_id, -1)}
                  className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.variant_id, 1)}
                  className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => removeFromCart(item.variant_id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <PosSessionGuard>
    <div className="bg-gray-50/50 dark:bg-[#06060a] p-6 h-screen overflow-hidden">
      <div className="flex flex-col lg:flex-row h-full gap-6 overflow-hidden pb-20 lg:pb-0">
      {/* Left Side: Product Selection */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900/40 dark:backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/5 overflow-hidden">
        {/* Header with Close Session */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Point of Sale</h2>
            <button
              onClick={() => setIsQueueModalOpen(true)}
              className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 transition-colors relative group"
            >
              <Users className="w-5 h-5 text-gray-400" />
              {pendingOrders.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
                  {pendingOrders.length}
                </div>
              )}
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Antrian Pesanan</span>
            </button>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsCloseSessionOpen(true)}
            className="border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 lg:px-4 py-1.5 lg:py-2 h-auto text-xs lg:text-sm flex items-center gap-2"
          >
            <Power className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Tutup Sesi</span>
            <span className="sm:hidden">Keluar</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 space-y-5">
          {/* Business Type Tabs */}
          <div className="flex bg-gray-100/50 dark:bg-gray-950 p-1 rounded-2xl w-fit border border-gray-100 dark:border-white/5">
            {[
              { id: "all", label: "Semua", icon: "💎" },
              { id: "retail", label: "Retail", icon: "📦" },
              { id: "f&b", label: "F&B", icon: "🍴" },
              { id: "service", label: "Jasa", icon: "⭐" },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedBusinessType(type.id as any);
                  setSelectedCategory("All Items"); // Reset category when switching business type
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedBusinessType === type.id
                    ? "bg-white dark:bg-gray-900 text-indigo-600 shadow-sm ring-1 ring-gray-100 dark:ring-white/10"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Cari di ${selectedBusinessType === 'all' ? 'semua produk' : selectedBusinessType}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50/50 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 no-scrollbar">
          {isLoadingProducts ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
              <Package className="w-12 h-12 mb-2 opacity-20" />
              <p className="font-medium">Tidak ada produk ditemukan</p>
              <p className="text-xs">Coba ubah kategori atau filter tipe bisnis</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {filteredProducts.map((product: any) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="group flex flex-col bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl lg:rounded-3xl p-3 lg:p-4 cursor-pointer hover:border-indigo-600 dark:hover:border-indigo-500/50 transition-all relative overflow-hidden"
                >
                  <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-xl lg:rounded-2xl flex items-center justify-center text-4xl mb-3 lg:mb-4 group-hover:scale-105 transition-transform overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      "📦"
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-gray-900 dark:text-white text-[13px] lg:text-sm line-clamp-1">{product.name}</h4>
                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border transition-colors ${
                        product.type === 'f&b' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' :
                        product.type === 'service' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' :
                        'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                      }`}>
                        {product.type === 'f&b' ? 'F&B' : product.type === 'service' ? 'Jasa' : 'Retail'}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-gray-400">{product.category?.name || "Uncategorized"}</p>
                    <div className="flex items-center justify-between pt-1 lg:pt-2">
                      <span className="font-bold text-sm lg:text-base text-indigo-600">
                        {formatCurrency(product.variants?.[0]?.price || 0)}
                      </span>
                      <div className="p-1.5 lg:p-2 bg-indigo-600 text-white rounded-lg opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Current Order (Desktop Only) */}
      <div className="hidden lg:flex w-[400px] flex-col bg-white dark:bg-gray-900/40 dark:backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-2xl shadow-gray-100 dark:shadow-none">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Current Order</h3>
            <span className="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
              {cart.length} Items
            </span>
          </div>

          {/* Customer Selection Button */}
          <div className="pt-2">
            {!selectedCustomer ? (
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group"
              >
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Tambah Pelanggan</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 truncate">{selectedCustomer.name}</p>
                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400">Pelanggan Setia</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-indigo-400 dark:text-indigo-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <CartItemsList />
        </div>

        <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Catatan Pesanan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan di sini..."
              className="w-full p-3 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-600 dark:text-gray-400 resize-none h-20 focus:ring-1 focus:ring-indigo-600 transition-all"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-medium">
              <span>Pajak (10%)</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="font-bold text-gray-900 dark:text-white">Total</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsSaveModalOpen(true)}
              disabled={cart.length === 0}
              className="flex-1 h-14 text-sm font-bold border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl"
            >
              Simpan
            </Button>
            <Button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
              className="flex-[2] h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/20"
            >
              Bayar <ChevronRight className="ml-1 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-[100]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Total Bayar</p>
            <p className="text-lg font-bold text-indigo-600 truncate">{formatCurrency(total)}</p>
          </div>
          <div className="flex-[2] flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsSaveModalOpen(true)}
              disabled={cart.length === 0}
              className="w-12 h-12 p-0 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl flex items-center justify-center"
            >
              <Package className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setIsDrawerOpen(true)}
              disabled={cart.length === 0}
              className="flex-1 h-12 font-bold bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Selesaikan ({cart.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Rincian Pesanan"
      >
        <div className="flex flex-col h-full min-h-[400px]">
          {/* Customer Selection Mobile */}
          <div className="mb-6">
            {!selectedCustomer ? (
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400"
              >
                <UserPlus className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Tambah Pelanggan</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 truncate">{selectedCustomer.name}</p>
                    <p className="text-[10px] text-indigo-400">Pelanggan Setia</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-indigo-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1">
            <CartItemsList />

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Catatan Pesanan</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan di sini..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-xs text-gray-600 dark:text-gray-400 resize-none h-20 focus:ring-1 focus:ring-indigo-600 transition-all"
              />
            </div>
          </div>

          <div className="mt-8 space-y-4 pt-6 border-t border-gray-100">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Pajak (10%)</span>
                <span className="font-bold text-gray-900">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4">
                <span>Total</span>
                <span className="text-indigo-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsSaveModalOpen(true);
                }}
                className="flex-1 h-14 font-bold border-gray-200 text-gray-600 rounded-2xl"
              >
                Simpan
              </Button>
              <Button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="flex-[2] h-14 font-bold bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100"
              >
                Bayar Sekarang <ChevronRight className="ml-1 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Save Order Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Simpan Pesanan"
        className="max-w-md mx-auto"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Berikan identitas untuk pesanan ini agar mudah ditemukan kembali di daftar antrian.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nama Pelanggan</label>
              <input
                type="text"
                placeholder="e.g. Budi, Meja 5, dsb."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 transition-all text-sm"
              />
            </div>
            {selectedBusinessType === "f&b" && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nomor Meja</label>
                <input
                  type="text"
                  placeholder="e.g. 01, 12, A5"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 transition-all text-sm"
                />
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsSaveModalOpen(false)}
              className="flex-1 h-12 font-bold rounded-xl"
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveOrder}
              disabled={isCreating}
              className="flex-1 h-12 font-bold bg-indigo-600 text-white rounded-xl"
            >
              {isCreating ? "Menyimpan..." : "Konfirmasi Simpan"}
            </Button>
          </div>
        </div>
      </Modal>

      {isVariantModalOpen && (
        <VariantSelectionModal
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          product={selectedProduct}
          stocks={stocksData?.data || []}
          onSelect={(variant) => addToCart(selectedProduct, variant)}
        />
      )}

      {isCloseSessionOpen && (
        <CloseSessionModal
          isOpen={isCloseSessionOpen}
          onClose={() => setIsCloseSessionOpen(false)}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          total={total}
          subtotal={subtotal}
          tax={tax}
          cart={cart}
          onConfirm={handleCheckoutConfirm}
          isLoading={isCreating || isPaying}
        />
      )}

      {isCustomerModalOpen && (
        <CustomerSelectionModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onSelect={(customer) => setSelectedCustomer(customer)}
        />
      )}

      {isQueueModalOpen && (
        <OrderQueueModal
          isOpen={isQueueModalOpen}
          onClose={() => setIsQueueModalOpen(false)}
          pendingOrders={pendingOrders}
          paidOrders={paidOrders}
          isLoading={isLoadingPending || isLoadingPaid}
          onResume={handleResumeOrder}
          onComplete={async (id) => {
            try {
              await completeOrder(id).unwrap();
              toast.success("Pesanan selesai disiapkan.");
            } catch (err: any) {
              toast.error(err?.data?.message || "Gagal menyelesaikan pesanan.");
            }
          }}
          onCancel={(id) => {
            setOrderIdToCancel(id);
            setIsCancelAlertOpen(true);
          }}
        />
      )}

      <AlertDialog
        isOpen={isCancelAlertOpen}
        onClose={() => {
          setIsCancelAlertOpen(false);
          setOrderIdToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
        title="Batalkan Pesanan?"
        description="Tindakan ini akan menghapus pesanan dari antrian secara permanen."
        confirmLabel="Ya, Batalkan"
        cancelLabel="Tidak"
        variant="danger"
      />
    </div>
    </div>
    </PosSessionGuard>
  );
};
