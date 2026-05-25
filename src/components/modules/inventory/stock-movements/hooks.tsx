import { useState, useEffect, useMemo } from "react";
import { useGetStockMovementsByBranchQuery, useGetAllStockMovementsQuery } from "@/store/api/stockMovementApi";
import { useGetBranchesQuery } from "@/store/api/branchApi";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";

export const useStockMovements = () => {
  const user = useAppSelector((state: RootState) => (state as any).auth?.user);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(user?.branch_id || "");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const { data: branchesData, isLoading: isLoadingBranches } = useGetBranchesQuery({});
  
  const { 
    data: branchMovements, 
    isLoading: isLoadingBranchMovements,
    isFetching: isFetchingBranchMovements 
  } = useGetStockMovementsByBranchQuery(selectedBranchId, {
    skip: !selectedBranchId
  });

  const {
    data: allMovements,
    isLoading: isLoadingAllMovements,
    isFetching: isFetchingAllMovements
  } = useGetAllStockMovementsQuery(undefined, {
    skip: !!selectedBranchId
  });

  const movements = selectedBranchId ? (branchMovements?.data || []) : (allMovements?.data || []);
  const isLoadingMovements = selectedBranchId ? isLoadingBranchMovements : isLoadingAllMovements;
  const isFetchingMovements = selectedBranchId ? isFetchingBranchMovements : isFetchingAllMovements;
  const branches = branchesData?.data || [];

  const filteredMovements = useMemo(() => {
    return movements.filter((m: any) => {
      const matchesSearch = 
        m.variant_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.note?.toLowerCase().includes(search.toLowerCase()) ||
        m.reference_type?.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = typeFilter === "ALL" || m.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [movements, search, typeFilter]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBranchId]);

  const paginatedMovements = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMovements.slice(start, start + pageSize);
  }, [filteredMovements, currentPage, pageSize]);

  return {
    currentPage, setCurrentPage, pageSize, setPageSize, paginatedMovements,
    selectedBranchId,
    setSelectedBranchId,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    branches,
    isLoadingBranches,
    movements,
    filteredMovements,
    isLoadingMovements,
    isFetchingMovements,
    user
  };
};
