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

interface StatsTableDocument {
  id: string;
  filename: string;
  fileType: "pdf" | "docx" | "txt";
  filePath: string;
  fileSize: number;
  fileProcessingStatus: "Processing" | "Processed" | "Failed";
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  uploader: {
    name: string;
    role?: string;
  };
}

interface GetStatsForTableResponse {
  success: boolean;
  message: string;
  data: StatsTableDocument[];
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

export const useGetStatsForTable = () => {
  return useQuery<GetStatsForTableResponse, Error>({
    queryKey: ["stats", "table"],
    queryFn: async () => {
      const res = (
        await axiosInstace.get<GetStatsForTableResponse>(`/uploads/tableStats`)
      ).data;

      return res;
    },
  });
};
