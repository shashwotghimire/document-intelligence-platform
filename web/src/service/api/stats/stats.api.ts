import axiosInstace from "@/service/axios/axios";
import { useQuery } from "@tanstack/react-query";

interface GetStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalDocuments: number;
    totalSize: number;
    totalChunks: number;
    totalUsers: number;
  };
}
export const useGetStats = () => {
  return useQuery<GetStatsResponse, Error>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = (await axiosInstace.get<GetStatsResponse>(`/uploads/stats`))
        .data;

      return res;
    },
  });
};
