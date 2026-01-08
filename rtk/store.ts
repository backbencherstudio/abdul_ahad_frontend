import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { subscriptionApi } from "./api/admin/garages-management/subscriptionApis";
import { usersManagementApi } from "./api/admin/usersManagentApis";
import { roleManagementApi } from "./api/admin/roleManagementApis";
import subscriptionSlice from "./slices/subscriptionSlice";
import usersManagementSlice from "./slices/admin/usersManagentSlice";
import roleManagementSlice from "./slices/admin/roleManagementSlice";
import { garagesApi } from "./api/admin/garages-management/listAllGarageApi";
import { subscriptionsManagementApi } from "./api/admin/subscriptions-management/subscriptionManagementAPI";
import { dashboardApi } from "./api/admin/dashboard/dashboardApi";
import { vehiclesApi } from "./api/admin/vehiclesManagements/vehicles-management";
import { driversApi } from "./api/admin/driverManagement/driver-managementApis";
import { reminderApis } from "./api/admin/vehiclesManagements/reminderApis";
import { profileApi } from "./api/garage/profileApis";
import { scheduleApi } from "./api/garage/scheduleApis";
import { pricingApi } from "./api/garage/pricingApis";
import { bookingsApi } from "./api/garage/bookingsApis";
import { contactApis } from "./api/garage/contactApis";
import { driverContactApis } from "./api/driver/contactusApi";
import pricingReducer from "./slices/garage/pricingSlice";
import { vehiclesApis } from "./api/driver/vehiclesApis";
import vehiclesReducer from "./slices/driver/vehiclesSlice";
import { bookMyMotApi } from "./api/driver/bookMyMotApi";
import bookMyMotReducer from "./slices/driver/bookMyMotSlice";
import { bookingManagementApi } from "./api/admin/booking-management/bookingManagementApis";
import bookingManagementSlice from "./slices/admin/bookingManagementSlice";
import { subscriptionsMeApi } from "./api/garage/subscriptionsMeApis";
import { invoicesApi } from "./api/garage/invoiceApis";
import { garageDriverApis } from "./api/notification/garageDriverApis";
import { adminNotificationApis } from "./api/notification/adminNotificationApis";
import authReducer from "./slices/authSlice";

// Combine all reducers
const appReducer = combineReducers({
  auth: authReducer,
  [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  [usersManagementApi.reducerPath]: usersManagementApi.reducer,
  [roleManagementApi.reducerPath]: roleManagementApi.reducer,
  [garagesApi.reducerPath]: garagesApi.reducer,
  [subscriptionsManagementApi.reducerPath]: subscriptionsManagementApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [vehiclesApi.reducerPath]: vehiclesApi.reducer,
  [driversApi.reducerPath]: driversApi.reducer,
  [reminderApis.reducerPath]: reminderApis.reducer,
  [scheduleApi.reducerPath]: scheduleApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [pricingApi.reducerPath]: pricingApi.reducer,
  [bookingsApi.reducerPath]: bookingsApi.reducer,
  [contactApis.reducerPath]: contactApis.reducer,
  [driverContactApis.reducerPath]: driverContactApis.reducer,
  [vehiclesApis.reducerPath]: vehiclesApis.reducer,
  [bookMyMotApi.reducerPath]: bookMyMotApi.reducer,
  [bookingManagementApi.reducerPath]: bookingManagementApi.reducer,
  [subscriptionsMeApi.reducerPath]: subscriptionsMeApi.reducer,
  [invoicesApi.reducerPath]: invoicesApi.reducer,
  [garageDriverApis.reducerPath]: garageDriverApis.reducer,
  [adminNotificationApis.reducerPath]: adminNotificationApis.reducer,
  subscription: subscriptionSlice,
  usersManagement: usersManagementSlice,
  roleManagement: roleManagementSlice,
  pricing: pricingReducer,
  vehicles: vehiclesReducer,
  bookMyMot: bookMyMotReducer,
  bookingManagement: bookingManagementSlice,
});

// Root reducer that resets entire store on logout
const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: any
) => {
  // Reset entire store when logout action is dispatched
  if (action.type === "auth/logout") {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      subscriptionApi.middleware,
      usersManagementApi.middleware,
      roleManagementApi.middleware,
      garagesApi.middleware,
      vehiclesApi.middleware,
      driversApi.middleware,
      reminderApis.middleware,
      subscriptionsManagementApi.middleware,
      dashboardApi.middleware,
      scheduleApi.middleware,
      profileApi.middleware,
      pricingApi.middleware,
      bookingsApi.middleware,
      contactApis.middleware,
      driverContactApis.middleware,
      vehiclesApis.middleware,
      bookMyMotApi.middleware,
      bookingManagementApi.middleware,
      subscriptionsMeApi.middleware,
      invoicesApi.middleware,
      garageDriverApis.middleware,
      adminNotificationApis.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
