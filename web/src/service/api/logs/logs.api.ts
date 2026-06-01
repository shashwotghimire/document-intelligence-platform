import axiosInstance from "@/service/axios/axios";
import { useQuery } from "@tanstack/react-query";

interface Log {
  id: string;
  userId: string;
  action: string;
  data: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    role: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface GetLogsResponse {
  success: boolean;
  message: string;
  data: {
    logs: Log[];
    pagination: Pagination;
  };
}

export type { Log, Pagination };

export const useGetLogs = (page = 1, limit = 10) => {
  return useQuery<{ logs: Log[]; pagination: Pagination }, Error>({
    queryKey: ["admin", "logs", page, limit],
    queryFn: async () => {
      const res = await axiosInstance.get<GetLogsResponse>("/logs", {
        params: { page, limit },
      });
      return res.data.data;
    },
  });
};
