import { ChatSidebar } from "@/components/ChatSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useMe } from "@/service/api/auth/auth.api";
import { useCreateChat, useGetAllChats } from "@/service/api/chats/chat.api";
import { ArrowLeft } from "lucide-react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import { useEffect } from "react";

function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { mutate } = useCreateChat();
  const { data } = useMe();
  const { data: chatsData } = useGetAllChats();
  const chatTitle =
    chatsData?.chats.find((chat) => chat.id === chatId)?.title ?? "Chat";

  if (!data) {
    return null;
  }
  useEffect(() => {
    if (!chatId) {
      mutate(undefined, {
        onSuccess: (data) => {
          navigate(`/chat/${data.id}`, { replace: true });
        },
      });
    }
  }, [chatId, navigate, mutate]);
  return (
    <SidebarProvider>
      <ChatSidebar name={data.data.name} role={data.data.role} />
      <main className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-4 border-b -mx-6 px-6 py-2.5 mb-6 border-sidebar-border">
          <h1 className="truncate text-base font-semibold text-foreground ">
            {chatTitle}
          </h1>
          {data.data.role === "admin" && (
            <NavLink
              to="/admin"
              className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-5" />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </div>
        <div>
          <ChatInterface chatId={chatId} />
        </div>
      </main>
    </SidebarProvider>
  );
}

export default Chat;
