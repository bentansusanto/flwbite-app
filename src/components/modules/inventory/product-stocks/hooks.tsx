import { useState, useMemo } from "react";
import { useGetStocksByBranchQuery, useGetAllStocksQuery } from "../../../../store/api/stockApi";
import { useGetBranchesQuery } from "../../../../store/api/branchApi";
import { useAppSelector } from "../../../../store/hooks";
import { RootState } from "../../../../store";

export const useProductStocks = () => {
  // Try to get user from auth state if it exists, otherwise default to empty
  const user = useAppSelector((state: RootState) => (state as any).auth?.user);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(user?.branch_id || "");
  const [search, setSearch] = useState("");

  const { data: branchesData, isLoading: isLoadingBranches } = useGetBranchesQuery({});
  
  const { data: branchStocks, isLoading: isLoadingBranchStocks } = useGetStocksByBranchQuery(selectedBranchId, {
    skip: !selectedBranchId
  });

  const { data: allStocks, isLoading: isLoadingAllStocks } = useGetAllStocksQuery(undefined, {
    skip: !!selectedBranchId
  });

  const stocks = selectedBranchId ? (branchStocks?.data || []) : (allStocks?.data || []);
  const isLoadingStocks = selectedBranchId ? isLoadingBranchStocks : isLoadingAllStocks;
  const branches = branchesData?.data || [];

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock: any) =>
      stock.product_name.toLowerCase().includes(search.toLowerCase()) ||
      stock.variant_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [stocks, search]);

  const lowStockCount = useMemo(() => {
    return stocks.filter((stock: any) => stock.actual_stock <= (stock.min_stock || 5)).length;
  }, [stocks]);

  const totalValue = useMemo(() => {
    return stocks.reduce((acc: number, curr: any) => acc + curr.actual_stock, 0);
  }, [stocks]);

  return {
    selectedBranchId,
    setSelectedBranchId,
    search,
    setSearch,
    branches,
    isLoadingBranches,
    stocks,
    filteredStocks,
    isLoadingStocks,
    lowStockCount,
    totalValue,
    user
  };
};
