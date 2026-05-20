import { apiSlice } from "./apiSlice";

export const stockMovementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStockMovementsByBranch: builder.query({
      query: (branchId: string) => `/stock-movements/branch/${branchId}`,
      providesTags: (result, error, branchId) => [{ type: "StockMovement" as const, id: `BRANCH_${branchId}` }],
    }),
    getAllStockMovements: builder.query({
      query: () => "/stock-movements",
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "StockMovement" as const, id })),
              { type: "StockMovement", id: "LIST" },
            ]
          : [{ type: "StockMovement", id: "LIST" }],
    }),
    getStockMovementsByVariant: builder.query({
      query: (variantId: string) => `/stock-movements/variant/${variantId}`,
      providesTags: (result, error, variantId) => [{ type: "StockMovement" as const, id: `VARIANT_${variantId}` }],
    }),
  }),
});

export const {
  useGetStockMovementsByBranchQuery,
  useGetAllStockMovementsQuery,
  useGetStockMovementsByVariantQuery,
} = stockMovementApi;
