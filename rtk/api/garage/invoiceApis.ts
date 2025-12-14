import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// get all invoices data /api/garage-dashboard/invoices  query params page, limit, search
export interface InvoicesResponse {
    success: boolean;
    message: string;
    data: Invoice[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface Invoice {
    id: string;
    invoice_number: string;
    garage_id: string;
    membership_period: string;
    issue_date: string;
    due_date: string;
    amount: string;
    status: "PAID" | "PENDING" | "OVERDUE";
    created_at: string;
    pdf_url: string;
}

export interface InvoiceResponse {
    success: boolean;
    message: string;
    data: Invoice;
}


export const invoicesApi = createApi({
    reducerPath: "invoicesApi",
    baseQuery,
    tagTypes: ["Invoices"],
    endpoints: (builder) => ({
        getInvoices: builder.query<InvoicesResponse, { page?: number; limit?: number; search?: string }>({
            query: ({ page = 1, limit = 10, search = "" }) => {
                const params = new URLSearchParams();
                if (page) params.append("page", page.toString());
                if (limit) params.append("limit", limit.toString());
                if (search) params.append("search", search);
                return `/api/garage-dashboard/invoices?${params.toString()}`;
            },
            providesTags: ["Invoices"],
            keepUnusedDataFor: 0, 
        }),
        // get invoice by id api/garage-dashboard/invoices/cmj5b8qyy0007kgq4h2i45equ
        getInvoiceById: builder.query<InvoiceResponse, string>({
            query: (id) => `/api/garage-dashboard/invoices/${id}`,
            providesTags: ["Invoices"],
            keepUnusedDataFor: 0,
        }),

        // /api/garage-dashboard/invoices/cmj5b8qyy0007kgq4h2i45equ/download
        downloadInvoice: builder.mutation<{
            success: boolean;
            message: string;
            data: {
                pdf_url: string;
                invoice_id: string;
                invoice_number: string;
            };
        }, string>({
            query: (id) => ({
                url: `/api/garage-dashboard/invoices/${id}/download`,
                method: "POST",
            }),
            invalidatesTags: ["Invoices"],
        }),
    }),
});

export const { useGetInvoicesQuery, useGetInvoiceByIdQuery, useDownloadInvoiceMutation } = invoicesApi;