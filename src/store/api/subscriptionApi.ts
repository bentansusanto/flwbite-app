import { apiSlice } from "./apiSlice";

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: string;
  price_at_purchase: number;
  currency: string;
  start_date: string;
  end_date: string;
}

export interface Plan {
  id: string;
  name: string;
  max_users: number;
  max_branches: number;
  price: number;
  currency: string;
}

export const subscriptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentSubscription: builder.query<{ status: string; data: Subscription }, void>({
      query: () => "/subscriptions/me",
      providesTags: ["Tenant"],
    }),
    getPlanById: builder.query<{ status: string; data: Plan }, string>({
      query: (id) => `/plans/${id}`,
    }),
  }),
});

export const {
  useGetCurrentSubscriptionQuery,
  useGetPlanByIdQuery,
} = subscriptionApi;
