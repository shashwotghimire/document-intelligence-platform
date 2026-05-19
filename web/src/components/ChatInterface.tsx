import { Send } from "lucide-react";
import Loading from "./Loading";
import { Input } from "./ui/input";
import {
  useGetMessages,
  useSendMessage,
} from "@/service/api/messages/messages.api";
import { Button } from "./ui/button";
import React, { useEffect, useRef, useState } from "react";

interface ChatInterfaceProps {
  chatId?: string;
}
const ChatInterface = ({ chatId }: ChatInterfaceProps) => {
  const [content, setContent] = React.useState<any>("");
  const [pendingContent, setPendingContent] = useState("");
  const { data = [], isPending, error } = useGetMessages(chatId);
  const displayMessage = [...data].reverse();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const {
    mutate,
    isPending: sendMessagePending,
    error: sendMessageError,
  } = useSendMessage(chatId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(content);
    setPendingContent(content);
    setContent("");
  };
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [data, sendMessagePending]);
  if (isPending) {
    return <Loading />;
  }
  return (
    <main className="flex flex-col h-[88vh]  border rounded-2xl bg-background gap-2">
      <div className="flex-1 overflow-y-auto ">
        <div className="flex flex-col gap-5 p-2  max-w-4xl mx-auto">
          {displayMessage.map((message) => {
            const isUser = message.messageRole === "user";
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"} `}
              >
                <div
                  className={`max-w-2xl rounded-2xl border p-2 text-sm ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })}
          {sendMessagePending && (
            <>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground max-w-2xl p-2 rounded-2xl">
                  {pendingContent}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-2 rounded-2xl">
                  {" "}
                  . . .{" "}
                </div>
              </div>
            </>
          )}
          {sendMessageError && (
            <>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground max-w-2xl p-2 rounded-2xl">
                  {pendingContent}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted text-red-500 p-2">
                  {" "}
                  Something went wrong{" "}
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
            disabled={sendMessagePending}
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
