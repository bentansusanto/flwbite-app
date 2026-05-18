import { apiSlice } from "./apiSlice";

export const branchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query({
      query: () => "/branches",
      providesTags: ["Branch"],
    }),
    getBranchById: builder.query({
      query: (id: string) => `/branches/${id}`,
      providesTags: ["Branch"],
    }),
    createBranch: builder.mutation({
      query: (body) => ({ url: "/branches", method: "POST", body }),
      invalidatesTags: ["Branch"],
    }),
    updateBranch: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/branches/${id}`, method: "PUT", body }),
      invalidatesTags: ["Branch"],
    }),
    deleteBranch: builder.mutation({
      query: (id: string) => ({ url: `/branches/${id}`, method: "DELETE" }),
      invalidatesTags: ["Branch"],
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useGetBranchByIdQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchApi;
