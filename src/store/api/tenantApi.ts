import { apiSlice } from "./apiSlice";

export const tenantApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMeTenant: builder.query({
      query: () => "/tenants/me",
      providesTags: ["Tenant"],
    }),
    updateMeTenant: builder.mutation({
      query: (body) => ({ url: "/tenants/me", method: "PUT", body }),
      invalidatesTags: ["Tenant"],
    }),
  }),
});

export const {
  useGetMeTenantQuery,
  useUpdateMeTenantMutation,
} = tenantApi;
