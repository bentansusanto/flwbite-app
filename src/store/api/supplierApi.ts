import { apiSlice } from "./apiSlice";

export const supplierApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: () => "/suppliers",
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "Supplier" as const, id })),
              { type: "Supplier", id: "LIST" },
            ]
          : [{ type: "Supplier", id: "LIST" }],
    }),
    getSupplierCategories: builder.query({
      query: () => "/supplier_categories",
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "SupplierCategory" as const, id })),
              { type: "SupplierCategory", id: "LIST" },
            ]
          : [{ type: "SupplierCategory", id: "LIST" }],
    }),
    createSupplierCategory: builder.mutation({
      query: (body) => ({
        url: "/supplier_categories",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "SupplierCategory", id: "LIST" }],
    }),
    updateSupplierCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/supplier_categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SupplierCategory", id: "LIST" },
        { type: "SupplierCategory", id },
      ],
    }),
    deleteSupplierCategory: builder.mutation({
      query: (id) => ({
        url: `/supplier_categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "SupplierCategory", id: "LIST" }],
    }),
    createSupplier: builder.mutation({
      query: (body) => ({
        url: "/suppliers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Supplier", id: "LIST" }],
    }),
    updateSupplier: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/suppliers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Supplier", id: "LIST" },
        { type: "Supplier", id },
      ],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Supplier", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierCategoriesQuery,
  useCreateSupplierCategoryMutation,
  useUpdateSupplierCategoryMutation,
  useDeleteSupplierCategoryMutation,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;
