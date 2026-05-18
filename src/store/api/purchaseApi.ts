import { apiSlice } from "./apiSlice";

export const purchaseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query({
      query: (params) => ({
        url: "/purchase-orders",
        params,
      }),
      providesTags: ["PurchaseOrder"],
    }),
    getPurchaseOrderById: builder.query({
      query: (id: string) => `/purchase-orders/${id}`,
      providesTags: ["PurchaseOrder"],
    }),
    createPurchaseOrder: builder.mutation({
      query: (body) => ({
        url: "/purchase-orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),
    updatePurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),
    payPurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/${id}/pay`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),
    getPurchaseReceivings: builder.query({
      query: (params) => ({
        url: "/purchase-receivings",
        params,
      }),
      providesTags: ["PurchaseReceiving"],
    }),
    getPurchaseReceivingById: builder.query({
      query: (id: string) => `/purchase-receivings/${id}`,
      providesTags: ["PurchaseReceiving"],
    }),
    createPurchaseReceiving: builder.mutation({
      query: (body) => ({
        url: "/purchase-receivings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseReceiving", "PurchaseOrder", "Product", "Stock"],
    }),
    cancelPurchaseOrder: builder.mutation({
      query: (id: string) => ({
        url: `/purchase-orders/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  usePayPurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
  useGetPurchaseReceivingsQuery,
  useGetPurchaseReceivingByIdQuery,
  useCreatePurchaseReceivingMutation,
} = purchaseApi;
