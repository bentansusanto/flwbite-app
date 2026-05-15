import { apiSlice } from "./apiSlice";

export const branchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query({
      query: () => "/branches",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "Branch" as const, id })),
              { type: "Branch" as const, id: "LIST" },
            ]
          : [{ type: "Branch" as const, id: "LIST" }],
    }),
    getBranchById: builder.query({
      query: (id: string) => `/branches/${id}`,
      providesTags: (result, error, id) => [{ type: "Branch" as const, id }],
    }),
    createBranch: builder.mutation({
      query: (body) => ({ url: "/branches", method: "POST", body }),
      invalidatesTags: [{ type: "Branch" as const, id: "LIST" }],
    }),
    updateBranch: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/branches/${id}`, method: "PUT", body }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Branch" as const, id },
        { type: "Branch" as const, id: "LIST" },
      ],
    }),
    deleteBranch: builder.mutation({
      query: (id: string) => ({ url: `/branches/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Branch" as const, id },
        { type: "Branch" as const, id: "LIST" },
      ],
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
