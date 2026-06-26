import { useState, useMemo } from "react";
import { 
  useGetProductBatchesQuery,
  useCreateProductBatchMutation,
  useUpdateProductBatchMutation,
  useDeleteProductBatchMutation
} from "@/store/api/productBatchApi";
import { useGetBranchesQuery } from "@/store/api/branchApi";
import { useGetSuppliersQuery } from "@/store/api/supplierApi";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { toast } from "sonner";

export const useProductBatches = () => {
  const user = useAppSelector((state: RootState) => (state as any).auth?.user);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(user?.branch_id || "");
  const [search, setSearch] = useState("");

  const { data: branchesData, isLoading: isLoadingBranches } = useGetBranchesQuery({});
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useGetSuppliersQuery({});
  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery({});
  
  const { 
    data: batchesData, 
    isLoading: isLoadingBatches,
    isFetching: isFetchingBatches 
  } = useGetProductBatchesQuery({
    branch_id: selectedBranchId || undefined
  });

  const [createBatch, { isLoading: isCreating }] = useCreateProductBatchMutation();
  const [updateBatch, { isLoading: isUpdating }] = useUpdateProductBatchMutation();
  const [deleteBatch, { isLoading: isDeleting }] = useDeleteProductBatchMutation();

  const batches = batchesData?.data || [];
  const branches = branchesData?.data || [];
  const suppliers = suppliersData?.data || [];
  const products = productsData?.data || [];

  const filteredBatches = useMemo(() => {
    return batches.filter((b: any) => {
      const matchesSearch = 
        b.batch_number?.toLowerCase().includes(search.toLowerCase()) ||
        b.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.variant_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.sku?.toLowerCase().includes(search.toLowerCase());
      
      return matchesSearch;
    });
  }, [batches, search]);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);

  const handleSubmit = async (values: any, selectedBatch: any, onSuccess: () => void) => {
    try {
      const payload = {
        ...values,
        branch_id: values.branch_id || null,
        variant_id: values.variant_id || null,
        supplier_id: values.supplier_id || null,
        production_date: values.production_date ? new Date(values.production_date).toISOString() : null,
        expiry_date: values.expiry_date ? new Date(values.expiry_date).toISOString() : null,
        quantity: Number(values.quantity)
      };

      if (selectedBatch) {
        await updateBatch({ id: selectedBatch.id, data: payload }).unwrap();
        toast.success("Batch berhasil diperbarui");
      } else {
        await createBatch(payload).unwrap();
        toast.success("Batch berhasil dibuat");
      }
      
      onSuccess();
    } catch (error: any) {
      toast.error(error.data?.message || "Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  const openDeleteAlert = (id: string) => {
    setBatchToDelete(id);
    setIsAlertOpen(true);
  };

  const closeDeleteAlert = () => {
    setBatchToDelete(null);
    setIsAlertOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!batchToDelete) return;
    try {
      await deleteBatch(batchToDelete).unwrap();
      toast.success("Batch berhasil dihapus");
      closeDeleteAlert();
    } catch (error: any) {
      toast.error(error.data?.message || "Gagal menghapus batch");
    }
  };

  return {
    selectedBranchId,
    setSelectedBranchId,
    search,
    setSearch,
    branches,
    isLoadingBranches,
    suppliers,
    isLoadingSuppliers,
    products,
    isLoadingProducts,
    batches,
    filteredBatches,
    isLoadingBatches,
    isFetchingBatches,
    handleSubmit,
    handleConfirmDelete,
    openDeleteAlert,
    closeDeleteAlert,
    isAlertOpen,
    isCreating,
    isUpdating,
    isDeleting,
    user
  };
};
