import { apiSlice } from "./apiSlice";

export interface SessionSalesSummary {
  total_amount: number;
  expected_cash: number;
  payment_methods: Record<string, number>;
}

export interface PosSession {
  id: string;
  branch_id: string;
  branch_name: string;
  user_id: string;
  user_name: string;
  start_time: string;
  end_time: string | null;
  opening_balance: number;
  closing_balance: number;
  expected_cash: number;
  difference: number;
  status: string;
  notes: string;
  payment_methods?: Record<string, number>;
  summary?: SessionSalesSummary;
}

export const posSessionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveSessionSummary: builder.query<{ data: PosSession }, string>({
      query: (branchId) => `/pos-sessions/active/${branchId}/summary`,
      providesTags: ["PosSession"],
    }),
    getMyActiveSessions: builder.query<{ data: PosSession[] }, void>({
      query: () => "/pos-sessions/active-me",
      providesTags: ["PosSession"],
    }),
    getSessions: builder.query<{ data: PosSession[] }, { branch_id?: string }>({
      query: (params) => ({
        url: "/pos-sessions",
        params,
      }),
      providesTags: ["PosSession"],
    }),
    getSessionById: builder.query<{ data: PosSession }, string>({
      query: (id) => `/pos-sessions/${id}`,
      providesTags: (result, error, id) => [{ type: "PosSession", id }],
    }),
    openSession: builder.mutation<any, { branch_id: string; opening_balance: number; notes: string }>({
      query: (body) => ({
        url: "/pos-sessions/open",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PosSession"],
    }),
    closeSession: builder.mutation<any, { branch_id: string; closing_balance: number; payment_declarations?: string; notes: string }>({
      query: ({ branch_id, ...body }) => ({
        url: `/pos-sessions/close/${branch_id}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PosSession"],
    }),
  }),
});

export const {
  useGetActiveSessionSummaryQuery,
  useGetMyActiveSessionsQuery,
  useGetSessionsQuery,
  useGetSessionByIdQuery,
  useOpenSessionMutation,
  useCloseSessionMutation,
} = posSessionApi;
