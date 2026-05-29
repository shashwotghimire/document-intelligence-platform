import axiosInstance from "@/service/axios/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export type ReferencedDocument = {
  documentId: string;
  documentTitle: string;
  documentType: "pdf" | "txt" | "csv" | "docx";
};
interface GetAllMessagesData {
  id: string;
  chatId: string;
  content: string;
  messageRole: "ai" | "user";
  referencedDocuments?: ReferencedDocument[] | null;
  followUpQuestions?: string[] | null;
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
    enabled: Boolean(chatId),
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

export const useGetStreamingMessages = (chatId?: string) => {
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const sendMessage = async (content: string) => {
    if (!chatId) {
      setError("Chat id is required");
    }
    setIsStreaming(true);
    setStreamingMessage("");
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/messages/${chatId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        },
      );

      if (!response.ok) throw new Error("Failed to send message");
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n\n").filter(Boolean);
        for (const line of lines) {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.chunk) {
            setStreamingMessage((prev) => prev + parsed.chunk);
          }
          if (parsed.done) {
            queryClient.invalidateQueries({
              queryKey: ["user", "messages", chatId],
            });
            queryClient.invalidateQueries({ queryKey: ["user", "chats"] });
          }
        }
      }
    } catch (e) {
      setError("Something went wrong");
    } finally {
      setIsStreaming(false);
      setStreamingMessage("");
    }
  };
  return { sendMessage, streamingMessage, isStreaming, error };
};

export const useSendMessage = (chatId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<SendMessageResponse, Error, SendMessageRequest>({
    mutationFn: async ({ content }) => {
      if (!chatId) {
        throw new Error("Chat ID is required to send a message.");
      }

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
