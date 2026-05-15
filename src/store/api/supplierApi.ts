import { apiSlice } from "./apiSlice";

export const supplierApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: () => "/suppliers",
      providesTags: ["Supplier"],
    }),
    getSupplierCategories: builder.query({
      query: () => "/supplier_categories",
      providesTags: ["SupplierCategory"],
    }),
    createSupplierCategory: builder.mutation({
      query: (body) => ({
        url: "/supplier_categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SupplierCategory"],
    }),
    updateSupplierCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/supplier_categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => ["SupplierCategory", { type: "SupplierCategory", id }],
    }),
    deleteSupplierCategory: builder.mutation({
      query: (id) => ({
        url: `/supplier_categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SupplierCategory"],
    }),
    createSupplier: builder.mutation({
      query: (body) => ({
        url: "/suppliers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Supplier"],
    }),
    updateSupplier: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/suppliers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => ["Supplier", { type: "Supplier", id }],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Supplier"],
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
