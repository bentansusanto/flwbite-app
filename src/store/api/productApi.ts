import { apiSlice } from "./apiSlice";

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: "/products",
        params,
      }),
      // Provide LIST tag + individual tags untuk setiap produk
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({
                type: "Product" as const,
                id,
              })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product" as const, id }],
    }),
    createProduct: builder.mutation({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      // Invalidate LIST agar getProducts re-fetch
      invalidatesTags: [{ type: "Product" as const, id: "LIST" }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body,
      }),
      // Invalidate item spesifik + LIST
      invalidatesTags: (result, error, { id }) => [
        { type: "Product" as const, id },
        { type: "Product" as const, id: "LIST" },
      ],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Product" as const, id },
        { type: "Product" as const, id: "LIST" },
      ],
    }),
    // Variants
    createVariant: builder.mutation({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}/variants`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product" as const, id: productId },
        { type: "Product" as const, id: "LIST" },
      ],
    }),
    updateVariant: builder.mutation({
      query: ({ productId, variantId, ...body }) => ({
        url: `/products/${productId}/variants/${variantId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product" as const, id: productId },
        { type: "Product" as const, id: "LIST" },
      ],
    }),
    deleteVariant: builder.mutation({
      query: ({ productId, variantId }) => ({
        url: `/products/${productId}/variants/${variantId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product" as const, id: productId },
        { type: "Product" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
} = productApi;
