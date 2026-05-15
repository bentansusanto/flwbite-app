import { apiSlice } from "./apiSlice";

export const stockMovementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStockMovementsByBranch: builder.query({
      query: (branchId: string) => `/stock-movements/branch/${branchId}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "Stock" as const, id })),
              { type: "Stock" as const, id: "LIST" },
            ]
          : [{ type: "Stock" as const, id: "LIST" }],
    }),
    getAllStockMovements: builder.query({
      query: () => "/stock-movements",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "Stock" as const, id })),
              { type: "Stock" as const, id: "LIST" },
            ]
          : [{ type: "Stock" as const, id: "LIST" }],
    }),
    getStockMovementsByVariant: builder.query({
      query: (variantId: string) => `/stock-movements/variant/${variantId}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "Stock" as const, id })),
              { type: "Stock" as const, id: "LIST" },
            ]
          : [{ type: "Stock" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useGetStockMovementsByBranchQuery,
  useGetAllStockMovementsQuery,
  useGetStockMovementsByVariantQuery,
} = stockMovementApi;
