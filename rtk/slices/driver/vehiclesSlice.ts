import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

interface Vehicle {
    id: string
    registrationNumber: string
    expiryDate: string
    roadTax: string
    make: string
    model: string
    year: number
    image: string
}

interface VehiclesState {
    isModalOpen: boolean
    isDetailsModalOpen: boolean
    selectedVehicle: Vehicle | null
    imageErrors: Record<string, boolean>
    deleteConfirmOpen: boolean
    vehicleToDelete: string | null
}

const initialState: VehiclesState = {
    isModalOpen: false,
    isDetailsModalOpen: false,
    selectedVehicle: null,
    imageErrors: {},
    deleteConfirmOpen: false,
    vehicleToDelete: null,
};

const vehiclesSlice = createSlice({
    name: "vehicles",
    initialState,
    reducers: {
        // Modal actions
        openAddModal(state) {
            state.isModalOpen = true;
        },
        closeAddModal(state) {
            state.isModalOpen = false;
        },
        openDetailsModal(state, action: PayloadAction<Vehicle>) {
            state.selectedVehicle = action.payload;
            state.isDetailsModalOpen = true;
        },
        closeDetailsModal(state) {
            state.isDetailsModalOpen = false;
            state.selectedVehicle = null;
        },
        
        // Image error handling
        setImageError(state, action: PayloadAction<string>) {
            state.imageErrors[action.payload] = true;
        },
        clearImageError(state, action: PayloadAction<string>) {
            delete state.imageErrors[action.payload];
        },
        clearAllImageErrors(state) {
            state.imageErrors = {};
        },
        
        // Delete confirmation actions
        openDeleteConfirm(state, action: PayloadAction<string>) {
            state.vehicleToDelete = action.payload;
            state.deleteConfirmOpen = true;
        },
        closeDeleteConfirm(state) {
            state.deleteConfirmOpen = false;
            state.vehicleToDelete = null;
        },
        
        // Reset all state
        resetVehiclesState() {
            return initialState;
        },
    },
});

export const {
    openAddModal,
    closeAddModal,
    openDetailsModal,
    closeDetailsModal,
    setImageError,
    clearImageError,
    clearAllImageErrors,
    openDeleteConfirm,
    closeDeleteConfirm,
    resetVehiclesState,
} = vehiclesSlice.actions;

// Selectors
export const selectVehiclesState = (state: RootState) => state.vehicles;
export const selectIsModalOpen = (state: RootState) => state.vehicles.isModalOpen;
export const selectIsDetailsModalOpen = (state: RootState) => state.vehicles.isDetailsModalOpen;
export const selectSelectedVehicle = (state: RootState) => state.vehicles.selectedVehicle;
export const selectImageErrors = (state: RootState) => state.vehicles.imageErrors;
export const selectDeleteConfirmOpen = (state: RootState) => state.vehicles.deleteConfirmOpen;
export const selectVehicleToDelete = (state: RootState) => state.vehicles.vehicleToDelete;

export default vehiclesSlice.reducer;
