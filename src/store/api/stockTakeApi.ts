import { apiSlice } from "./apiSlice";

export const stockTakeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStockTakes: builder.query<any, { branch_id?: string }>({
      query: (params) => ({
        url: "/stock-takes",
        params
      }),
      providesTags: ["StockTake"]
    }),
    getStockTakeById: builder.query<any, string>({
      query: (id) => `/stock-takes/${id}`,
      providesTags: (result, error, id) => [{ type: "StockTake", id }]
    }),
    createStockTake: builder.mutation<any, any>({
      query: (data) => ({
        url: "/stock-takes",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["StockTake"]
    }),
    updateStockTake: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/stock-takes/${id}`,
        method: "PATCH",
        body: data
      }),
      invalidatesTags: (result, error, { id }) => ["StockTake", { type: "StockTake", id }]
    })
  })
});

export const {
  useGetStockTakesQuery,
  useGetStockTakeByIdQuery,
  useCreateStockTakeMutation,
  useUpdateStockTakeMutation
} = stockTakeApi;
