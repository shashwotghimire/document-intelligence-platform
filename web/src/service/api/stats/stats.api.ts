import axiosInstace from "@/service/axios/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const PROCESSING_REFETCH_INTERVAL_MS = 10000;

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
  fileType: "pdf" | "docx" | "txt" | "csv";
  filePath: string;
  fileUrl: string;
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
  data: {
    documents: StatsTableDocument[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
    hasProcessing: boolean;
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

export const useGetStatsForTable = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();
  const wasProcessingRef = useRef(false);

  const query = useQuery<GetStatsForTableResponse, Error>({
    queryKey: ["stats", "table", page, limit],
    queryFn: async () => {
      const res = (
        await axiosInstace.get<GetStatsForTableResponse>(
          `/uploads/tableStats`,
          {
            params: { page, limit },
          },
        )
      ).data;

      return res;
    },
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.data.hasProcessing;

      return hasProcessing ? PROCESSING_REFETCH_INTERVAL_MS : false;
    },
  });

  const hasProcessing = query.data?.data.hasProcessing ?? false;

  useEffect(() => {
    if (!query.isSuccess) return;

    if (wasProcessingRef.current && !hasProcessing) {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "logs"] });
    }

    wasProcessingRef.current = hasProcessing;
  }, [hasProcessing, query.isSuccess, queryClient]);

  return query;
};
