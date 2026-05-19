import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/service/axios/axios";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isBlocked: boolean;
  isEmailVerified: boolean;
}

export interface GetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UsersPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface GetAllUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: AdminUser[];
    pagination: UsersPagination;
  };
}

export interface AllUsersData {
  users: AdminUser[];
  pagination: UsersPagination;
}

export const useGetAllUsers = (params: GetAllUsersParams = {}) =>
  useQuery<AllUsersData, Error>({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const response = await axiosInstance.get<GetAllUsersResponse>(
        "/auth/users",
        { params },
      );

      return response.data.data;
    },
  });
