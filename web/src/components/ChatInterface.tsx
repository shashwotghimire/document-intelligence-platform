import { Send } from "lucide-react";
import Loading from "./Loading";
import { Input } from "./ui/input";
import {
  useGetMessages,
  useGetStreamingMessages,
} from "@/service/api/messages/messages.api";
import { Button } from "./ui/button";
import React, { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { customComponents } from "./markdownComponents";

interface ChatInterfaceProps {
  chatId?: string;
}
const ChatInterface = ({ chatId }: ChatInterfaceProps) => {
  const [content, setContent] = React.useState("");
  const [pendingContent, setPendingContent] = useState("");
  const { data = [], isPending, error } = useGetMessages(chatId);
  const displayMessage = [...data].reverse();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const {
    sendMessage,
    streamingMessage,
    isStreaming,
    error: isStreamingError,
  } = useGetStreamingMessages(chatId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setPendingContent(content);
    setContent("");
    await sendMessage(content);
  };
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [data, streamingMessage]);
  if (isPending) {
    return <Loading />;
  }
  return (
    <main className="flex flex-col h-[88vh]  bg-background gap-2">
      <div className="flex-1 overflow-y-auto ">
        <div className="flex flex-col gap-5 p-2  max-w-4xl mx-auto">
          {displayMessage.map((message) => {
            const isUser = message.messageRole === "user";
            return (
              <div
                key={message.id}
                className={`  flex ${isUser ? "justify-end" : "items-center"} `}
              >
                <div
                  className={`max-w-2xl rounded-2xl p-2 text-sm ${
                    isUser
                      ? "mt-1 bg-primary text-primary-foreground border"
                      : "mt-3 bg-background text-foreground max-w-5xl"
                  }`}
                >
                  <Markdown components={customComponents}>
                    {message.content}
                  </Markdown>
                </div>
              </div>
            );
          })}
          {isStreaming && (
            <>
              <div className="flex justify-end">
                <div className="max-w-2xl rounded-2xl p-2 text-sm mt-1 bg-primary text-primary-foreground border">
                  {pendingContent}
                </div>
              </div>
              <div className="flex items-center">
                <div className="rounded-2xl p-2 text-sm mt-3 bg-background text-foreground max-w-5xl ">
                  {streamingMessage || ". . ."}
                </div>
              </div>
            </>
          )}
          {isStreamingError && (
            <>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground max-w-2xl p-2 rounded-2xl">
                  {pendingContent}
                </div>
              </div>
              <div className="flex justify-start rounded-2xl">
                <div className="bg-muted text-red-500 p-2">
                  Something went wrong
                </div>
              </div>
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="p-1.5 ">
        <form
          className="flex justify-between mx-auto max-w-4xl gap-4 "
          onSubmit={handleSendMessage}
        >
          <Input
            placeholder="Ask anything ..."
            className="border shadow-sm border-neutral-300 h-10 rounded-2xl active:border-neutral-500 focus-visible:ring-0"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            type="submit"
            className="h-9 rounded-2xl p-4 cursor-pointer hover:bg-neutral-600 transition-colors shadow-sm"
            disabled={!chatId || !content.trim() || isStreaming}
          >
            <Send />
          </Button>
        </form>
        {error && <p className="text-red-500">Error fetching messages</p>}
      </div>
    </main>
  );
};

export default ChatInterface;
