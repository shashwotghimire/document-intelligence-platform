import { Send } from "lucide-react";
import Loading from "./Loading";
import { Input } from "./ui/input";
import { useGetMessages } from "@/service/api/messages/messages.api";
import { Button } from "./ui/button";

interface ChatInterfaceProps {
  chatId?: string;
}
const ChatInterface = ({ chatId }: ChatInterfaceProps) => {
  const { data = [], isPending, error } = useGetMessages(chatId);
  if (isPending) {
    return <Loading />;
  }
  return (
    <main className="flex flex-col h-[85vh] felx-col border bg-background gap-2">
      <div className="flex-1 overflow-y-auto border border-blue-500">
        <div className="flex flex-col gap-5 p-2 border border-red-500 max-w-4xl mx-auto">
          {data.map((message) => {
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
        </div>
      </div>
      <div className="p-1.5 ">
        <form className="flex justify-between mx-auto max-w-4xl gap-4 ">
          <Input
            placeholder="Ask anything ..."
            className="border shadow-sm border-neutral-300 h-10 rounded-2xl active:border-neutral-500 focus-visible:ring-0"
          />
          <Button className="h-9 rounded-2xl p-4 cursor-pointer hover:bg-neutral-600 transition-colors shadow-sm">
            <Send />
          </Button>
        </form>
      </div>
    </main>
  );
};

export default ChatInterface;
