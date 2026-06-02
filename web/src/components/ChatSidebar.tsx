import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EllipsisVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { LogoDark } from "./Logo";
import {
  useCreateChat,
  useDeleteChat,
  useGetAllChats,
  type Chat,
} from "@/service/api/chats/chat.api";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { UserAccountMenu } from "./UserAccountMenu";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { RenameChatDialog } from "./RenameChatDialog";
import { useEffect, useRef, useState } from "react";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

interface ChatSidebarProps {
  email: string;
  name: string;
  role: string;
  gravatarUrl?: string;
}

export function ChatSidebar(data: ChatSidebarProps) {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const { isMobile, setOpenMobile } = useSidebar();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState<Pick<
    Chat,
    "id" | "title"
  > | null>(null);
  const [chatToDelete, setChatToDelete] = useState<Pick<
    Chat,
    "id" | "title"
  > | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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
  const {
    mutate: deleteChat,
    isPending: deleteIsPending,
  } = useDeleteChat();
  // if (isFetchingNextPage) {
  //   return <Loading />;
  // }
  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleCreateChat = () => {
    mutate(undefined, {
      onSuccess: (data) => {
        navigate(`/chat/${data.id}`);
        closeSidebarOnMobile();
      },
    });
  };
  const handleRenameClick = (chat: Pick<Chat, "id" | "title">) => {
    setChatToRename(chat);
    setRenameDialogOpen(true);
  };
  const handleRenameDialogOpenChange = (open: boolean) => {
    setRenameDialogOpen(open);

    if (!open) {
      setChatToRename(null);
    }
  };
  const handleConfirmDeleteChat = () => {
    if (!chatToDelete) return;

    setDeleteError(null);
    deleteChat(
      {
        chatId: chatToDelete.id,
      },
      {
        onSuccess: () => {
          if (chatId === chatToDelete.id) {
            const nextChat = chats.find((chat) => chat.id !== chatToDelete.id);
            navigate(nextChat ? `/chat/${nextChat.id}` : "/chat", {
              replace: true,
            });
          }
          setChatToDelete(null);
        },
        onError: () => {
          setDeleteError("Unable to delete chat. Please try again.");
        },
      },
    );
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
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex w-full flex-row items-center justify-between border-b border-sidebar-border px-4 pb-4 pt-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-b-0 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pb-8 group-data-[collapsible=icon]:pt-5">
        <div className="group-data-[collapsible=icon]:hidden">
          <LogoDark />
        </div>
        <SidebarTrigger className="shrink-0 border border-sidebar-border bg-sidebar shadow-sm opacity-0 transition-opacity group-hover:opacity-100 group-data-[collapsible=icon]:opacity-100" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="mt-4 border-l border-sidebar-border py-1 pl-2 pr-1 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:px-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  disabled={createIsPending}
                  onClick={handleCreateChat}
                  size="lg"
                  tooltip={createIsPending ? "Creating..." : "New chat"}
                  className="h-11 cursor-pointer rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-ink hover:text-cream hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60 group-data-[collapsible=icon]:justify-center [&_svg]:transition-transform hover:[&_svg]:scale-110"
                >
                  <Plus data-icon="inline-start" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {createIsPending ? "Creating..." : "New chat"}
                  </span>
                </SidebarMenuButton>
                {createIsError && (
                  <p className="text-red-500 text-sm group-data-[collapsible=icon]:hidden">
                    Error creating chat
                  </p>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-1 group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="font-bold text-md mb-2 ">
            Recents
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {deleteError && (
              <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 group-data-[collapsible=icon]:hidden">
                {deleteError}
              </p>
            )}
            <SidebarMenu className="mt-1 gap-1 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-5">
              {chats.map((conversation) => (
                <SidebarMenuItem
                  key={conversation.id}
                  className="group relative"
                >
                  <SidebarMenuButton
                    asChild
                    isActive={chatId === conversation.id}
                    tooltip={conversation.title}
                    className="h-10 cursor-pointer rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-ink hover:text-cream hover:shadow-soft data-[active=true]:bg-ink data-[active=true]:text-cream data-[active=true]:shadow-soft group-data-[collapsible=icon]:justify-center"
                  >
                    <NavLink
                      to={`/chat/${conversation.id}`}
                      aria-label={conversation.title}
                      onClick={closeSidebarOnMobile}
                    >
                      <span className="group-data-[collapsible=icon]:hidden">
                        {conversation.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction
                        type="button"
                        aria-label={`Open actions for ${conversation.title}`}
                        showOnHover
                        className="size-8 cursor-pointer data-[state=open]:opacity-100"
                      >
                        <EllipsisVertical />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className="cursor-pointer transition-colors hover:bg-neutral-300 focus:bg-neutral-300"
                          onSelect={() => handleRenameClick(conversation)}
                        >
                          <Pencil />
                          Rename
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          variant="destructive"
                          className="cursor-pointer"
                          onSelect={() => setChatToDelete(conversation)}
                        >
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      <SidebarFooter className="border-t border-sidebar-border group-data-[collapsible=icon]:items-center">
        <UserAccountMenu
          email={data.email}
          gravatarUrl={data.gravatarUrl}
          name={data.name}
          role={data.role}
        />
      </SidebarFooter>
      <RenameChatDialog
        chat={chatToRename}
        open={renameDialogOpen}
        onOpenChange={handleRenameDialogOpenChange}
      />
      <DeleteConfirmationDialog
        open={Boolean(chatToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setChatToDelete(null);
          }
        }}
        title="Delete chat?"
        description="This will permanently delete this chat and its messages."
        itemName={chatToDelete?.title}
        isPending={deleteIsPending}
        onConfirm={handleConfirmDeleteChat}
      />
      <SidebarRail />
    </Sidebar>
  );
}
