import { apiSlice } from "@/store/api/apiSlice";
import Cookies from "js-cookie";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: "/auth/refresh-token",
        method: "POST",
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const newAccessToken = data?.data?.access_token;
          if (newAccessToken) {
            Cookies.set("flwbite_token", newAccessToken, { expires: 7 });
          }
        } catch (err) {
          // Refresh token mutation failed
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    getCsrfToken: builder.query<{ csrfToken: string }, any>({
      query: () => "/csrf-token",
      transformResponse: (response: any) => ({
        csrfToken: response?.data?.token ?? "",
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.csrfToken) {
            Cookies.set("csrf_token", data.csrfToken);
          }
        } catch (err) {
          console.error("Failed to fetch CSRF token:", err);
        }
      },
    }),
    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
  }),
});

export const { useLoginMutation, useRefreshTokenMutation, useLogoutMutation, useGetMeQuery, useGetCsrfTokenQuery } = authApi;
