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
      providesTags: ["Customer"],
    }),
    createCustomer: builder.mutation<any, any>({
      query: (body) => ({
        url: "/customers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const { useGetCustomersQuery, useCreateCustomerMutation } = customerApi;
