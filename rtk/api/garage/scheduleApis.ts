import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface DailyHourConfig {
  is_closed?: boolean;
  intervals?: Array<{
    start_time: string;
    end_time: string;
  }>;
  slot_duration?: number;
}

export interface BreakRestriction {
  type: "BREAK";
  day_of_week: number[];
  start_time: string;
  end_time: string;
  description: string;
}

export interface ScheduleRequest {
  daily_hours: Record<string, DailyHourConfig>;
  restrictions: BreakRestriction[];
}

export interface ScheduleResponseData {
  id: string;
  created_at: string;
  updated_at: string;
  garage_id: string;
  start_time: string | null;
  end_time: string | null;
  slot_duration: number;
  restrictions: BreakRestriction[];
  daily_hours: Record<string, DailyHourConfig>;
  is_active: boolean;
}

export interface ScheduleApiResponse {
  success: boolean;
  message: string;
  data: ScheduleResponseData;
  cleanup?: {
    deleted_unbooked_future_slots: number;
    note: string;
  };
}

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

export interface BulkSlotRequest {
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  action: "BLOCK" | "UNBLOCK";
  reason?: string;
}

export interface Holiday {
  type: string;
  month: number;
  day: number;
  description: string;
  is_recurring: boolean;
  date?: string; // For display purposes
  id?: string; // For local state management (temp IDs for new holidays)
}

export interface AddHolidayRequest {
  type: string;
  month: number;
  day: number;
  description: string;
  is_recurring: boolean;
}

export const scheduleApi = createApi({
  reducerPath: "scheduleApi",
  baseQuery,
  tagTypes: ["Schedule", "Slots", "Calendar"],
  endpoints: (builder) => ({
    getSchedule: builder.query<ScheduleApiResponse, void>({
      query: () => "/api/garage-dashboard/schedule",
      providesTags: ["Schedule"],
    }),

    createSchedule: builder.mutation<ScheduleApiResponse, ScheduleRequest>({
      query: (schedule) => ({
        url: "/api/garage-dashboard/schedule",
        method: "POST",
        body: schedule,
      }),
      invalidatesTags: ["Schedule", "Calendar"],
    }),

    getScheduleList: builder.query<ScheduleApiResponse[], void>({
      query: () => "/api/garage-dashboard/schedule",
      providesTags: ["Schedule"],
      keepUnusedDataFor: 0,
    }),

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
      keepUnusedDataFor: 0,
    }),

    getSlotDetails: builder.query<ApiResponse, string>({
      query: (date) => `/api/garage-dashboard/schedule/slots/view?date=${date}`,
      providesTags: ["Slots"],
      keepUnusedDataFor: 0,
    }),

    bulkSlotOperation: builder.mutation<ApiResponse, BulkSlotRequest>({
      query: (request) => ({
        url: "/api/garage-dashboard/schedule/modify",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["Slots", "Calendar"],
    }),
    // /api/garage-dashboard/schedule/holiday add holiday
    addHoliday: builder.mutation<ApiResponse, AddHolidayRequest>({
      query: (request) => ({
        url: "/api/garage-dashboard/schedule/holiday",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["Schedule", "Calendar"],
    }),
    // get holidays /api/garage-dashboard/schedule/holidays
    getHolidays: builder.query<ApiResponse<Holiday[]>, void>({
      query: () => "/api/garage-dashboard/schedule/holidays",
      providesTags: ["Schedule"],
      keepUnusedDataFor: 0,
    }),
    // delete holiday by month and day
    deleteHoliday: builder.mutation<
      ApiResponse,
      { month: number; day: number }
    >({
      query: (body) => ({
        url: `/api/garage-dashboard/schedule/holiday`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Schedule", "Calendar"],
    }),
  }),
});

export const {
  useGetScheduleQuery,
  useCreateScheduleMutation,
  useGetScheduleListQuery,
  useGetCalendarViewQuery,
  useGetSlotDetailsQuery,
  useBulkSlotOperationMutation,
  useAddHolidayMutation,
  useGetHolidaysQuery,
  useDeleteHolidayMutation,
} = scheduleApi;
