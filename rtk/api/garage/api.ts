
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

/**
 * API Response interface for consistent response handling
 * Note: backend sometimes returns `message` as an object, so we allow that here
 * and normalize it before exposing to the UI via ApiClient.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string | {
    message?: string;
    error?: string;
    statusCode?: number;
    [key: string]: unknown;
  };
  data?: T;
  error?: string;
}

/**
 * Normalize API `message` field to a plain string
 */
const normalizeApiMessage = (
  raw: ApiResponse["message"],
  fallback: string
): string => {
  if (raw == null) return fallback;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && "message" in raw && typeof raw.message === "string") {
    return raw.message;
  }
  try {
    return JSON.stringify(raw);
  } catch {
    return fallback;
  }
};

/**
 * Per-day working hours / closure details returned by backend.
 * Note: this is currently only returned by GET schedule, not required for create/update.
 */
export interface DailyHourConfig {
  is_closed?: boolean;
  intervals?: Array<{
    start_time: string;
    end_time: string;
  }>;
  slot_duration?: number;
}

/**
 * Schedule configuration interface for default routine setup
 *
 * For POST/PUT we only send the core fields (start/end/slot_duration/restrictions),
 * but GET may also return additional metadata like `daily_hours` and `is_active`.
 */
export interface ScheduleConfig {
  start_time: string;
  end_time: string;
  slot_duration: number;
  restrictions: Array<{
    type: "BREAK" | "HOLIDAY";
    start_time?: string;
    end_time?: string;
    description: string;
    is_recurring?: boolean;
    day_of_week: number | number[];
  }>;
  // Optional fields only present on read responses
  daily_hours?: Record<string, DailyHourConfig>;
  is_active?: boolean;
}

/**
 * Calendar view response interface
 */
export interface CalendarViewData {
  current_week: {
    week_number: number;
    start_date: string;
    end_date: string;
  };
  week_schedule: {
    days: Array<{
      date: string;
      day_name: string;
      is_today: boolean;
      is_holiday: boolean;
      start_time?: string;
      end_time?: string;
      breaks: Array<{
        start_time: string;
        end_time: string;
        description: string;
      }>;
      description?: string;
    }>;
  };
  month_holidays: Array<{
    date: string;
    description: string;
    type: string;
  }>;
}

/**
 * Slot modification interfaces
 */
export interface SlotModifyRequest {
  date: string;
  current_time: string;
  new_start_time: string;
  new_end_time: string;
  reason?: string;
  overlap?: boolean;
}

export interface BulkSlotRequest {
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  action: "BLOCK" | "UNBLOCK";
  reason?: string;
}

/**
 * RTK Query API for Garage Availability
 */
