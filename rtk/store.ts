import { configureStore } from "@reduxjs/toolkit";
import { subscriptionApi } from "./api/admin/garages-management/subscriptionApis";
import { usersManagementApi } from "./api/admin/usersManagentApis";
import { roleManagementApi } from "./api/admin/roleManagementApis";
import subscriptionSlice from "./slices/subscriptionSlice";
import usersManagementSlice from "./slices/admin/usersManagentSlice";
import roleManagementSlice from "./slices/admin/roleManagementSlice";
import { garagesApi } from "./api/admin/garages-management/listAllGarageApi";
import { subscriptionsManagementApi } from "./api/admin/subscriptions-management/subscriptionManagementAPI";
import { dashboardApi } from "./api/admin/dashboard/dashboardApi";
import { driversApi } from "./api/admin/drivers-management/allDriversList";
import { garageAvailabilityApi } from "./api/garage/api";
import { profileApi } from "./api/garage/profileApis";
import { apiClient } from "./api/garage/api";

export const store = configureStore({
  reducer: {
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [usersManagementApi.reducerPath]: usersManagementApi.reducer,
    [roleManagementApi.reducerPath]: roleManagementApi.reducer,
    [garagesApi.reducerPath]: garagesApi.reducer,
    [subscriptionsManagementApi.reducerPath]:
      subscriptionsManagementApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [driversApi.reducerPath]: driversApi.reducer,
    [garageAvailabilityApi.reducerPath]: garageAvailabilityApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    subscription: subscriptionSlice,
    usersManagement: usersManagementSlice,
    roleManagement: roleManagementSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      subscriptionApi.middleware,
      usersManagementApi.middleware,
      roleManagementApi.middleware,
      garagesApi.middleware,
      driversApi.middleware,
      subscriptionsManagementApi.middleware,
      dashboardApi.middleware,
      garageAvailabilityApi.middleware,
      profileApi.middleware
    ),
});

// Initialize apiClient with store
apiClient.setStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
