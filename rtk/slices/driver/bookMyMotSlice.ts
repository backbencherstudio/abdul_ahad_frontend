import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

// Vehicle interface matching API response
export interface VehicleData {
    registration_number: string;
    make: string;
    model: string;
    color: string;
    fuel_type: string;
    mot_expiry_date: string;
    exists_in_account: boolean;
    vehicle_id: string;
}

// Garage interface matching API response
export interface GarageData {
    id: string;
    garage_name: string;
    address: string;
    postcode: string;
    vts_number: string;
    primary_contact: string;
    phone_number: string;
}

// Search response interface
export interface SearchResponse {
    vehicle: VehicleData;
    garages: GarageData[];
    total_count: number;
    search_postcode: string;
}

interface BookMyMotState {
    vehicle: VehicleData | null;
    garages: GarageData[];
    totalCount: number;
    searchPostcode: string | null;
    isLoading: boolean;
    error: string | null;
    searchParams: {
        registrationNumber: string;
        postcode: string;
    } | null;
    selectedSlot: {
        slot_id: string;
        garage_id: string;
        vehicle_id: string;
        date: string;
        start_time: string;
        end_time: string;
    } | null;
    myBookings: {
        bookings: any[];
        pagination: {
            total_count: number;
            total_pages: number;
            current_page: number;
            limit: number;
            has_next: boolean;
            has_prev: boolean;
        } | null;
    } | null;
}

const initialState: BookMyMotState = {
    vehicle: null,
    garages: [],
    totalCount: 0,
    searchPostcode: null,
    isLoading: false,
    error: null,
    searchParams: null,
    selectedSlot: null,
    myBookings: null,
};

const bookMyMotSlice = createSlice({
    name: "bookMyMot",
    initialState,
    reducers: {
        // Set search results
        setSearchResults(state, action: PayloadAction<SearchResponse>) {
            state.vehicle = action.payload.vehicle;
            state.garages = action.payload.garages;
            state.totalCount = action.payload.total_count;
            state.searchPostcode = action.payload.search_postcode;
            state.error = null;
        },
        // Set loading state
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        // Set error
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        // Set search parameters
        setSearchParams(
            state,
            action: PayloadAction<{ registrationNumber: string; postcode: string }>
        ) {
            state.searchParams = action.payload;
        },
        // Clear search results
        clearSearchResults(state) {
            state.vehicle = null;
            state.garages = [];
            state.totalCount = 0;
            state.searchPostcode = null;
            state.error = null;
            state.searchParams = null;
        },
        // Set selected slot
        setSelectedSlot(
            state,
            action: PayloadAction<{
                slot_id: string;
                garage_id: string;
                vehicle_id: string;
                date: string;
                start_time: string;
                end_time: string;
            } | null>
        ) {
            state.selectedSlot = action.payload;
        },
        // Set my bookings
        setMyBookings(
            state,
            action: PayloadAction<{
                bookings: any[];
                pagination: {
                    total_count: number;
                    total_pages: number;
                    current_page: number;
                    limit: number;
                    has_next: boolean;
                    has_prev: boolean;
                } | null;
            } | null>
        ) {
            state.myBookings = action.payload;
        },
        // Reset all state
        resetBookMyMotState() {
            return initialState;
        },
    },
});

export const {
    setSearchResults,
    setLoading,
    setError,
    setSearchParams,
    clearSearchResults,
    setSelectedSlot,
    setMyBookings,
    resetBookMyMotState,
} = bookMyMotSlice.actions;

// Selectors
export const selectVehicle = (state: RootState) => state.bookMyMot.vehicle;
export const selectGarages = (state: RootState) => state.bookMyMot.garages;
export const selectTotalCount = (state: RootState) => state.bookMyMot.totalCount;
export const selectSearchPostcode = (state: RootState) => state.bookMyMot.searchPostcode;
export const selectIsLoading = (state: RootState) => state.bookMyMot.isLoading;
export const selectError = (state: RootState) => state.bookMyMot.error;
export const selectSearchParams = (state: RootState) => state.bookMyMot.searchParams;
export const selectSelectedSlot = (state: RootState) => state.bookMyMot.selectedSlot;
export const selectMyBookings = (state: RootState) => state.bookMyMot.myBookings;
export const selectBookMyMotState = (state: RootState) => state.bookMyMot;

export default bookMyMotSlice.reducer;
