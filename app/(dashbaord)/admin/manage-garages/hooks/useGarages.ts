import { useQuery } from "@tanstack/react-query";

export type Garage = {
  id: string;
  garage_name: string;
  email: string;
  phone_number: string;
  address: string | null;
  status: number; // 0 or 1
  created_at: string;
  approved_at: string | null;
  vts_number: string;
  primary_contact: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type GaragesResponseData = {
  garages: Garage[];
  pagination: Pagination;
};

export type GaragesAPIResponse = {
  success: boolean;
  data: GaragesResponseData;
};


interface IParams {
  page: number;
  limit: number;
  status: string;
  search: string;
}

export const QK_GARAGES = "garages_data";

export default function useGarages(params: IParams) {
  return useQuery<GaragesAPIResponse>({
    queryKey: [QK_GARAGES, params],
    queryFn: async () => {
      const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:5000";

      const url = `${endpoint}/api/admin/garage`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }

      return res.json();
    },
  });
}
