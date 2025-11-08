import { configureStore } from '@reduxjs/toolkit';
import { subscriptionApi } from './api/garage/subscriptionApis';
import { usersManagementApi } from './api/admin/usersManagentApis';
import { roleManagementApi } from './api/admin/roleManagementApis';
import subscriptionSlice from './slices/subscriptionSlice';
import usersManagementSlice from './slices/admin/usersManagentSlice';
import roleManagementSlice from './slices/admin/roleManagementSlice';
import { garagesApi } from './api/garage/listAllGarageApi';

export const store = configureStore({
    reducer: {
        [subscriptionApi.reducerPath]: subscriptionApi.reducer,
        [usersManagementApi.reducerPath]: usersManagementApi.reducer,
        [roleManagementApi.reducerPath]: roleManagementApi.reducer,
        [garagesApi.reducerPath]: garagesApi.reducer,
        subscription: subscriptionSlice,
        usersManagement: usersManagementSlice,
        roleManagement: roleManagementSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(subscriptionApi.middleware, usersManagementApi.middleware, roleManagementApi.middleware, garagesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
