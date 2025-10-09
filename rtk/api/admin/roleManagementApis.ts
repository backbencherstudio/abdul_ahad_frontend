import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../baseApi';
import { PAGINATION_CONFIG } from '../../../config/pagination.config';

// Types

interface Role {
    id: string;
    name: string;
    title?: string;
    description?: string;
    created_at: string;
    updated_at: string;
    permission_count?: number;
}


// Role Management API endpoints
export const roleManagementApi = createApi({
    reducerPath: 'roleManagementApi',
    baseQuery,
    tagTypes: ['Role'],
    endpoints: (builder) => ({


        // get all roles
        getRoles: builder.query<{ success: boolean; data: { roles: Role[]; pagination?: any } }, void>({
            query: () => '/api/admin/roles',
            providesTags: ['Role'],
        }),


    }),
});

export const { useGetRolesQuery } = roleManagementApi;