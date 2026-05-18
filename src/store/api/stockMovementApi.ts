import { apiSlice } from "./apiSlice";

export const stockMovementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStockMovementsByBranch: builder.query({
      query: (branchId: string) => `/stock-movements/branch/${branchId}`,
      providesTags: ["Stock"],
    }),
    getAllStockMovements: builder.query({
      query: () => "/stock-movements",
      providesTags: ["Stock"],
    }),
    getStockMovementsByVariant: builder.query({
      query: (variantId: string) => `/stock-movements/variant/${variantId}`,
      providesTags: ["Stock"],
    }),
  }),
});

export const {
  useGetStockMovementsByBranchQuery,
  useGetAllStockMovementsQuery,
  useGetStockMovementsByVariantQuery,
} = stockMovementApi;
