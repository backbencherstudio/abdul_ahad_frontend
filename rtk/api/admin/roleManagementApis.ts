import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../baseApi';
import { PAGINATION_CONFIG } from '../../../config/pagination.config';

// Types

interface Permission {
    id: string;
    title: string;
    action: string;
    subject: string;
}

interface Role {
    id: string;
    name: string;
    title?: string;
    description?: string;
    created_at: string;
    updated_at: string;
    permission_count?: number;
    permissions?: Permission[];
}

interface RoleStatistics {
    id: string;
    title: string;
    name: string;
    user_count: number;
    permission_count: number;
}

interface StatisticsData {
    summary: {
        total_roles: number;
        system_roles: number;
        custom_roles: number;
        total_users: number;
        total_permissions: number;
    };
    system_roles: RoleStatistics[];
    custom_roles: RoleStatistics[];
}


// Role Management API endpoints
export const roleManagementApi = createApi({
    reducerPath: 'roleManagementApi',
    baseQuery,
    tagTypes: ['Role'],
    endpoints: (builder) => ({


        // create role api title and name  pass in body 
        createRole: builder.mutation<{ success: boolean; data: Role }, { name: string; title: string }>({
            query: (body) => ({
                url: '/api/admin/roles',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Role'],
        }),

        // get all roles
        getRoles: builder.query<{ success: boolean; data: { roles: Role[]; pagination?: any } }, { page?: number; limit?: number } | void>({
            query: (arg) => {
                const params = arg || {};
                const page = params.page || PAGINATION_CONFIG.DEFAULT_PAGE;
                const limit = params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT;
                const queryParams = new URLSearchParams();
                queryParams.append('page', page.toString());
                queryParams.append('limit', limit.toString());
                return {
                    url: `/api/admin/roles?${queryParams.toString()}`,
                };
            },
            providesTags: ['Role'],
        }),

        // get role by id
        getRoleById: builder.query<{ success: boolean; data: Role }, string>({
            query: (id) => `/api/admin/roles/${id}`,
            providesTags: ['Role'],
        }),

        // assign permissions to role api
        assignPermissionsToRole: builder.mutation<
            { success: boolean; data: Role }, 
            { id: string; mode: 'assign' | 'remove' | 'replace'; permission_ids: string[] }
        >({
            query: ({ id, mode, permission_ids }) => ({
                url: `/api/admin/roles/${id}/permissions`,
                method: 'POST',
                body: { mode, permission_ids },
            }),
            invalidatesTags: ['Role'],
        }),

        // update role api
        updateRole: builder.mutation<{ success: boolean; data: Role }, { id: string; name: string; title: string }>({
            query: (body) => ({
                url: `/api/admin/roles/${body.id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Role'],
        }),

        // delete role api
        deleteRole: builder.mutation<{ success: boolean; data: Role }, string>({
            query: (id) => ({
                url: `/api/admin/roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Role'],
        }),

        // get statistics data 
        getStatisticsData: builder.query<{ success: boolean; data: StatisticsData }, void>({
            query: () => '/api/admin/roles/statistics',
            providesTags: ['Role'],
        }),

        // get all permissions
        getPermissions: builder.query<{ success: boolean; data: { permissions: Permission[] } }, void>({
            query: () => '/api/admin/roles/permissions',
            providesTags: ['Role'],
        }),

    }),
});

export const {
    useGetRolesQuery,
    useGetRoleByIdQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useAssignPermissionsToRoleMutation,
    useGetStatisticsDataQuery,
    useGetPermissionsQuery
} = roleManagementApi;

export type { Permission, Role };