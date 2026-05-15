import { ChatSidebar } from "@/components/ChatSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useMe } from "@/service/api/auth/auth.api";
import { ArrowLeft } from "lucide-react";
import { NavLink, useParams } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";

function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const { data } = useMe();
  if (!data) {
    return null;
  }

  return (
    <SidebarProvider>
      <ChatSidebar name={data.data.name} role={data.data.role} />
      <main className="flex flex-1 flex-col p-6">
        {data.data.role === "admin" && (
          <div className="flex justify-end border-b p-3 -mx-6 px-6 mb-6 border-sidebar-border">
            <NavLink
              to="/admin"
              className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-5" />
              <span>Admin Panel</span>
            </NavLink>
          </div>
        )}
        <div>
          <ChatInterface chatId={chatId} />
        </div>
      </main>
    </SidebarProvider>
  );
}

export default Chat;
