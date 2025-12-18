import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import type { PricingResponsePayload } from "../../api/garage/pricingApis";

export interface PricingServiceState {
  id?: string | null;
  name: string;
  price: string;
}

export interface AdditionalServiceState {
  id?: string | null;
  name: string;
  price?: string | null;
}

interface PricingState {
  mot: PricingServiceState;
  retest: PricingServiceState;
  additionals: AdditionalServiceState[];
  formVersion: number;
}

const initialServiceState: PricingServiceState = {
  name: "",
  price: "",
};

const initialState: PricingState = {
  mot: { ...initialServiceState, name: "MOT Test" },
  retest: { ...initialServiceState, name: "MOT Retest" },
  additionals: [],
  formVersion: 0,
};

const pricingSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {
    setMot(state, action: PayloadAction<Partial<PricingServiceState>>) {
      state.mot = { ...state.mot, ...action.payload };
    },
    setRetest(state, action: PayloadAction<Partial<PricingServiceState>>) {
      state.retest = { ...state.retest, ...action.payload };
    },
    setAdditionals(state, action: PayloadAction<AdditionalServiceState[]>) {
      state.additionals = action.payload;
    },
    resetPricing() {
      return initialState;
    },
    setPricingFromResponse(state, action: PayloadAction<PricingResponsePayload>) {
      const { mot, retest, additionals } = action.payload;
      
      // Handle mot with null/undefined checks
      if (mot) {
        state.mot = {
          id: mot.id ?? null,
          name: mot.name || "MOT Test",
          price: mot.price ? String(mot.price) : "",
        };
      }
      
      // Handle retest with null/undefined checks
      if (retest) {
        state.retest = {
          id: retest.id ?? null,
          name: retest.name || "MOT Retest",
          price: retest.price ? String(retest.price) : "",
        };
      }
      
      // Handle additionals with null/undefined checks
      if (additionals && Array.isArray(additionals)) {
        state.additionals = additionals.map((service) => ({
          id: service?.id ?? null,
          name: service?.name || "",
          price: service?.price ? String(service.price) : "",
        }));
      } else {
        state.additionals = [];
      }
      
      state.formVersion += 1;
    },
  },
});

export const {
  setMot,
  setRetest,
  setAdditionals,
  resetPricing,
  setPricingFromResponse,
} = pricingSlice.actions;

export const selectPricing = (state: RootState) => state.pricing;

export default pricingSlice.reducer;
