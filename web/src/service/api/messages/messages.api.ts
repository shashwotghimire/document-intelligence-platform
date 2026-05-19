import axiosInstance from "@/service/axios/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface GetAllMessagesData {
  id: string;
  chatId: string;
  content: string;
  messageRole: "ai" | "user";
  createdAt: string;
  updatedAt: string;
}
interface GetAllMessagesResponse {
  success: boolean;
  message: string;
  data: {
    messages: GetAllMessagesData[];
  };
}

interface SendMessageRequest {
  content: string;
}

interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    userMessage: GetAllMessagesData;
    aiMessage: GetAllMessagesData;
  };
}
export const useGetMessages = (chatId?: string) => {
  return useQuery<GetAllMessagesData[], Error>({
    queryKey: ["user", "messages", chatId],
    queryFn: async () => {
      const res = (
        await axiosInstance.get<GetAllMessagesResponse>(`/messages/${chatId}`)
      ).data;
      console.log(res.data);
      return res.data.messages;
    },
  });
};

export const useSendMessage = (chatId: string) => {
  const queryClient = useQueryClient();
  return useMutation<SendMessageResponse, Error, SendMessageRequest>({
    mutationFn: async (content) => {
      const res = (
        await axiosInstance.post<SendMessageResponse>(`/messages/${chatId}`, {
          content,
        })
      ).data;
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "messages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["user", "chats"] });
    },
  });
};
