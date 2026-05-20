import { apiSlice } from "./apiSlice";

export const stockApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllStocks: builder.query({
      query: () => "/stocks",
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "Stock" as const, id })),
              { type: "Stock", id: "LIST" },
            ]
          : [{ type: "Stock", id: "LIST" }],
    }),
    getStocksByBranch: builder.query({
      query: (branchId: string) => `/stocks/branch/${branchId}`,
      providesTags: (result, error, branchId) => [{ type: "Stock", id: `BRANCH_${branchId}` }],
    }),
    getStocksByVariant: builder.query({
      query: (variantId: string) => `/stocks/variant/${variantId}`,
      providesTags: (result, error, variantId) => [{ type: "Stock", id: `VARIANT_${variantId}` }],
    }),
    updateStock: builder.mutation({
      query: (body) => ({
        url: "/stocks/update",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Stock", id: "LIST" },
        { type: "Product", id: "LIST" }
      ],
    }),
  }),
});

export const {
  useGetAllStocksQuery,
  useGetStocksByBranchQuery,
  useGetStocksByVariantQuery,
  useUpdateStockMutation,
} = stockApi;
