import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import axiosInstance from "@/service/axios/axios";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isBlocked: boolean;
  isEmailVerified: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthenticatedUser;
    token: string;
  };
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: AuthenticatedUser;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    isEmailVerified: boolean;
  };
}

export const useRegister = () =>
  useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: async (data) => {
      const response = await axiosInstance.post<RegisterResponse>(
        "/auth/register",
        data,
      );

      return response.data;
    },
  });

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (data) => {
      const response = await axiosInstance.post<LoginResponse>(
        "/auth/login",
        data,
      );

      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.data.token);
      navigate(data.data.user.role === "admin" ? "/admin" : "/chat");
    },
  });
};

export const useMe = (enabled = true) =>
  useQuery<MeResponse, Error>({
    enabled,
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await axiosInstance.get<MeResponse>("/auth/me");

      return response.data;
    },
  });

export const useVerifyEmail = () =>
  useMutation<VerifyEmailResponse, Error, VerifyEmailRequest>({
    mutationFn: async ({ token }) => {
      const response = await axiosInstance.get<VerifyEmailResponse>(
        "/auth/verify",
        {
          params: { token },
        },
      );

      return response.data;
    },
  });
