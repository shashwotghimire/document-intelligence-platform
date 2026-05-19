import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import { LogoDark } from "./Logo";
import { useCreateChat, useGetAllChats } from "@/service/api/chats/chat.api";
import Loading from "./Loading";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";

interface ChatSidebarProps {
  name: string;
  role: string;
  gravatarUrl?: string;
}

export function ChatSidebar(data: ChatSidebarProps) {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const { data: chatData, isPending } = useGetAllChats();
  const chats = chatData?.chats ?? [];
  const {
    mutate,
    isPending: createIsPending,
    // isError: createIsError,
  } = useCreateChat();
  if (isPending) {
    return <Loading />;
  }
  const handleCreateChat = () => {
    mutate(undefined, {
      onSuccess: (data) => {
        navigate(`/chat/${data.id}`);
      },
    });
  };
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border pb-4">
        <LogoDark />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="mt-4 border-l border-sidebar-border py-1 pl-2 pr-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <Button
                  disabled={createIsPending}
                  onClick={handleCreateChat}
                  variant="ghost"
                  className="h-11 w-full cursor-pointer justify-start rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-ink hover:text-cream hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4 [&_svg]:transition-transform hover:[&_svg]:scale-110"
                >
                  <Plus />
                  {createIsPending ? "Creating..." : "New chat"}
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-1">
          <SidebarGroupLabel className="font-bold text-md mb-2 ">
            Recents
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-1 gap-1">
              {chats.map((conversation) => (
                <SidebarMenuItem key={conversation.id}>
                  <Button
                    asChild
                    data-active={chatId === conversation.id}
                    variant="ghost"
                    className="h-10 w-full cursor-pointer justify-start rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-ink hover:text-cream hover:shadow-soft data-[active=true]:bg-ink data-[active=true]:text-cream data-[active=true]:shadow-soft"
                  >
                    <NavLink to={`/chat/${conversation.id}`}>
                      {conversation.title}
                    </NavLink>
                  </Button>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex gap-4">
          {data.gravatarUrl && (
            <img
              alt={`${data.name}'s avatar`}
              className="size-9 rounded-full mt-2"
              src={data.gravatarUrl}
            />
          )}
          <div className="flex flex-col ">
            <p>{data.name}</p>
            <p className="text-neutral-500">{data.role}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
