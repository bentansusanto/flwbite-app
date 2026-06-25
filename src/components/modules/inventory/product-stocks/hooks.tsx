import { useState, useEffect, useMemo } from "react";
import { useGetStocksByBranchQuery, useGetAllStocksQuery } from "../../../../store/api/stockApi";
import { useGetBranchesQuery } from "../../../../store/api/branchApi";
import { useAppSelector } from "../../../../store/hooks";
import { RootState } from "../../../../store";
import { useGetProductsQuery } from "../../../../store/api/productApi";
import { useUpdateStockMutation } from "../../../../store/api/stockApi";
import { useFormik } from "formik";
import { toast } from "sonner";
import { AddStockSchema, AddStockFormValues } from "./schema";

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
      (stock.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (stock.variant_name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [stocks, search]);

  const lowStockCount = useMemo(() => {
    return stocks.filter((stock: any) => stock.actual_stock <= (stock.min_stock || 5)).length;
  }, [stocks]);

  const totalValue = useMemo(() => {
    return stocks.reduce((acc: number, curr: any) => acc + curr.actual_stock, 0);
  }, [stocks]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBranchId]);

  const paginatedStocks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStocks.slice(start, start + pageSize);
  }, [filteredStocks, currentPage, pageSize]);

  return {
    currentPage, setCurrentPage, pageSize, setPageSize, paginatedStocks,
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

export const useAddStockModal = (onClose: () => void) => {
  const [updateStock, { isLoading: isUpdating }] = useUpdateStockMutation();
  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery({});
  
  const products = productsData?.data || [];

  const formik = useFormik<AddStockFormValues>({
    initialValues: {
      branch_id: "",
      product_id: "",
      variant_id: "",
      amount: 0,
    },
    validate: (values) => {
      // Input returns string, we must parse it to number before validating
      const parsedValues = {
        ...values,
        amount: Number(values.amount)
      };
      const result = AddStockSchema.safeParse(parsedValues);
      if (result.success) return {};
      const errors: any = {};
      result.error.issues.forEach((issue) => {
        if (!errors[issue.path[0]]) {
          errors[issue.path[0]] = issue.message;
        }
      });
      return errors;
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        await updateStock({
          branch_id: values.branch_id,
          variant_id: values.variant_id,
          amount: Number(values.amount),
          action: "ADJUSTMENT"
        }).unwrap();
        
        toast.success("Stok berhasil ditambahkan!");
        resetForm();
        onClose();
      } catch (error: any) {
        toast.error(error?.data?.message || "Gagal menambahkan stok");
      }
    },
  });

  return { formik, isUpdating, products, isLoadingProducts };
};