export const garageAvailabilityApi = createApi({
  reducerPath: "garageAvailabilityApi",
  baseQuery,
  tagTypes: ["Schedule", "Slots", "Calendar"],
  endpoints: (builder) => ({
    // Get current garage schedule configuration
    getSchedule: builder.query<ApiResponse, void>({
      query: () => "/api/garage-dashboard/schedule",
      providesTags: ["Schedule"],
    }),

    // Configure default schedule routine
    createSchedule: builder.mutation<ApiResponse, ScheduleConfig>({
      query: (config) => ({
        url: "/api/garage-dashboard/schedule",
        method: "POST",
        body: config,
      }),
      invalidatesTags: ["Schedule", "Calendar"],
    }),

    // Update existing schedule configuration
    updateSchedule: builder.mutation<ApiResponse, ScheduleConfig>({
      query: (config) => ({
        url: "/api/garage-dashboard/schedule",
        method: "PUT",
        body: config,
      }),
      invalidatesTags: ["Schedule", "Calendar"],
    }),

    // Get comprehensive calendar view data
    getCalendarView: builder.query<
      ApiResponse<CalendarViewData>,
      { year: number; month: number; weekNumber?: number }
    >({
      query: ({ year, month, weekNumber }) => {
        const params = new URLSearchParams({
          year: year.toString(),
          month: month.toString(),
        });
        if (weekNumber !== undefined && weekNumber !== null) {
          params.append("week_number", weekNumber.toString());
        }
        return `/api/garage-dashboard/schedule/calendar-view?${params}`;
      },
      providesTags: ["Calendar"],
    }),

    // Modify specific slot time
    modifySlotTime: builder.mutation<ApiResponse, SlotModifyRequest>({
      query: (request) => ({
        url: "/api/garage-dashboard/schedule/slots/time",
        method: "PATCH",
        body: request,
      }),
      invalidatesTags: ["Slots", "Calendar"],
    }),

    // Delete specific slot by ID
    deleteSlot: builder.mutation<ApiResponse, string>({
      query: (slotId) => ({
        url: `/api/garage-dashboard/schedule/slots/${slotId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Slots", "Calendar"],
    }),

    // Remove all manual slots for a specific date
    removeAllManualSlots: builder.mutation<ApiResponse, string>({
      query: (date) => ({
        url: `/api/garage-dashboard/schedule/slots/manual?date=${date}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Slots", "Calendar"],
    }),

    // Get slot details for a specific date
    getSlotDetails: builder.query<ApiResponse, string>({
      query: (date) => `/api/garage-dashboard/schedule/slots/view?date=${date}`,
      providesTags: ["Slots"],
    }),

    // Bulk slot operations (block, unblock)
    bulkSlotOperation: builder.mutation<ApiResponse, BulkSlotRequest>({
      query: (request) => ({
        url: "/api/garage-dashboard/schedule/modify",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["Slots", "Calendar"],
    }),
  }),
});

// Export hooks
export const {
  useGetScheduleQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useGetCalendarViewQuery,
  useModifySlotTimeMutation,
  useDeleteSlotMutation,
  useRemoveAllManualSlotsMutation,
  useGetSlotDetailsQuery,
  useBulkSlotOperationMutation,
} = garageAvailabilityApi;

/**
 * API Client wrapper for backward compatibility
 * Uses RTK Query hooks internally via store dispatch
 */
class ApiClient {
  private store: any;

  constructor() {
    // Store will be set from Redux store
    this.store = null;
  }

  setStore(store: any) {
    this.store = store;
  }

  /**
   * Format date to API-expected format (YYYY-MM-DD)
   */
  formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  /**
   * Format time to API-expected format (HH:MM)
   */
  formatTime(time: string): string {
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  }

  /**
   * Parse API time to display format
   */
  parseTimeToDisplay(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`;
  }

  // Async methods that use RTK Query
  async getSchedule(): Promise<ApiResponse> {
    if (!this.store) {
      throw new Error("Store not initialized. Call setStore() first.");
    }
    const result = await this.store.dispatch(
      garageAvailabilityApi.endpoints.getSchedule.initiate(undefined)
    );
    if ("error" in result && result.error) {
      const error = result.error as any;
      throw new Error(error.data?.message || error.message || "Failed to get schedule");
    }
    const data = (result.data as ApiResponse) || { success: false, message: "No data returned" };
    if (data.message && typeof data.message !== "string") {
      data.message = normalizeApiMessage(data.message, "Operation failed");
    }
    return data;
  }

  async createSchedule(config: ScheduleConfig): Promise<ApiResponse> {
    if (!this.store) {
      throw new Error("Store not initialized. Call setStore() first.");
    }
    const result = await this.store.dispatch(
      garageAvailabilityApi.endpoints.createSchedule.initiate(config)
    );
    if ("error" in result && result.error) {
      const error = result.error as any;
      throw new Error(error.data?.message || error.message || "Failed to create schedule");
    }
    const data = (result.data as ApiResponse) || { success: false, message: "No data returned" };
    if (data.message && typeof data.message !== "string") {
      data.message = normalizeApiMessage(data.message, "Failed to create schedule");
    }
    return data;
  }

  async updateSchedule(config: ScheduleConfig): Promise<ApiResponse> {
    if (!this.store) {
      throw new Error("Store not initialized. Call setStore() first.");
    }
    const result = await this.store.dispatch(
      garageAvailabilityApi.endpoints.updateSchedule.initiate(config)
    );
    if ("error" in result && result.error) {
      const error = result.error as any;
      throw new Error(error.data?.message || error.message || "Failed to update schedule");
    }
    const data = (result.data as ApiResponse) || { success: false, message: "No data returned" };
    if (data.message && typeof data.message !== "string") {
      data.message = normalizeApiMessage(data.message, "Failed to update schedule");
    }
    return data;
  }

  async getCalendarView(
    year: number,
    month: number,
    weekNumber?: number
  ): Promise<ApiResponse<CalendarViewData>> {
    if (!this.store) {
      throw new Error("Store not initialized. Call setStore() first.");
    }
    const result = await this.store.dispatch(
      garageAvailabilityApi.endpoints.getCalendarView.initiate({
        year,
        month,
        weekNumber,
      })
    );
    if ("error" in result && result.error) {
      const error = result.error as any;
      throw new Error(error.data?.message || error.message || "Failed to get calendar view");
    }
    const data = (result.data as ApiResponse<CalendarViewData>) || { success: false, message: "No data returned" };
    if (data.message && typeof data.message !== "string") {
      data.message = normalizeApiMessage(data.message, "Failed to get calendar view");
    }
    return data;
  }

  async modifySlotTime(request: SlotModifyRequest): Promise<ApiResponse> {
    if (!this.store) {
      throw new Error("Store not initialized. Call setStore() first.");
    }
    const result = await this.store.dispatch(
      garageAvailabilityApi.endpoints.modifySlotTime.initiate(request)
    );
    if ("error" in result && result.error) {
      const error = result.error as any;
      throw new Error(error.data?.message || error.message || "Failed to modify slot time");
    }
    const data = (result.data as ApiResponse) || { success: false, message: "No data returned" };
    if (data.message && typeof data.message !== "string") {
      data.message = normalizeApiMessage(data.message, "Failed to modify slot time");
    }
    return data;
  }

  async deleteSlot(slotId: string): Promise<ApiResponse> {
    if (!this.store) {
      throw new Error("Store not initialized. Call setStore() first.");
    }
    const result = await this.store.dispatch(
      garageAvailabilityApi.endpoints.deleteSlot.initiate(slotId)
    );
    if ("error" in result && result.error) {
      const error = result.error as any;
      throw new Error(error.data?.message || error.message || "Failed to delete slot");
    }
    const data = (result.data as ApiResponse) || { success: false, message: "No data returned" };
    if (data.message && typeof data.message !== "string") {
      data.message = normalizeApiMessage(data.message, "Failed to delete slot");
    }
    return data;
  }

  async removeAllManualSlots(date: string): Promise<ApiResponse> {
    if (!this.store) {
      throw new Error("Store not initialized. Call setStore() first.");
    }
    const result = await this.store.dispatch(
      garageAvailabilityApi.endpoints.removeAllManualSlots.initiate(date)
    );
    if ("error" in result && result.error) {
      const error = result.error as any;
      throw new Error(error.data?.message || error.message || "Failed to remove manual slots");
    }
    const data = (result.data as ApiResponse) || { success: false, message: "No data returned" };
    if (data.message && typeof data.message !== "string") {
      data.message = normalizeApiMessage(data.message, "Failed to remove manual slots");
    }
    return data;
  }

  async getSlotDetails(date: string): Promise<ApiResponse> {
    if (!this.store) {
      throw new Error("Store not initialized. Call setStore() first.");
    }
    const result = await this.store.dispatch(
      garageAvailabilityApi.endpoints.getSlotDetails.initiate(date)
    );
    if ("error" in result && result.error) {
      const error = result.error as any;
      throw new Error(error.data?.message || error.message || "Failed to get slot details");
    }
    const data = (result.data as ApiResponse) || { success: false, message: "No data returned" };
    if (data.message && typeof data.message !== "string") {
      data.message = normalizeApiMessage(data.message, "Failed to get slot details");
    }
    return data;
  }

  async bulkSlotOperation(
    request: BulkSlotRequest
  ): Promise<ApiResponse> {
    if (!this.store) {
      throw new Error("Store not initialized. Call setStore() first.");
    }
    const result = await this.store.dispatch(
      garageAvailabilityApi.endpoints.bulkSlotOperation.initiate(request)
    );
    if ("error" in result && result.error) {
      const error = result.error as any;
      throw new Error(error.data?.message || error.message || "Failed to perform bulk operation");
    }
    const data = (result.data as ApiResponse) || { success: false, message: "No data returned" };
    if (data.message && typeof data.message !== "string") {
      data.message = normalizeApiMessage(data.message, "Failed to perform bulk operation");
    }
    return data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
