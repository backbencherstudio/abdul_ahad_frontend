import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";


// Current subscription response interface
export interface CurrentSubscriptionResponse {
    success: boolean;
    data: CurrentSubscription;
}

// Current subscription interface
export interface CurrentSubscription {
    id: string;
    plan_id: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    next_billing_date: string;
}

// Plan interface
export interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
}

// check subscription /api/garage-dashboard/subscription/me
export const subscriptionsMeApi = createApi({
    reducerPath: "subscriptionsMeApi",
    baseQuery,
    tagTypes: ["SubscriptionsMe"],
    endpoints: (builder) => ({
        getCurrentSubscription: builder.query<CurrentSubscriptionResponse, void>({
            query: () => "/api/garage-dashboard/subscription/me",
            providesTags: ["SubscriptionsMe"],
        }),
    }),
});

export const { useGetCurrentSubscriptionQuery } = subscriptionsMeApi;