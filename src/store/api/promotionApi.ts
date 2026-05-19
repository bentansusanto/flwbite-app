import { apiSlice } from "./apiSlice";

export interface PromotionRule {
  id?: string;
  condition_type: string;
  condition_value: string;
  action_type: string;
  action_value: string;
  condition_variants?: string[];
  condition_categories?: string[];
  action_variants?: string[];
  action_categories?: string[];
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  is_stackable: boolean;
  start_date: string;
  end_date: string;
  branches: string[];
  rules: PromotionRule[];
}

export interface CreatePromotionRequest {
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  is_stackable: boolean;
  start_date: string;
  end_date: string;
  branches: string[];
  rules: PromotionRule[];
}

export const promotionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPromotions: builder.query<{ status: string; message: string; data: Promotion[] }, void>({
      query: () => "/promotions",
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Promotion" as const, id })),
              { type: "Promotion", id: "LIST" },
            ]
          : [{ type: "Promotion", id: "LIST" }],
    }),
    getPromotionById: builder.query<{ status: string; message: string; data: Promotion }, string>({
      query: (id) => `/promotions/${id}`,
      providesTags: (result, error, id) => [{ type: "Promotion", id }],
    }),
    createPromotion: builder.mutation<{ status: string; message: string; data: Promotion }, CreatePromotionRequest>({
      query: (body) => ({
        url: "/promotions",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Promotion", id: "LIST" }],
    }),
    updatePromotion: builder.mutation<{ status: string; message: string; data: Promotion }, { id: string; body: CreatePromotionRequest }>({
      query: ({ id, body }) => ({
        url: `/promotions/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Promotion", id: "LIST" },
        { type: "Promotion", id },
      ],
    }),
    deletePromotion: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/promotions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Promotion", id: "LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPromotionsQuery,
  useGetPromotionByIdQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} = promotionApi;
