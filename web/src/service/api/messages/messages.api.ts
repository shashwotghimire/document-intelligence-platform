import axiosInstance from "@/service/axios/axios";
import { useQuery } from "@tanstack/react-query";

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
