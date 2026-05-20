import { apiSlice } from "./apiSlice";

export const productBatchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductBatches: builder.query<any, { branch_id?: string; variant_id?: string }>({
      query: (params) => ({
        url: "/batches",
        params
      }),
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "ProductBatch" as const, id })),
              { type: "ProductBatch", id: "LIST" },
            ]
          : [{ type: "ProductBatch", id: "LIST" }]
    }),
    getProductBatchById: builder.query<any, string>({
      query: (id) => `/batches/${id}`,
      providesTags: (result, error, id) => [{ type: "ProductBatch", id }]
    }),
    createProductBatch: builder.mutation<any, any>({
      query: (data) => ({
        url: "/batches",
        method: "POST",
        body: data
      }),
      invalidatesTags: [{ type: "ProductBatch", id: "LIST" }]
    }),
    updateProductBatch: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/batches/${id}`,
        method: "PATCH",
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ProductBatch", id: "LIST" },
        { type: "ProductBatch", id }
      ]
    }),
    deleteProductBatch: builder.mutation<any, string>({
      query: (id) => ({
        url: `/batches/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "ProductBatch", id: "LIST" }]
    })
  })
});

export const {
  useGetProductBatchesQuery,
  useGetProductBatchByIdQuery,
  useCreateProductBatchMutation,
  useUpdateProductBatchMutation,
  useDeleteProductBatchMutation
} = productBatchApi;
