import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PAGINATION_CONFIG } from "../../../config/pagination.config";

interface BookingState {
  selectedBooking: any | null;
  filters: {
    search: string;
    status: string;
    startdate: string | null;
    enddate: string | null;
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

const initialState: BookingState = {
  selectedBooking: null,
  filters: {
    search: "",
    status: "",
    startdate: null,
    enddate: null,
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

const bookingManagementSlice = createSlice({
  name: "bookingManagement",
  initialState,
  reducers: {
    setSelectedBooking: (state, action: PayloadAction<any | null>) => {
      state.selectedBooking = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = PAGINATION_CONFIG.DEFAULT_PAGE;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.pagination.currentPage = PAGINATION_CONFIG.DEFAULT_PAGE;
    },
    setStartDateFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.startdate = action.payload;
      state.pagination.currentPage = PAGINATION_CONFIG.DEFAULT_PAGE;
    },
    setEndDateFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.enddate = action.payload;
      state.pagination.currentPage = PAGINATION_CONFIG.DEFAULT_PAGE;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = PAGINATION_CONFIG.DEFAULT_PAGE;
    },
    setPagination: (
      state,
      action: PayloadAction<{ totalItems: number; totalPages: number }>
    ) => {
      state.pagination.totalItems = action.payload.totalItems;
      state.pagination.totalPages = action.payload.totalPages;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        status: "",
        startdate: null,
        enddate: null,
      };
      state.pagination.currentPage = PAGINATION_CONFIG.DEFAULT_PAGE;
    },
  },
});

export const {
  setSelectedBooking,
  setSearchFilter,
  setStatusFilter,
  setStartDateFilter,
  setEndDateFilter,
  setCurrentPage,
  setItemsPerPage,
  setPagination,
  setLoading,
  setError,
  clearFilters,
} = bookingManagementSlice.actions;

export default bookingManagementSlice.reducer;
