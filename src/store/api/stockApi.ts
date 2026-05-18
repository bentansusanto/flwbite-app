import { apiSlice } from "./apiSlice";

export const stockApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllStocks: builder.query({
      query: () => "/stocks",
      providesTags: ["Stock"],
    }),
    getStocksByBranch: builder.query({
      query: (branchId: string) => `/stocks/branch/${branchId}`,
      providesTags: ["Stock"],
    }),
    getStocksByVariant: builder.query({
      query: (variantId: string) => `/stocks/variant/${variantId}`,
      providesTags: ["Stock"],
    }),
    updateStock: builder.mutation({
      query: (body) => ({
        url: "/stocks/update",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stock", "Product"],
    }),
  }),
});

export const {
  useGetAllStocksQuery,
  useGetStocksByBranchQuery,
  useGetStocksByVariantQuery,
  useUpdateStockMutation,
} = stockApi;
