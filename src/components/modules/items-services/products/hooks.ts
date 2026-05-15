"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ProductInput } from "./schema";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/store/api/productApi";
import { useGetCategoriesQuery } from "@/store/api/categoryApi";

export type ProductType = "retail" | "f&b" | "service";
export type SortField = "name" | "type" | "category_name" | "variants";
export type SortOrder = "asc" | "desc";

const DEFAULT_PAGE_SIZE = 10;

export const useProductHook = () => {
  // ─── RTK Query ─────────────────────────────────────────────────────────────
  const {
    data: productsData,
    isLoading,
    isFetching: isProductsFetching,
    refetch: refetchProducts,
  } = useGetProductsQuery(undefined, {
    refetchOnMountOrArgChange: true,  // selalu re-fetch saat komponen mount
  });
  const { data: categoriesData } = useGetCategoriesQuery(undefined);
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // isFetching = true saat initial load ATAU saat re-fetching setelah mutasi
  const isFetching = isLoading || isProductsFetching;

  // ─── Modal Step ─────────────────────────────────────────────────────────────
  const [modalStep, setModalStep] = useState<"idle" | "type-select" | "form">("idle");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<ProductType>("retail");

  // ─── Alert Dialog ──────────────────────────────────────────────────────────
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // ─── Table State ───────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | ProductType>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // ─── Raw Data ──────────────────────────────────────────────────────────────
  // Gunakan useMemo agar React bisa tracking perubahan reference dengan benar
  const allProducts = useMemo<any[]>(
    () => productsData?.data ?? [],
    [productsData]
  );
  const categories = useMemo<any[]>(
    () => categoriesData?.data ?? [],
    [categoriesData]
  );

  // ─── Derived: Filtered + Sorted + Paginated ────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // 1. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q)
      );
    }

    // 2. Filter by type
    if (filterType !== "all") {
      result = result.filter((p) => p.type === filterType);
    }

    // 3. Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "variants") {
        aVal = a.variants?.length ?? 0;
        bVal = b.variants?.length ?? 0;
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      aVal = String(aVal ?? "").toLowerCase();
      bVal = String(bVal ?? "").toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [allProducts, searchQuery, filterType, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ─── Table Handlers ────────────────────────────────────────────────────────
  const handleSearch = (q: string) => { setSearchQuery(q); setCurrentPage(1); };
  const handleFilterType = (type: "all" | ProductType) => { setFilterType(type); setCurrentPage(1); };
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedProductId((prev) => (prev === id ? null : id));
  };

  // ─── Modal Handlers ────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setModalStep("type-select");
  };

  const handleOpenEdit = (product: any) => {
    setSelectedProduct(product);
    setSelectedType(product.type as ProductType);
    setModalStep("form");
  };

  const handleSelectType = (type: ProductType) => {
    setSelectedType(type);
    setModalStep("form");
  };

  const handleBackToTypeSelect = () => setModalStep("type-select");

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setModalStep("idle");
  };

  // ─── CRUD ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (values: ProductInput) => {
    try {
      if (selectedProduct) {
        const updatePayload = {
          id: selectedProduct.id,
          name: values.name,
          description: values.description,
          category_id: values.category_id,
          type: values.type,
          is_stock_tracked: values.is_stock_tracked,
          image: values.image,
          variants: values.variants.map((v) => ({
            ...(v.id ? { id: v.id } : {}),
            name: v.name,
            price: Number(v.price) || 0,
            cost_price: v.cost_price ?? null,
            is_active: v.is_active,
          })),
        };
        await updateProduct(updatePayload).unwrap();
        // Tutup modal DULU agar tidak ada race condition state, lalu refetch
        handleCloseModal();
        await refetchProducts();
        toast.success("Produk berhasil diperbarui");
      } else {
        const createPayload = {
          name: values.name,
          description: values.description,
          category_id: values.category_id,
          type: values.type,
          is_stock_tracked: values.is_stock_tracked,
          image: values.image,
          variants: values.variants.map((v) => ({
            name: v.name,
            price: Number(v.price) || 0,
            cost_price: v.cost_price ?? null,
            is_active: v.is_active,
          })),
        };
        await createProduct(createPayload).unwrap();
        handleCloseModal();
        await refetchProducts();
        toast.success("Produk berhasil dibuat");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Terjadi kesalahan, coba lagi");
    }
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete).unwrap();
      await refetchProducts();
      toast.success("Produk berhasil dihapus");
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menghapus produk");
    } finally {
      setIsAlertOpen(false);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsAlertOpen(false);
    setProductToDelete(null);
  };

  return {
    // Data
    allProducts,
    categories,
    paginatedProducts,
    filteredProducts,
    selectedProduct,
    selectedType,
    // Table state
    searchQuery, filterType, sortField, sortOrder,
    currentPage, totalPages, pageSize, expandedProductId,
    handleSearch, handleFilterType, handleSort, handleToggleExpand,
    setCurrentPage, handlePageSizeChange,
    // Modal
    modalStep,
    handleOpenCreate,
    handleOpenEdit,
    handleSelectType,
    handleBackToTypeSelect,
    handleCloseModal,
    handleSubmit,
    // Loading
    isFetching,
    isLoading: isCreating || isUpdating,
    isDeleting,
    // Alert
    isAlertOpen,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  };
};
