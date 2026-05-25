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
    chatsData?.pages
      .flatMap((page) => page.chats)
      .find((chat) => chat.id === chatId)?.title ?? "Chat";

  useEffect(() => {
    if (!chatId) {
      mutate(undefined, {
        onSuccess: (data) => {
          navigate(`/chat/${data.id}`, { replace: true });
        },
      });
    }
  }, [chatId, navigate, mutate]);

  if (!data) {
    return null;
  }

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <ChatSidebar
        email={data.data.email}
        name={data.data.name}
        role={data.data.role}
        gravatarUrl={data.data.gravatarUrl}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b -mx-6 px-6 py-2.5 mb-6 border-sidebar-border">
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
        <div className="min-h-0 flex-1 overflow-hidden">
          <ChatInterface chatId={chatId} />
        </div>
      </main>
    </SidebarProvider>
  );
}

export default Chat;
