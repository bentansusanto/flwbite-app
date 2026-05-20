import { apiSlice } from "./apiSlice";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  points?: number;
  created_at: string;
}

export const customerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<any, any>({
      query: (params) => ({
        url: "/customers",
        params,
      }),
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "Customer" as const, id })),
              { type: "Customer", id: "LIST" },
            ]
          : [{ type: "Customer", id: "LIST" }],
    }),
    createCustomer: builder.mutation<any, any>({
      query: (body) => ({
        url: "/customers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }],
    }),
  }),
});

export const { useGetCustomersQuery, useCreateCustomerMutation } = customerApi;
