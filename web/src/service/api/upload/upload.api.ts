import { useMutation } from "@tanstack/react-query";

import axiosInstance from "@/service/axios/axios";

export interface UploadedDocument {
  id: string;
  filename: string;
  fileType: "pdf" | "docx" | "txt";
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

export const useUploadDocument = () =>
  useMutation<DocumentUploadResponse, Error, DocumentUploadRequest>({
    mutationFn: async ({ file }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post<DocumentUploadResponse>(
        "/uploads",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    },
  });
