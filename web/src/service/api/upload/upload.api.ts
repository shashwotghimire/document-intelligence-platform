import { useMutation, useQueryClient } from "@tanstack/react-query";

import axiosInstance from "@/service/axios/axios";

export interface UploadedDocument {
  id: string;
  filename: string;
  fileType: "pdf" | "docx" | "txt" | "csv";
  filePath: string;
  fileSize: number;
  uploadedBy: string;
  fileProcessingStatus: "Processing" | "Processed" | "Failed";
  updatedAt: string;
  createdAt: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data: {
    file: UploadedDocument;
  };
}

export interface DocumentUploadRequest {
  file: File;
}

export interface DeleteDocumentRequest {
  documentId: string;
}

export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
  data: null;
}

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<DocumentUploadResponse, Error, DocumentUploadRequest>({
    mutationFn: async ({ file }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post<DocumentUploadResponse>(
        "/uploads",
        formData,
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["stats", "table"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "logs"] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteDocumentResponse, Error, DeleteDocumentRequest>({
    mutationFn: async ({ documentId }) => {
      const response = await axiosInstance.delete<DeleteDocumentResponse>(
        `/uploads/${documentId}`,
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["stats", "table"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "logs"] });
    },
  });
};
