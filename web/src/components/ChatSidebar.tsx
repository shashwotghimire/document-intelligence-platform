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
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { UserAccountMenu } from "./UserAccountMenu";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useEffect, useRef } from "react";

interface ChatSidebarProps {
  email: string;
  name: string;
  role: string;
  gravatarUrl?: string;
}

export function ChatSidebar(data: ChatSidebarProps) {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const {
    data: chatData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAllChats();
  const chats = chatData?.pages.flatMap((page) => page.chats) ?? [];
  const {
    mutate,
    isPending: createIsPending,
    isError: createIsError,
  } = useCreateChat();
  // if (isFetchingNextPage) {
  //   return <Loading />;
  // }
  const handleCreateChat = () => {
    mutate(undefined, {
      onSuccess: (data) => {
        navigate(`/chat/${data.id}`);
      },
    });
  };
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );

    const current = loadMoreRef.current;

    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
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
                {createIsError && (
                  <p className="text-red-500 text-sm">Error creating chat</p>
                )}
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
              {hasNextPage && (
                // <Button
                //   onClick={() => fetchNextPage()}
                //   disabled={isFetchingNextPage}
                //   className="cursor-pointer hover:bg-neutral-500"
                // >
                //   {isFetchingNextPage ? <LoadingSkeleton /> : "Load More"}
                // </Button>
                <div
                  ref={loadMoreRef}
                  className="flex h-10 items-center justify-center"
                >
                  {isFetchingNextPage && <LoadingSkeleton />}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <UserAccountMenu
          email={data.email}
          gravatarUrl={data.gravatarUrl}
          name={data.name}
          role={data.role}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
