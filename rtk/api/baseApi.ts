import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_ENDPOINT,
    prepareHeaders: (headers) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});