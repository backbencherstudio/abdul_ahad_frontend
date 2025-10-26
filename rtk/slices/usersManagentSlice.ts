import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PAGINATION_CONFIG } from '../../config/pagination.config';

import type { User, Statistics } from '@/types';

interface UsersState {
    users: User[];
    selectedUser: User | null;
    statistics: Statistics | null;
    filters: {
        search: string;
        type: string;
        approved: boolean | null;
    };
    pagination: {
        currentPage: number;
        itemsPerPage: number;
        totalItems: number;
        totalPages: number;
    };
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    selectedUser: null,
    statistics: null,
    filters: {
        search: '',
        type: '',
        approved: null,
    },
    pagination: {
        currentPage: PAGINATION_CONFIG.DEFAULT_PAGE,
        itemsPerPage: PAGINATION_CONFIG.DEFAULT_LIMIT,
        totalItems: 0,
        totalPages: 1,
    },
    loading: false,
    error: null,
};

const usersManagementSlice = createSlice({
    name: 'usersManagement',
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<User[]>) => {
            state.users = action.payload;
        },
        setSelectedUser: (state, action: PayloadAction<User | null>) => {
            state.selectedUser = action.payload;
        },
        setSearchFilter: (state, action: PayloadAction<string>) => {
            state.filters.search = action.payload;
            state.pagination.currentPage = PAGINATION_CONFIG.DEFAULT_PAGE;
        },
        setTypeFilter: (state, action: PayloadAction<string>) => {
            state.filters.type = action.payload;
            state.pagination.currentPage = PAGINATION_CONFIG.DEFAULT_PAGE;
        },
        setApprovedFilter: (state, action: PayloadAction<boolean | null>) => {
            state.filters.approved = action.payload;
            state.pagination.currentPage = PAGINATION_CONFIG.DEFAULT_PAGE;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.pagination.currentPage = action.payload;
        },
        setItemsPerPage: (state, action: PayloadAction<number>) => {
            state.pagination.itemsPerPage = action.payload;
            state.pagination.currentPage = PAGINATION_CONFIG.DEFAULT_PAGE;
        },
        setPagination: (state, action: PayloadAction<{ totalItems: number; totalPages: number }>) => {
            state.pagination.totalItems = action.payload.totalItems;
            state.pagination.totalPages = action.payload.totalPages;
        },
        setStatistics: (state, action: PayloadAction<Statistics>) => {
            state.statistics = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {
                search: '',
                type: '',
                approved: null,
            };
            state.pagination.currentPage = PAGINATION_CONFIG.DEFAULT_PAGE;
        },
        updateUser: (state, action: PayloadAction<User>) => {
            const index = state.users.findIndex(user => user.id === action.payload.id);
            if (index !== -1) {
                state.users[index] = action.payload;
            }
            if (state.selectedUser?.id === action.payload.id) {
                state.selectedUser = action.payload;
            }
        },
        removeUser: (state, action: PayloadAction<string>) => {
            state.users = state.users.filter(user => user.id !== action.payload);
            if (state.selectedUser?.id === action.payload) {
                state.selectedUser = null;
            }
        },
        // optimistic update helpers (optional use)
        setUserApprovedAt: (state, action: PayloadAction<{ id: string; approved_at: string | null }>) => {
            const user = state.users.find(u => u.id === action.payload.id)
            if (user) user.approved_at = action.payload.approved_at as any
            if (state.selectedUser?.id === action.payload.id && state.selectedUser) {
                state.selectedUser.approved_at = action.payload.approved_at as any
            }
        },
        setUserRoles: (state, action: PayloadAction<{ id: string; roles: any[] }>) => {
            const user = state.users.find(u => u.id === action.payload.id)
            if (user) user.roles = action.payload.roles
            if (state.selectedUser?.id === action.payload.id && state.selectedUser) {
                state.selectedUser.roles = action.payload.roles
            }
        }
    },
});

export const {
    setUsers,
    setSelectedUser,
    setSearchFilter,
    setTypeFilter,
    setApprovedFilter,
    setCurrentPage,
    setItemsPerPage,
    setPagination,
    setStatistics,
    setLoading,
    setError,
    clearFilters,
    updateUser,
    removeUser,
    setUserRoles,
} = usersManagementSlice.actions;

export default usersManagementSlice.reducer;
