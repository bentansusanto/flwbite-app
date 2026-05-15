import { apiSlice } from "./apiSlice";

export const userManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "User" as const, id })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),
    createUser: builder.mutation({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: [{ type: "User" as const, id: "LIST" }],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: "PUT", body }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User" as const, id },
        { type: "User" as const, id: "LIST" },
      ],
    }),
    deleteUser: builder.mutation({
      query: (id: string) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "User" as const, id },
        { type: "User" as const, id: "LIST" },
      ],
    }),
    getRoles: builder.query({
      query: () => "/roles",
      providesTags: [{ type: "User" as const, id: "ROLES" }],
    }),
    getPermissions: builder.query({
      query: () => "/permissions",
      providesTags: [{ type: "User" as const, id: "PERMISSIONS" }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useGetPermissionsQuery,
} = userManagementApi;
