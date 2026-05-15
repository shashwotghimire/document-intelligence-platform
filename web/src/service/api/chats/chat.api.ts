import axiosInstance from "@/service/axios/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Chat {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatsPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface GetAllUserChatsResponse {
  success: boolean;
  message: string;
  data: {
    chats: Chat[];
    pagination: ChatsPagination;
  };
}

interface AllUserChatsData {
  chats: Chat[];
  pagination: ChatsPagination;
}

interface CreateChatResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    userId: string;
    updatedAt: string;
    createdAt: string;
  };
}

interface CreateChatData {
  id: string;
  title: string;
  userId: string;
  updatedAt: string;
  createdAt: string;
}

interface CreateChatRequest {
  title?: string;
}
export const useGetAllChats = () => {
  return useQuery<AllUserChatsData, Error>({
    queryKey: ["user", "chats"],
    queryFn: async () => {
      const res = (await axiosInstance.get<GetAllUserChatsResponse>(`/chats`))
        .data;
      return res.data;
    },
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateChatData, Error>({
    mutationFn: async () => {
      const res = (await axiosInstance.post<CreateChatResponse>("/chats")).data;
      return res.data;
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["user", "chats"] });
    },
  });
};
