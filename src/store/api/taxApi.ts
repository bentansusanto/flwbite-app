import { apiSlice } from "./apiSlice";

export interface Tax {
  id: string;
  tenant_id: string;
  name: string;
  value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const taxApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTaxes: builder.query<{ status: string; data: Tax[] }, void>({
      query: () => "/taxes",
      providesTags: ["Tax"],
    }),
    getTaxById: builder.query<{ status: string; data: Tax }, string>({
      query: (id) => `/taxes/${id}`,
      providesTags: ["Tax"],
    }),
    createTax: builder.mutation<{ status: string; data: Tax }, Partial<Tax>>({
      query: (body) => ({
        url: "/taxes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tax"],
    }),
    updateTax: builder.mutation<{ status: string; data: Tax }, { id: string; name: string; value: number; is_active: boolean }>({
      query: ({ id, ...body }) => ({
        url: `/taxes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Tax"],
    }),
    deleteTax: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/taxes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tax"],
    }),
  }),
});

export const {
  useGetTaxesQuery,
  useGetTaxByIdQuery,
  useCreateTaxMutation,
  useUpdateTaxMutation,
  useDeleteTaxMutation,
} = taxApi;
