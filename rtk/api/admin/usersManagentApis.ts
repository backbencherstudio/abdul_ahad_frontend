import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../baseApi';
import { PAGINATION_CONFIG } from '../../../config/pagination.config';

import type {
    User,
    UsersResponse,
    CreateUserResponse,
    AssignRoleResponse,
    UserDetailsResponse
} from '@/types';

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
            query: (params) => {
                const queryParams = new URLSearchParams();

                // Handle approved status
                if (params.approved === true) {
                    queryParams.append('approved', 'approved');
                } else if (params.approved === false) {
                    queryParams.append('approved', 'false');
                }

                // Handle search query
                if (params.q && params.q.trim()) {
                    queryParams.append('q', params.q);
                }

                // Handle user type filter
                if (params.type && params.type.trim()) {
                    queryParams.append('type', params.type);
                }

                // Add page number (default from config)
                queryParams.append('page', (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString());

                // Add items per page (default from config)
                queryParams.append('limit', (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString());

                return {
                    url: `/api/admin/user?${queryParams.toString()}`,
                };
            },
            providesTags: ['Users'],
        }),

        // get user by id
        getUserById: builder.query<UserDetailsResponse, string>({
            query: (id) => `/api/admin/user/${id}`,
            providesTags: ['Users'],
        }),

        // update user api
        updateUser: builder.mutation<{ success?: boolean; message?: string } | void, { id: string; name?: string; email?: string; phone_number?: string; type?: string }>({
            query: ({ id, ...body }) => ({
                url: `/api/admin/user/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Users'],
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

export const { useCreateUserMutation, useUpdateUserMutation, useGetUsersQuery, useGetUserByIdQuery, useBanUserMutation, useUnbanUserMutation, useAssignRoleToUserMutation, useRemoveRoleFromUserMutation } = usersManagementApi;