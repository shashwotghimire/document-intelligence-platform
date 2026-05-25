import axiosInstance from "@/service/axios/axios";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

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

export interface CreateChatRequest {
  title?: string;
}

export const useGetAllChats = () => {
  return useInfiniteQuery<
    AllUserChatsData,
    Error,
    InfiniteData<AllUserChatsData>
  >({
    queryKey: ["user", "chats"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = (
        await axiosInstance.get<GetAllUserChatsResponse>(`/chats`, {
          params: {
            page: pageParam,
            limit: 20,
          },
        })
      ).data;
      return res.data;
    },
    getNextPageParam: (lastPage: AllUserChatsData) => {
      const { page, totalPages } = lastPage.pagination;
      if (lastPage.pagination.page < totalPages) {
        return page + 1;
      }
      return undefined;
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
