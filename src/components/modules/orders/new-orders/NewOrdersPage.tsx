"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus, ChevronRight, Filter, Power, Package, UserPlus, Users, LayoutGrid, ShoppingBag, Utensils, Star } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { PosSessionGuard } from "../pos-session/PosSessionGuard";
import { CloseSessionModal } from "../pos-session/CloseSessionModal";
import { CheckoutModal } from "./CheckoutModal";
import { ReceiptModal, ReceiptData } from "./ReceiptModal";
import Cookies from "js-cookie";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetCategoriesQuery } from "@/store/api/categoryApi";
import { useCreateOrderMutation, usePayOrderMutation, useGetTransactionsQuery, useCancelOrderMutation, useCompleteOrderMutation, orderApi } from "@/store/api/orderApi";
import { useGetTaxesQuery } from "@/store/api/taxApi";
import { useGetPromotionsQuery } from "@/store/api/promotionApi";
import { useGetMeTenantQuery } from "@/store/api/tenantApi";
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
  const [selectedBusinessType, setSelectedBusinessType] = useState<"retail" | "f&b" | "service" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCloseSessionOpen, setIsCloseSessionOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPromoListModalOpen, setIsPromoListModalOpen] = useState(false);
  const [isTaxListModalOpen, setIsTaxListModalOpen] = useState(false);
  const [manuallySelectedPromoId, setManuallySelectedPromoId] = useState<string | null>(null);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [orderIdToCancel, setOrderIdToCancel] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  
  // Receipt State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastOrderData, setLastOrderData] = useState<ReceiptData | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY" | "DELIVERY">("DINE_IN");
  const [notes, setNotes] = useState("");

  const role = Cookies.get("flwbite_role");
  const branchId = Cookies.get("flwbite_branch");
  const { data: tenantRes } = useGetMeTenantQuery(undefined);
  const tenantName = tenantRes?.data?.name || "Toko Demo";
  const branches: any[] = []; // Placeholder

  // API Queries
  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery({});
  const { data: pendingOrdersData, isLoading: isLoadingPending, refetch: refetchPending } = useGetTransactionsQuery({
    status: "PENDING",
    branch_id: branchId
  }, { skip: !branchId });
  const { data: paidOrdersData, isLoading: isLoadingPaid, refetch: refetchPaid } = useGetTransactionsQuery({
    status: "PAID",
    branch_id: branchId
  }, { skip: !branchId });
  const { data: stocksData } = useGetStocksByBranchQuery(branchId || "", { skip: !branchId });
  const { data: taxesData } = useGetTaxesQuery(undefined);
  const { data: promotionsData } = useGetPromotionsQuery(undefined);
  const [cancelOrder] = useCancelOrderMutation();
  const [completeOrder] = useCompleteOrderMutation();

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [payOrder, { isLoading: isPayingOrder }] = usePayOrderMutation();

  const products = productsData?.data || [];
  const categoriesList = categoriesData?.data || [];
  const taxes = taxesData?.data || [];
  const promotions = promotionsData?.data || [];

  // Local state for queue lists - enables instant optimistic updates
  const [localPendingOrders, setLocalPendingOrders] = useState<any[]>([]);
  const [localPaidOrders, setLocalPaidOrders] = useState<any[]>([]);

  // Sync local state when RTK Query data arrives
  useEffect(() => {
    if (pendingOrdersData?.data) {
      setLocalPendingOrders(pendingOrdersData.data);
    }
  }, [pendingOrdersData]);

  useEffect(() => {
    if (paidOrdersData?.data) {
      setLocalPaidOrders(paidOrdersData.data);
    }
  }, [paidOrdersData]);

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
    setActiveOrderId(order.id);
    setIsQueueModalOpen(false);
    toast.success(`Pesanan ${order.customer_name || ""} berhasil dipanggil.`);
  };

  const handleConfirmCancel = async () => {
    if (!orderIdToCancel) return;
    try {
      toast.loading("Membatalkan pesanan...", { id: "cancel-order" });
      // Optimistic: remove from local UI immediately
      setLocalPendingOrders(prev => prev.filter(o => o.id !== orderIdToCancel));
      await cancelOrder(orderIdToCancel).unwrap();
      toast.success("Pesanan berhasil dibatalkan.", { id: "cancel-order" });
      setIsCancelAlertOpen(false);
      setOrderIdToCancel(null);
      // Background refresh to sync
      refetchPending();
    } catch (err) {
      toast.error("Gagal membatalkan pesanan.", { id: "cancel-order" });
      // Revert on failure
      refetchPending();
    }
  };

  const availableCategories = categoriesList.filter((cat: any) => {
    return products.some((p: any) => p.category_id === cat.id && p.type === selectedBusinessType);
  });

  const categoryNames = ["All Items", ...availableCategories.map((c: any) => c.name)];

  const filteredProducts = products.filter((product: any) => {
    const matchesBusinessType = product.type === selectedBusinessType;
    const selectedCatObj = categoriesList.find((c: any) => c.name === selectedCategory);
    const matchesCategory = selectedCategory === "All Items" ||
                           (product.category?.name === selectedCategory) ||
                           (selectedCatObj && product.category_id === selectedCatObj.id);

    const searchLower = searchQuery.toLowerCase();
    const matchesName = product.name.toLowerCase().includes(searchLower);
    const matchesSKU = product.variants?.some((v: any) =>
      v.sku?.toLowerCase().includes(searchLower)
    );

    return matchesBusinessType && matchesCategory && (matchesName || matchesSKU);
  });

  const handleProductClick = (product: any) => {
    addToCart(product);
  };

  const isFnBMode = selectedBusinessType === "f&b" || cart.some(item => products.find((p: any) => p.id === item.id)?.type === "f&b");

  const addToCart = (product: any, variant: any = null) => {
    if (!variant && product.variants?.length === 1) {
      variant = product.variants[0];
    } else if (!variant && product.variants?.length > 1) {
      setSelectedProduct(product);
      setIsVariantModalOpen(true);
      return;
    } else if (!variant) {
      toast.error("Produk ini tidak memiliki varian.");
      return;
    }

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
  const getOrderType = () => {
    if (selectedBusinessType === "f&b") return "FNB";
    if (selectedBusinessType === "service") return "SERVICE";
    return "RETAIL";
  };

  const handleCheckoutConfirm = async (paymentMethod: "CASH" | "QRIS", amountPaid: number) => {
    if (!branchId) {
      toast.error("Cabang tidak terdeteksi. Silakan buka sesi kembali.");
      return;
    }

    try {
      const orderRes = await createOrder({
        type: getOrderType(),
        branch_id: branchId,
        customer_name: selectedCustomer?.name || "Pelanggan",
        items: cart.map(item => ({
          variant_id: item.variant_id,
          qty: item.quantity
        })),
        tax_amount: totalTax,
        discount_amount: totalDiscount,
        notes: notes
      }).unwrap();

      const orderId = orderRes.data.id;

      if (activeOrderId) {
        try {
          await cancelOrder(activeOrderId).unwrap();
        } catch (e) {
          console.error("Gagal membatalkan pesanan lama", e);
        }
      }

      await payOrder({
        order_id: orderId,
        payment_method: paymentMethod,
        amount: total
      }).unwrap();

      // Optimistic: immediately move order to PAID queue in local UI
      setLocalPendingOrders(prev => prev.filter(o => o.id !== orderId));
      setLocalPaidOrders(prev => [
        {
          id: orderId,
          customer_name: selectedCustomer?.name || customerName || "Pelanggan",
          customer_id: selectedCustomer?.id || null,
          table_number: tableNumber,
          status: "PAID",
          total_amount: total,
          items: cart.map(item => ({
            product_name: item.name,
            qty: item.quantity,
            price: item.price,
            variant_id: item.variant_id,
          })),
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      // Background refetch to sync with real server data
      setTimeout(() => {
        refetchPending();
        refetchPaid();
      }, 1500);

      toast.success("Transaksi Berhasil!");
      
      setLastOrderData({
        orderId: orderId,
        cashierName: role || "Kasir",
        branchName: branches.find((b:any) => b.id === branchId)?.name || "Cabang",
        tenantName: tenantName,
        customerName: selectedCustomer?.name || customerName || "Pelanggan",
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: subtotal,
        tax: totalTax,
        discount: totalDiscount,
        total: total,
        paymentMethod: paymentMethod,
        amountPaid: amountPaid,
        change: Math.max(0, amountPaid - total),
        date: new Date()
      });
      
      setIsReceiptOpen(true);
      
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
      if (activeOrderId) {
        try {
          await cancelOrder(activeOrderId).unwrap();
        } catch (e) {
          console.error("Gagal membatalkan pesanan lama", e);
        }
      }

      await createOrder({
        type: getOrderType(),
        branch_id: branchId,
        customer_name: selectedCustomer?.name || customerName || "Pelanggan",
        table_number: tableNumber,
        items: cart.map(item => ({
          variant_id: item.variant_id,
          qty: item.quantity
        })),
        tax_amount: totalTax,
        discount_amount: totalDiscount,
        notes: notes
      }).unwrap();

      refetchPending(); // Manually update pending queue
      toast.success("Pesanan berhasil disimpan di antrian.");
      setCart([]);
      setSelectedCustomer(null);
      setCustomerName("");
      setTableNumber("");
      setNotes("");
      setActiveOrderId(null);
      setIsQueueModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menyimpan pesanan.");
    }
  };

  const handleCloseReceipt = () => {
    setIsReceiptOpen(false);
    setLastOrderData(null);
    setCart([]);
    setSelectedCustomer(null);
    setCustomerName("");
    setTableNumber("");
    setIsCheckoutOpen(false);
    setIsDrawerOpen(false);
    setActiveOrderId(null);
  };

  const handlePayButtonClick = (isMobile: boolean = false) => {
    if (cart.length === 0) {
      toast.error("Keranjang belanja masih kosong! Pilih produk terlebih dahulu.");
      return;
    }
    if (isMobile) {
      setIsDrawerOpen(false);
    }
    setIsCheckoutOpen(true);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const activeTaxes = useMemo(() => {
    return (taxes || []).filter((t: any) => t.is_active);
  }, [taxes]);

  const activePromotions = useMemo(() => {
    if (!promotions) return [];
    const now = new Date();
    return promotions.filter((promo: any) => {
      if (promo.status !== "ACTIVE") return false;
      const start = new Date(promo.start_date);
      const end = new Date(promo.end_date);
      if (now < start || now > end) return false;
      if (promo.branches && promo.branches.length > 0 && branchId) {
        if (!promo.branches.includes(branchId)) return false;
      }
      return true;
    });
  }, [promotions, branchId]);

  const applicablePromotions = useMemo(() => {
    if (cart.length === 0) return [];
    
    const results: { id: string; name: string; discount: number }[] = [];
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    activePromotions.forEach((promo: any) => {
      let promoDiscount = 0;
      const isManuallySelected = manuallySelectedPromoId === promo.id;
      
      (promo.rules || []).forEach((rule: any) => {
        let isApplicable = false;
        let ruleDiscount = 0;
        
        if (isManuallySelected) {
          isApplicable = true;
        } else {
          let condVal: any = {};
          try {
            condVal = typeof rule.condition_value === 'string' 
              ? JSON.parse(rule.condition_value) 
              : rule.condition_value;
          } catch (e) {
            condVal = rule.condition_value;
          }
          
          if (rule.condition_type === "MIN_QTY") {
            const qtyVal = typeof condVal === 'object' && condVal ? (condVal.min_qty || condVal.value) : condVal;
            const requiredQty = Number(qtyVal || 0);
            if (totalQty >= requiredQty) {
              isApplicable = true;
            }
          }
          else if (rule.condition_type === "MIN_SPEND") {
            const spendVal = typeof condVal === 'object' && condVal ? (condVal.min_spend || condVal.value) : condVal;
            const requiredSpend = Number(spendVal || 0);
            if (subtotal >= requiredSpend) {
              isApplicable = true;
            }
          }
          else if (rule.condition_type === "CUSTOMER_NEW") {
            if (selectedCustomer) {
              isApplicable = true;
            }
          }
          else if (rule.condition_type === "PRODUCT_CATEGORY" || (rule.condition_categories && rule.condition_categories.length > 0)) {
            const allowedCategories = rule.condition_categories || [];
            const hasMatchingProduct = cart.some(item => {
              const prod = products.find((p: any) => p.id === item.id);
              return prod && allowedCategories.includes(prod.category_id);
            });
            if (hasMatchingProduct) {
              isApplicable = true;
            }
          }
          else if (rule.condition_variants && rule.condition_variants.length > 0) {
            const allowedVariants = rule.condition_variants || [];
            const hasMatchingVariant = cart.some(item => allowedVariants.includes(item.variant_id));
            if (hasMatchingVariant) {
              isApplicable = true;
            }
          } else {
            isApplicable = true;
          }
        }
        
        if (isApplicable) {
          let actionVal: any = {};
          try {
            actionVal = typeof rule.action_value === 'string'
              ? JSON.parse(rule.action_value)
              : rule.action_value;
          } catch (e) {
            actionVal = rule.action_value;
          }
          
          const value = typeof actionVal === 'object' && actionVal 
            ? Number(actionVal.discount_value || actionVal.value || 0) 
            : Number(actionVal || 0);
          
          if (rule.action_type === "DISCOUNT_PERCENT") {
            const allowedVariants = rule.action_variants || [];
            const allowedCategories = rule.action_categories || [];
            
            if (allowedVariants.length > 0 || allowedCategories.length > 0) {
              let applicableSum = 0;
              cart.forEach(item => {
                const prod = products.find((p: any) => p.id === item.id);
                const matchesVar = allowedVariants.includes(item.variant_id);
                const matchesCat = prod && allowedCategories.includes(prod.category_id);
                if (matchesVar || matchesCat) {
                  applicableSum += item.price * item.quantity;
                }
              });
              ruleDiscount = applicableSum * (value / 100);
            } else {
              ruleDiscount = subtotal * (value / 100);
            }
          }
          else if (rule.action_type === "DISCOUNT_AMOUNT" || rule.action_type === "DISCOUNT_FIXED") {
            ruleDiscount = value;
          }
          else if (rule.action_type === "FREE_ITEM" || rule.action_type === "FREE_PRODUCT" || rule.action_type === "BUY_X_GET_Y") {
            const allowedVariants = rule.action_variants || [];
            let matchingItems = cart;
            if (allowedVariants.length > 0) {
              matchingItems = cart.filter(item => allowedVariants.includes(item.variant_id));
            }
            
            if (matchingItems.length > 0) {
              const prices = matchingItems.map(item => item.price);
              const minPrice = Math.min(...prices);
              const matchingQty = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
              
              let freeCount = 0;
              if (isManuallySelected) {
                freeCount = Math.max(1, Math.floor(matchingQty / 3));
              } else {
                freeCount = Math.floor(matchingQty / 3);
              }
              ruleDiscount = minPrice * freeCount;
            }
          }
          else if (rule.action_type === "FIXED_PRICE") {
            const allowedVariants = rule.action_variants || [];
            let matchingItems = cart;
            if (allowedVariants.length > 0) {
              matchingItems = cart.filter(item => allowedVariants.includes(item.variant_id));
            }
            
            const matchingQty = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
            const normalSum = matchingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            const bundleCount = Math.max(isManuallySelected ? 1 : 0, Math.floor(matchingQty / 3));
            if (bundleCount > 0) {
              const remainingQty = Math.max(0, matchingQty - (bundleCount * 3));
              const prices = matchingItems.map(item => item.price);
              const avgPrice = prices.length > 0 ? prices.reduce((a,b)=>a+b,0)/prices.length : 0;
              const bundleSum = (bundleCount * value) + (remainingQty * avgPrice);
              ruleDiscount = Math.max(0, normalSum - bundleSum);
            }
          }
        }
        
        if (ruleDiscount > promoDiscount) {
          promoDiscount = ruleDiscount;
        }
      });
      
      if (promoDiscount > 0) {
        results.push({
          id: promo.id,
          name: promo.name,
          discount: promoDiscount
        });
      }
    });
    
    return results;
  }, [cart, activePromotions, subtotal, selectedCustomer, products, manuallySelectedPromoId]);

  const totalDiscount = useMemo(() => {
    let maxSingleDiscount = 0;
    let stackableSum = 0;
    
    applicablePromotions.forEach(ap => {
      const promoObj = promotions.find((p: any) => p.id === ap.id);
      if (promoObj && promoObj.is_stackable) {
        stackableSum += ap.discount;
      }
      if (ap.discount > maxSingleDiscount) {
        maxSingleDiscount = ap.discount;
      }
    });
    
    return Math.max(stackableSum, maxSingleDiscount);
  }, [applicablePromotions, promotions]);

  const taxSubtotal = Math.max(0, subtotal - totalDiscount);
  const totalTax = activeTaxes.length > 0 
    ? activeTaxes.reduce((sum: number, t: any) => sum + (taxSubtotal * (t.value / 100)), 0)
    : 0;

  const total = Math.max(0, taxSubtotal + totalTax);

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
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center border-8 border-white dark:border-gray-900 shadow-sm">
            <ShoppingCart className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
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
              <div className="flex items-center bg-gray-100 dark:bg-white/5 dark:border dark:border-white/10 rounded-xl p-1">
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

  if (selectedBusinessType === null) {
    return (
      <PosSessionGuard>
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">Pilih Mode Bisnis</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Sistem akan menyesuaikan fitur dan daftar produk sesuai dengan tipe bisnis yang Anda pilih.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
            {[
              { id: "retail", label: "Retail", icon: ShoppingBag, color: "text-brand-500 bg-brand-50 dark:bg-brand-500/10", desc: "Penjualan barang fisik, tanpa nomor meja." },
              { id: "f&b", label: "Food & Beverage", icon: Utensils, color: "text-brand-500 bg-brand-50 dark:bg-brand-500/10", desc: "Manajemen restoran, cafe, nomor meja & pesanan." },
              { id: "service", label: "Jasa", icon: Star, color: "text-brand-500 bg-brand-50 dark:bg-brand-500/10", desc: "Pelayanan jasa, konsultasi, dan servis." }
            ].map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedBusinessType(type.id as any)}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-500/10 transition-all group flex flex-col items-center"
                >
                  <div className={`w-20 h-20 ${type.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-sm`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{type.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{type.desc}</p>
                </button>
              );
            })}
          </div>
          <div className="mt-16">
            <button
              onClick={() => setIsCloseSessionOpen(true)}
              className="px-6 py-3 border border-red-200 text-red-600 dark:border-red-900/30 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              <Power className="w-5 h-5" />
              Tutup Sesi Kasir
            </button>
          </div>
        </div>

        {isCloseSessionOpen && (
          <CloseSessionModal
            isOpen={isCloseSessionOpen}
            onClose={() => setIsCloseSessionOpen(false)}
          />
        )}
      </PosSessionGuard>
    );
  }

  return (
    <PosSessionGuard>
    <div className="bg-transparent p-0 lg:p-6 h-screen overflow-hidden">
      <div className="flex flex-col lg:flex-row h-full gap-0 lg:gap-6 overflow-hidden pb-36 lg:pb-0">
      {/* Left Side: Product Selection */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900/40 dark:backdrop-blur-md rounded-none lg:rounded-3xl border-0 lg:border border-gray-200 dark:border-white/5 overflow-hidden">
        {/* Header with Close Session */}
        <div className="px-4 pt-4 lg:px-6 lg:pt-6 pb-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedBusinessType(null);
                setCart([]);
                setOrderType("DINE_IN");
              }}
              className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="hidden lg:inline text-sm font-bold">Ganti Mode</span>
            </button>
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white ml-2">Point of Sale</h2>
            <button
              onClick={() => setIsQueueModalOpen(true)}
              className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 transition-colors relative group"
            >
              <Users className="w-5 h-5 text-gray-400" />
              {(pendingOrders.length + paidOrders.length) > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm animate-pulse">
                  {pendingOrders.length + paidOrders.length}
                </div>
              )}
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Antrian Pesanan</span>
            </button>
          </div>
          <button
            onClick={() => setIsCloseSessionOpen(true)}
            className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs lg:text-sm font-medium transition-all"
          >
            <Power className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Tutup Sesi</span>
            <span className="sm:hidden">Keluar</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 lg:p-6 border-b border-gray-100 dark:border-gray-800 space-y-4 lg:space-y-5">

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Cari di semua produk...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50/50 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-brand-600 transition-all text-sm"
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
                    ? "bg-brand-600 text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-2 lg:p-6 no-scrollbar">
          {isLoadingProducts ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
              <Package className="w-12 h-12 mb-2 opacity-20" />
              <p className="font-medium">Tidak ada produk ditemukan</p>
              <p className="text-xs">Coba ubah kategori atau filter tipe bisnis</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-4">
              {filteredProducts.map((product: any) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="group flex flex-col bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-2xl lg:rounded-3xl p-2 lg:p-4 cursor-pointer hover:border-brand-600 dark:hover:border-brand-500/50 transition-all relative overflow-hidden"
                >
                  <div className={`aspect-square rounded-xl lg:rounded-2xl flex items-center justify-center text-4xl mb-3 lg:mb-4 group-hover:scale-105 transition-transform overflow-hidden ${!product.image ? 'bg-emerald-800 dark:bg-emerald-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-10 h-10 text-white opacity-80" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-gray-900 dark:text-white text-[13px] lg:text-sm line-clamp-2">{product.name}</h4>
                    </div>
                    {product.category?.name && (
                      <p className="text-[11px] font-medium text-gray-400">{product.category.name}</p>
                    )}
                    <div className="flex items-center justify-between pt-1 lg:pt-2">
                      <span className="font-bold text-sm lg:text-base text-brand-600">
                        {formatCurrency(product.variants?.[0]?.price || 0)}
                      </span>
                      <div className="p-1.5 lg:p-2 bg-brand-600 text-white rounded-lg opacity-0 lg:group-hover:opacity-100 transition-opacity">
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
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Pesanan Saat Ini</h3>
            <span className="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
              {cart.length} Item
            </span>
          </div>

          {/* Customer Selection Button */}
          <div className="pt-2">
            {!selectedCustomer ? (
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-brand-600 hover:border-brand-100 dark:hover:border-brand-900/30 transition-all group"
              >
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Tambah Pelanggan</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand-900 dark:text-brand-200 truncate">{selectedCustomer.name}</p>
                    <p className="text-[10px] text-brand-500 dark:text-brand-400">Pelanggan Setia</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-brand-400 dark:text-brand-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Order Type & Table Selection */}
          {isFnBMode && (
            <div className="pt-1 space-y-3">
              <div className="flex bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-white/5">
                <button onClick={() => setOrderType("DINE_IN")} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${orderType === "DINE_IN" ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-white/10" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}>Dine In</button>
                <button onClick={() => setOrderType("TAKEAWAY")} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${orderType === "TAKEAWAY" ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-white/10" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}>Takeaway</button>
                <button onClick={() => setOrderType("DELIVERY")} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${orderType === "DELIVERY" ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-white/10" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}>Delivery</button>
              </div>
              
              {orderType === "DINE_IN" && (
                <input
                  type="text"
                  placeholder="Nomor Meja (Contoh: 12)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-brand-600 transition-all outline-none dark:text-white dark:placeholder-gray-500"
                />
              )}
            </div>
          )}
          {/* Active Promos & Taxes Quick View Pills */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setIsPromoListModalOpen(true)}
              className="flex-1 py-2 px-3 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all border border-emerald-100 dark:border-emerald-900/30"
            >
              🏷️ Promo Aktif ({activePromotions.length})
            </button>
            <button
              onClick={() => setIsTaxListModalOpen(true)}
              className="flex-1 py-2 px-3 bg-brand-50/50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 hover:bg-brand-100/50 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all border border-brand-100 dark:border-brand-900/30"
            >
              📄 Pajak Aktif ({activeTaxes.length})
            </button>
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
              className="w-full p-3 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-600 dark:text-gray-400 resize-none h-20 focus:ring-1 focus:ring-brand-600 transition-all"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            {applicablePromotions.map((ap) => (
              <div key={ap.id} className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="flex items-center gap-1.5">🏷️ {ap.name}</span>
                <span className="font-bold">-{formatCurrency(ap.discount)}</span>
              </div>
            ))}
            {activeTaxes.length > 0 ? (
              activeTaxes.map((t: any) => (
                <div key={t.id} className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-medium">
                  <span>Pajak - {t.name} ({t.value}%)</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(taxSubtotal * (t.value / 100))}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-medium">
                <span>Pajak (10%)</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalTax)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="font-bold text-gray-900 dark:text-white">Total</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSaveOrder}
              disabled={cart.length === 0 || isCreatingOrder}
              className="flex-1 h-14 text-sm font-bold border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl"
            >
              {isCreatingOrder ? "Menyimpan..." : "Simpan Pesanan"}
            </Button>
            <Button
              onClick={() => handlePayButtonClick(false)}
              className="flex-2 h-14 text-lg font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-2xl"
            >
              Bayar <ChevronRight className="ml-1 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-90">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Total Bayar</p>
            <p className="text-lg font-bold text-brand-600 truncate">{formatCurrency(total)}</p>
          </div>
          <div className="flex-2 flex gap-2">
            <button
              onClick={handleSaveOrder}
              disabled={cart.length === 0 || isCreatingOrder}
              className="w-12 h-12 shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Package className="w-6 h-6" />
            </button>
            <Button
              onClick={() => setIsDrawerOpen(true)}
              disabled={cart.length === 0}
              className="flex-1 h-12 font-bold bg-brand-600 text-white rounded-xl flex items-center justify-center gap-2"
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
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-brand-200 dark:border-brand-900/30 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 rounded-2xl hover:bg-brand-100/50 dark:hover:bg-brand-900/40 transition-colors group"
              >
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Tambah Pelanggan</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand-900 dark:text-brand-200 truncate">{selectedCustomer.name}</p>
                    <p className="text-[10px] text-brand-400">Pelanggan Setia</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-brand-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Order Type & Table Selection Mobile */}
          {isFnBMode && (
            <div className="mb-6 space-y-3">
              <div className="flex bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-white/5">
                <button onClick={() => setOrderType("DINE_IN")} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${orderType === "DINE_IN" ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-white/10" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}>Dine In</button>
                <button onClick={() => setOrderType("TAKEAWAY")} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${orderType === "TAKEAWAY" ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-white/10" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}>Takeaway</button>
                <button onClick={() => setOrderType("DELIVERY")} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${orderType === "DELIVERY" ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-white/10" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}>Delivery</button>
              </div>
              
              {orderType === "DINE_IN" && (
                <input
                  type="text"
                  placeholder="Nomor Meja (Contoh: 12)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-brand-600 transition-all outline-none dark:text-white dark:placeholder-gray-500"
                />
              )}
            </div>
          )}

          <div className="flex-1">
            <CartItemsList />

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Catatan Pesanan</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan di sini..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-xs text-gray-600 dark:text-gray-400 resize-none h-20 focus:ring-1 focus:ring-brand-600 transition-all"
              />
            </div>
          </div>

          <div className="mt-8 space-y-4 pt-6 border-t border-gray-100">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              {applicablePromotions.map((ap) => (
                <div key={ap.id} className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span className="flex items-center gap-1.5">🏷️ {ap.name}</span>
                  <span className="font-bold">-{formatCurrency(ap.discount)}</span>
                </div>
              ))}
              {activeTaxes.length > 0 ? (
                activeTaxes.map((t: any) => (
                  <div key={t.id} className="flex justify-between text-sm text-gray-500">
                    <span>Pajak - {t.name} ({t.value}%)</span>
                    <span className="font-bold text-gray-900">{formatCurrency(taxSubtotal * (t.value / 100))}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Pajak (10%)</span>
                  <span className="font-bold text-gray-900">{formatCurrency(totalTax)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold pt-4">
                <span>Total</span>
                <span className="text-brand-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDrawerOpen(false);
                }}
                className="flex-1 h-14 font-bold border-gray-200 text-gray-600 rounded-2xl"
              >
                Simpan
              </Button>
              <Button
                onClick={() => handlePayButtonClick(true)}
                className="flex-2 h-14 font-bold bg-brand-600 text-white rounded-2xl"
              >
                Bayar Sekarang <ChevronRight className="ml-1 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </Drawer>

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
          tax={totalTax}
          discount={totalDiscount}
          appliedPromotions={applicablePromotions}
          cart={cart}
          onConfirm={handleCheckoutConfirm}
          isLoading={isCreatingOrder || isPayingOrder}
        />
      )}

      <ReceiptModal 
        isOpen={isReceiptOpen}
        onClose={handleCloseReceipt}
        receiptData={lastOrderData}
      />

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
          pendingOrders={localPendingOrders}
          paidOrders={localPaidOrders}
          isLoading={isLoadingPending || isLoadingPaid}
          onResume={handleResumeOrder}
          onComplete={async (id) => {
            // Optimistic: remove from local UI immediately
            setLocalPaidOrders(prev => prev.filter(o => o.id !== id));
            try {
              await completeOrder(id).unwrap();
              toast.success("Pesanan selesai disiapkan.");
            } catch (err: any) {
              toast.error(err?.data?.message || "Gagal menyelesaikan pesanan.");
              // Revert on failure by re-syncing
              refetchPaid();
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

      {isPromoListModalOpen && (
        <Modal
          isOpen={isPromoListModalOpen}
          onClose={() => setIsPromoListModalOpen(false)}
          title="Daftar Promosi Aktif"
          className="max-w-xl mx-auto"
        >
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
            {activePromotions.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <span className="text-4xl">🏷️</span>
                <p className="text-sm font-semibold text-gray-500">Tidak Ada Promosi Aktif</p>
                <p className="text-xs text-gray-400">Belum ada kampanye promosi yang berjalan saat ini.</p>
              </div>
            ) : (
              activePromotions.map((promo: any) => {
                const isApplied = applicablePromotions.some(ap => ap.id === promo.id);
                return (
                  <div 
                    key={promo.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      isApplied 
                        ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800" 
                        : "bg-white dark:bg-gray-800/40 border-gray-100 dark:border-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{promo.name}</span>
                          {isApplied && (
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-lg uppercase">
                              Diterapkan
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{promo.description}</p>
                      </div>
                      {promo.is_stackable && (
                        <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-[10px] font-bold rounded-lg uppercase">
                          Stackable
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/60 grid grid-cols-2 gap-2 text-[10px] font-medium text-gray-400">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-gray-400/80">Berlaku Mulai</span>
                        <span className="text-gray-600 dark:text-gray-300 font-semibold text-[11px]">
                          {new Date(promo.start_date).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-gray-400/80">Hingga Tanggal</span>
                        <span className="text-gray-600 dark:text-gray-300 font-semibold text-[11px]">
                          {new Date(promo.end_date).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Rules list */}
                    <div className="mt-3 space-y-1.5">
                      {promo.rules.map((rule: any, idx: number) => {
                        let ruleCondText = rule.condition_type;
                        try {
                          const cleanVal = typeof rule.condition_value === 'string'
                            ? JSON.parse(rule.condition_value)
                            : rule.condition_value;
                          
                          if (rule.condition_type === "MIN_SPEND") {
                            const spend = typeof cleanVal === 'object' && cleanVal ? (cleanVal.min_spend || cleanVal.value || cleanVal) : cleanVal;
                            ruleCondText = `Min Belanja ${formatCurrency(Number(spend))}`;
                          } else if (rule.condition_type === "MIN_QTY") {
                            const qty = typeof cleanVal === 'object' && cleanVal ? (cleanVal.min_qty || cleanVal.value || cleanVal) : cleanVal;
                            ruleCondText = `Min Qty ${qty} Pcs`;
                          } else if (rule.condition_type === "CUSTOMER_NEW") {
                            ruleCondText = "Pelanggan Baru";
                          }
                        } catch(e) {
                          if (rule.condition_type === "MIN_SPEND") {
                            ruleCondText = `Min Belanja ${formatCurrency(Number(rule.condition_value))}`;
                          } else if (rule.condition_type === "MIN_QTY") {
                            ruleCondText = `Min Qty ${rule.condition_value} Pcs`;
                          }
                        }
                        
                        return (
                          <div key={idx} className="p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-brand-600 dark:text-brand-400">{rule.condition_type === "MIN_SPEND" ? "Belanja" : rule.condition_type === "MIN_QTY" ? "Jumlah" : "Syarat"}: </span>
                              <span className="font-medium text-gray-700 dark:text-gray-200">{ruleCondText}</span>
                            </div>
                            <div className="font-bold text-emerald-600 dark:text-emerald-400">
                              {rule.action_type === "DISCOUNT_PERCENT" ? `${rule.action_value}% Off` : 
                               rule.action_type === "DISCOUNT_FIXED" ? `-${formatCurrency(Number(rule.action_value))}` : 
                               rule.action_type === "FREE_PRODUCT" ? "Beli 2 Gratis 1" : "Item Gratis"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Manual Application Controls */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex justify-end">
                      {manuallySelectedPromoId === promo.id ? (
                        <button
                          onClick={() => {
                            setManuallySelectedPromoId(null);
                            toast.success("Penerapan manual dibatalkan.");
                          }}
                          className="px-3.5 py-1.5 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          ❌ Batalkan Pilihan
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setManuallySelectedPromoId(promo.id);
                            toast.success(`Promo "${promo.name}" diterapkan secara manual.`);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-500/10"
                        >
                          👉 Terapkan Promo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <Button onClick={() => setIsPromoListModalOpen(false)} className="w-full mt-4 h-12 bg-brand-600 text-white rounded-xl">
              Tutup
            </Button>
          </div>
        </Modal>
      )}

      {isTaxListModalOpen && (
        <Modal
          isOpen={isTaxListModalOpen}
          onClose={() => setIsTaxListModalOpen(false)}
          title="Daftar Pajak Aktif"
          className="max-w-xl mx-auto"
        >
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
            {activeTaxes.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <span className="text-4xl">📄</span>
                <p className="text-sm font-semibold text-gray-500">Tidak Ada Pajak Aktif</p>
                <p className="text-xs text-gray-400">Semua transaksi saat ini bebas biaya pajak.</p>
              </div>
            ) : (
              activeTaxes.map((t: any) => {
                const computedAmt = taxSubtotal * (t.value / 100);
                return (
                  <div key={t.id} className="p-4 rounded-2xl border bg-white dark:bg-gray-800/40 border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</span>
                        <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 text-[10px] font-bold rounded-lg">
                          {t.value}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">ID Pajak: {t.id}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] uppercase tracking-wider text-gray-400/80">Potongan Pajak</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">
                        {formatCurrency(computedAmt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl flex justify-between items-center text-xs font-semibold text-gray-600 dark:text-gray-400 mt-2">
              <span>Total Nilai Pajak Terhitung:</span>
              <span className="font-bold text-sm text-brand-600 dark:text-brand-400">
                {formatCurrency(totalTax)}
              </span>
            </div>
            
            <Button onClick={() => setIsTaxListModalOpen(false)} className="w-full mt-4 h-12 bg-brand-600 text-white rounded-xl">
              Tutup
            </Button>
          </div>
        </Modal>
      )}
    </div>
    </div>
    </PosSessionGuard>
  );
};
