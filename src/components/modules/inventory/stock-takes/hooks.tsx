import { useState, useMemo } from "react";
import { 
  useGetStockTakesQuery,
  useCreateStockTakeMutation,
  useGetStockTakeByIdQuery,
  useUpdateStockTakeMutation
} from "@/store/api/stockTakeApi";
import { useGetBranchesQuery } from "@/store/api/branchApi";
import { useGetStocksByBranchQuery } from "@/store/api/stockApi";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { toast } from "sonner";

export const useStockTakes = () => {
  const user = useAppSelector((state: RootState) => (state as any).auth?.user);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(user?.branch_id || "");
  const [search, setSearch] = useState("");

  const { data: branchesData, isLoading: isLoadingBranches } = useGetBranchesQuery({});
  
  const { 
    data: stockTakesData, 
    isLoading: isLoadingStockTakes,
    isFetching: isFetchingStockTakes 
  } = useGetStockTakesQuery({
    branch_id: selectedBranchId || undefined
  });

  const [createStockTake, { isLoading: isCreating }] = useCreateStockTakeMutation();
  const [updateStockTake, { isLoading: isUpdating }] = useUpdateStockTakeMutation();

  const stockTakes = stockTakesData?.data || [];
  const branches = branchesData?.data || [];

  const filteredStockTakes = useMemo(() => {
    return stockTakes.filter((st: any) => {
      const matchesSearch = 
        st.code?.toLowerCase().includes(search.toLowerCase()) ||
        st.note?.toLowerCase().includes(search.toLowerCase()) ||
        st.branch_name?.toLowerCase().includes(search.toLowerCase());
      
      return matchesSearch;
    });
  }, [stockTakes, search]);

  const handleCreate = async (data: any) => {
    try {
      await createStockTake(data).unwrap();
      toast.success("Stock take submitted successfully");
      return true;
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to submit stock take");
      return false;
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateStockTake({ id, data }).unwrap();
      toast.success("Stock take updated successfully");
      return true;
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update stock take");
      return false;
    }
  };

  return {
    selectedBranchId,
    setSelectedBranchId,
    search,
    setSearch,
    branches,
    isLoadingBranches,
    stockTakes,
    filteredStockTakes,
    isLoadingStockTakes,
    isFetchingStockTakes,
    handleCreate,
    handleUpdate,
    isCreating,
    isUpdating,
    user
  };
};
