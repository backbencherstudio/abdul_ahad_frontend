import { configureStore } from '@reduxjs/toolkit';
import { subscriptionApi } from './api/garage/subscriptionApis';
import subscriptionSlice from './slices/subscriptionSlice';

export const store = configureStore({
    reducer: {
        [subscriptionApi.reducerPath]: subscriptionApi.reducer,
        subscription: subscriptionSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(subscriptionApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
