import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SubscriptionPlan } from "../api/admin/garages-management/subscriptionApis";

interface SubscriptionState {
  selectedPlan: SubscriptionPlan | null;
  isCheckoutLoading: boolean;
  lastUpdated: number;
}

const initialState: SubscriptionState = {
  selectedPlan: null,
  isCheckoutLoading: false,
  lastUpdated: Date.now(),
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setSelectedPlan: (
      state,
      action: PayloadAction<SubscriptionPlan | null>
    ) => {
      state.selectedPlan = action.payload;
      state.lastUpdated = Date.now();
    },
    setCheckoutLoading: (state, action: PayloadAction<boolean>) => {
      state.isCheckoutLoading = action.payload;
      state.lastUpdated = Date.now();
    },
    updateSubscriptionStatus: (state) => {
      state.lastUpdated = Date.now();
    },
  },
});

export const { setSelectedPlan, setCheckoutLoading, updateSubscriptionStatus } =
  subscriptionSlice.actions;
export default subscriptionSlice.reducer;
