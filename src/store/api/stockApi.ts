import { apiSlice } from "./apiSlice";

export const stockApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllStocks: builder.query({
      query: () => "/stocks",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "Stock" as const, id })),
              { type: "Stock" as const, id: "LIST" },
            ]
          : [{ type: "Stock" as const, id: "LIST" }],
    }),
    getStocksByBranch: builder.query({
      query: (branchId: string) => `/stocks/branch/${branchId}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "Stock" as const, id })),
              { type: "Stock" as const, id: "LIST" },
            ]
          : [{ type: "Stock" as const, id: "LIST" }],
    }),
    getStocksByVariant: builder.query({
      query: (variantId: string) => `/stocks/variant/${variantId}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "Stock" as const, id })),
              { type: "Stock" as const, id: "LIST" },
            ]
          : [{ type: "Stock" as const, id: "LIST" }],
    }),
    updateStock: builder.mutation({
      query: (body) => ({
        url: "/stocks/update",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Stock" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllStocksQuery,
  useGetStocksByBranchQuery,
  useGetStocksByVariantQuery,
  useUpdateStockMutation,
} = stockApi;
