import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../baseApi';
import { PAGINATION_CONFIG } from '../../../config/pagination.config';

// Types
interface User {
    id: string;
    name: string;
    email: string;
    phone_number: string | null;
    address: string | null;
    type: string;
    approved_at: string;
    created_at: string;
    updated_at: string;
    avatar_url: string | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface Statistics {
    total_users: number;
    total_banned_users: number;
    total_admin_users: number;
    total_garage_users: number;
    total_driver_users: number;
    total_approved_users: number;
}

interface UsersResponse {
    success: boolean;
    data: User[];
    pagination: Pagination;
    statistics: Statistics;
}

// Detailed response for user creation
interface CreateUserResponse {
    success: boolean;
    message?: string;
    data: {
        id: string;
        email: string;
        name: string;
        type: string;
        email_verified_at?: string | null;
        approved_at?: string | null;
        billing_id?: string | null;
        roles: Array<{ id: string; title?: string; name: string; created_at?: string }>;
        created_at?: string;
        roles_added?: number;
        roles_removed?: number;
        assignment_strategy?: string;
        intelligent_reasoning?: string;
        actions_performed?: string[];
    };
}

// Detailed response for role assignment
interface AssignRoleResponse {
    success: boolean;
    message?: string;
    data: {
        id: string;
        name: string;
        email: string;
        type: string;
        roles: Array<{
            id: string;
            title?: string;
            name: string;
            created_at?: string;
        }>;
        roles_added?: number;
        roles_removed?: number;
        role_changes?: {
            added?: Array<{ id: string; name: string; title?: string }>;
            removed?: Array<{ id: string; name: string; title?: string }>;
        };
        assignment_strategy?: string;
        intelligent_reasoning?: string;
    };
}

// get all users 
export const usersManagementApi = createApi({
    reducerPath: 'usersManagemenApi',
    baseQuery,
    tagTypes: ['Users'],
    endpoints: (builder) => ({

        // create user api
        createUser: builder.mutation<CreateUserResponse, { email: string; password: string; name: string; type: string; role_ids: string[] }>({
            query: (body) => ({
                url: `/api/admin/user`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Users'],
        }),


        // get all users
        getUsers: builder.query<UsersResponse, { approved?: boolean | null; q?: string; type?: string; page?: number; limit?: number }>({
            query: ({ approved, q = '', type = '', page = PAGINATION_CONFIG.DEFAULT_PAGE, limit = PAGINATION_CONFIG.DEFAULT_LIMIT }) => {
                const params = new URLSearchParams();

                if (approved === true) {
                    params.append('approved', 'approved');
                } else if (approved === false) {
                    params.append('approved', 'false');
                }

                if (q) params.append('q', q);
                if (type) params.append('type', type);
                params.append('page', page.toString());
                params.append('limit', limit.toString());

                return {
                    url: `/api/admin/user?${params.toString()}`,
                };
            },
            providesTags: ['Users'],
        }),

        // get user by id
        getUserById: builder.query<User, string>({
            query: (id) => `/api/admin/user/${id}`,
            providesTags: ['Users'],
        }),


        // ban user api
        banUser: builder.mutation<{ success?: boolean; message?: string } | void, { id: string; reason?: string }>({
            query: ({ id, reason = '' }) => ({
                url: `/api/admin/user/${id}/ban`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['Users'],
        }),

        // unban user api
        unbanUser: builder.mutation<{ success?: boolean; message?: string } | void, string>({
            query: (id) => ({
                url: `/api/admin/user/${id}/unban`,
                method: 'POST',
            }),
            invalidatesTags: ['Users'],
        }),


        // assign role to user api
        assignRoleToUser: builder.mutation<AssignRoleResponse, { id: string; role_ids: string[] }>({
            query: ({ id, role_ids }) => ({
                url: `/api/admin/user/${id}/roles`,
                method: 'POST',
                body: { role_ids },
            }),
            invalidatesTags: ['Users'],
        }),

        // remove role from user api
        removeRoleFromUser: builder.mutation<{ success?: boolean; message?: string } | void, { id: string; role_id: string }>({
            query: ({ id, role_id }) => ({
                url: `/api/admin/user/${id}/roles/${role_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],
        }),
    }),

});

export const { useCreateUserMutation, useGetUsersQuery, useGetUserByIdQuery, useBanUserMutation, useUnbanUserMutation, useAssignRoleToUserMutation, useRemoveRoleFromUserMutation } = usersManagementApi;