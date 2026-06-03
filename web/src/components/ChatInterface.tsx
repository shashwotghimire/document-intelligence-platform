import { Send } from "lucide-react";
import Loading from "./Loading";
import LoadingDots from "@/components/LoadingDots";
import MetadataLoadingIndicator from "@/components/MetadataLoadingIndicator";
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    sendMessage,
    streamingMessage,
    isStreaming,
    isMetadataLoading,
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
    <main className="flex h-full min-h-0 flex-col bg-background gap-2">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-5 p-2  max-w-4xl mx-auto">
          {displayMessage.map((message) => {
            const isUser = message.messageRole === "user";
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"} `}
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
                  {message.messageRole === "ai" &&
                  message.content !=
                    "I don't have enough information to answer that." &&
                  message.referencedDocuments?.length ? (
                    <div className="mt-3 border-t border-border/60 pt-2 text-xs text-muted-foreground">
                      <div className="mb-1 font-medium text-muted-foreground">
                        Referenced documents
                      </div>

                      <div className="space-y-1">
                        {message.referencedDocuments.map((document) => (
                          <p key={document.documentId}>
                            {document.documentTitle}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {message.messageRole === "ai" &&
                  message.followUpQuestions?.length ? (
                    <div className="mt-3">
                      <div className="mb-2 text-xs font-medium text-muted-foreground">
                        Follow-up questions
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.followUpQuestions.map((question) => (
                          <button
                            key={question}
                            type="button"
                            className="cursor-pointer rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => {
                              setContent(question);
                              inputRef.current?.focus();
                            }}
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
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
                  {streamingMessage ? (
                    <>
                      <Markdown components={customComponents}>
                        {streamingMessage}
                      </Markdown>
                      {isMetadataLoading ? (
                        <MetadataLoadingIndicator />
                      ) : null}
                    </>
                  ) : (
                    <LoadingDots />
                  )}
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
                <div className="text-red-500 p-2">
                  Limit exceeded please try again later
                </div>
              </div>
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 p-1.5">
        <form
          className="flex justify-between mx-auto max-w-4xl gap-4 "
          onSubmit={handleSendMessage}
        >
          <Input
            ref={inputRef}
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
