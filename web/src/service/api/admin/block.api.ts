import { useMutation, useQueryClient } from "@tanstack/react-query";

import axiosInstance from "@/service/axios/axios";

export interface BlockUserRequest {
  userId: string;
}

export interface BlockUserResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface UnblockUserRequest {
  userId: string;
}

export interface UnblockUserResponse {
  success: boolean;
  message: string;
  data: null;
}

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<BlockUserResponse, Error, BlockUserRequest>({
    mutationFn: async ({ userId }) => {
      const response = await axiosInstance.patch<BlockUserResponse>(
        `/auth/block/${userId}`,
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<UnblockUserResponse, Error, UnblockUserRequest>({
    mutationFn: async ({ userId }) => {
      const response = await axiosInstance.patch<UnblockUserResponse>(
        `/auth/unblock/${userId}`,
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};
