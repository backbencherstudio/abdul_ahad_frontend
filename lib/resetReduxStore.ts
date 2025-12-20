import { store } from "@/rtk/store";
import { subscriptionApi } from "@/rtk/api/admin/garages-management/subscriptionApis";
import { usersManagementApi } from "@/rtk/api/admin/usersManagentApis";
import { roleManagementApi } from "@/rtk/api/admin/roleManagementApis";
import { garagesApi } from "@/rtk/api/admin/garages-management/listAllGarageApi";
import { subscriptionsManagementApi } from "@/rtk/api/admin/subscriptions-management/subscriptionManagementAPI";
import { dashboardApi } from "@/rtk/api/admin/dashboard/dashboardApi";
import { vehiclesApi } from "@/rtk/api/admin/vehiclesManagements/vehicles-management";
import { driversApi } from "@/rtk/api/admin/driverManagement/driver-managementApis";
import { reminderApis } from "@/rtk/api/admin/vehiclesManagements/reminderApis";
import { garageAvailabilityApi } from "@/rtk/api/garage/api";
import { profileApi } from "@/rtk/api/garage/profileApis";
import { pricingApi } from "@/rtk/api/garage/pricingApis";
import { bookingsApi } from "@/rtk/api/garage/bookingsApis";
import { contactApis } from "@/rtk/api/garage/contactApis";
import { driverContactApis } from "@/rtk/api/driver/contactusApi";
import { vehiclesApis } from "@/rtk/api/driver/vehiclesApis";
import { bookMyMotApi } from "@/rtk/api/driver/bookMyMotApi";
import { bookingManagementApi } from "@/rtk/api/admin/booking-management/bookingManagementApis";
import { subscriptionsMeApi } from "@/rtk/api/garage/subscriptionsMeApis";
import { invoicesApi } from "@/rtk/api/garage/invoiceApis";
import { logout } from "@/rtk/slices/authSlice";

/**
 * Resets all Redux state including RTK Query cache
 * Call this function on logout to prevent data leakage between users
 */
export const resetReduxStore = (): void => {
  // Reset all RTK Query API caches
  store.dispatch(subscriptionApi.util.resetApiState());
  store.dispatch(usersManagementApi.util.resetApiState());
  store.dispatch(roleManagementApi.util.resetApiState());
  store.dispatch(garagesApi.util.resetApiState());
  store.dispatch(subscriptionsManagementApi.util.resetApiState());
  store.dispatch(dashboardApi.util.resetApiState());
  store.dispatch(vehiclesApi.util.resetApiState());
  store.dispatch(driversApi.util.resetApiState());
  store.dispatch(reminderApis.util.resetApiState());
  store.dispatch(garageAvailabilityApi.util.resetApiState());
  store.dispatch(profileApi.util.resetApiState());
  store.dispatch(pricingApi.util.resetApiState());
  store.dispatch(bookingsApi.util.resetApiState());
  store.dispatch(contactApis.util.resetApiState());
  store.dispatch(driverContactApis.util.resetApiState());
  store.dispatch(vehiclesApis.util.resetApiState());
  store.dispatch(bookMyMotApi.util.resetApiState());
  store.dispatch(bookingManagementApi.util.resetApiState());
  store.dispatch(subscriptionsMeApi.util.resetApiState());
  store.dispatch(invoicesApi.util.resetApiState());

  // Dispatch logout action to reset all slices (via rootReducer)
  store.dispatch(logout());
};

