import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers) => {
    const token = Cookies.get("flwbite_token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    const csrfToken = Cookies.get("csrf_token");
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
    return headers;
  },
  credentials: 'include', // Important for HttpOnly cookies (refresh_token)
});

// Mutex to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Helper to handle refresh mutex safely
  const performRefresh = async () => {
    try {
      return await baseQuery({ url: '/auth/refresh-token', method: 'POST' }, api, extraOptions);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  };

  // 1. Proactive check BEFORE the request
  const token = Cookies.get("flwbite_token");
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const exp = payload.exp * 1000;
      const now = Date.now();
      const REFRESH_BUFFER = 3 * 60 * 1000; // 3 minutes

      if (exp - now < REFRESH_BUFFER) {
        
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = performRefresh();
        }

        const refreshResult = await refreshPromise;

        if (refreshResult?.data) {
          const newAccessToken = (refreshResult.data as any).data.access_token;
          if (newAccessToken) {
            Cookies.set("flwbite_token", newAccessToken, { expires: 7 });
          }
        }
      }
    } catch (e) {
      // Failed to parse token
    }
  }

  // 2. Perform the actual request
  let result = await baseQuery(args, api, extraOptions);

  // 3. Reactive check if we still get a 401
  if (result.error && result.error.status === 401) {
    
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = performRefresh();
    }

    const refreshResult = await refreshPromise;

    if (refreshResult?.data) {
      const newAccessToken = (refreshResult.data as any).data.access_token;
      if (newAccessToken) {
         Cookies.set("flwbite_token", newAccessToken, { expires: 7 });
         // retry the initial query
         result = await baseQuery(args, api, extraOptions);
      }
    } else {
      // logout if refresh failed
      Cookies.remove("flwbite_token");
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Category", "User", "Order", "Branch", "Supplier", "SupplierCategory", "PurchaseOrder", "PurchaseReceiving", "Stock", "StockTake", "ProductBatch", "StockMovement", "PosSession", "Customer", "Tax", "Promotion", "Tenant"], // Define common tags for caching

  endpoints: (builder) => ({}), // Endpoints will be injected from other files
});
