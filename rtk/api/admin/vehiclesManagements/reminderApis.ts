import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";

// send reminder to drivers /api/admin/notifications/bulk

// {
// 	"receivers":[
// 		{
// 			"receiver_id":"cmi5jaagk0000tz74fky40zc8",
			
// 			"entity_id":"cmiidodib00010avyw9nu0591"
// 		}
// 	],
// 	"message":"This Vehicle's MOT Has Expired"
// }
export const reminderApis = createApi({
    reducerPath: "reminderApis",
    baseQuery,
    tagTypes: ["Reminders"],
    endpoints: (builder) => ({
        sendReminderToDrivers: builder.mutation<any, { receivers: { receiver_id: string; entity_id: string }[]; message: string }>({
            query: (body) => ({
                url: `/api/admin/notifications/bulk`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Reminders"],
        }),
    }),
});

export const { useSendReminderToDriversMutation } = reminderApis;