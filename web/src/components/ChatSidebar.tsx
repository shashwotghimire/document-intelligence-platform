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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { LogoDark } from "./Logo";
import {
  useCreateChat,
  useDeleteChat,
  useGetAllChats,
  type Chat,
} from "@/service/api/chats/chat.api";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
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
  const handleCreateChat = () => {
    mutate(undefined, {
      onSuccess: (data) => {
        navigate(`/chat/${data.id}`);
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
            {deleteError && (
              <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {deleteError}
              </p>
            )}
            <SidebarMenu className="mt-1 gap-1">
              {chats.map((conversation) => (
                <SidebarMenuItem
                  key={conversation.id}
                  className="group relative"
                >
                  <Button
                    asChild
                    data-active={chatId === conversation.id}
                    variant="ghost"
                    className="h-10 w-full cursor-pointer justify-start rounded-lg px-3 pr-10 text-sm font-medium text-foreground transition-colors hover:bg-ink hover:text-cream hover:shadow-soft data-[active=true]:bg-ink data-[active=true]:text-cream data-[active=true]:shadow-soft"
                  >
                    <NavLink
                      to={`/chat/${conversation.id}`}
                      className="block min-w-0 truncate"
                    >
                      {conversation.title}
                    </NavLink>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Open actions for ${conversation.title}`}
                        className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-white opacity-0 transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
                      >
                        <EllipsisVertical className="size-4" />
                      </button>
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

      <SidebarFooter className="border-t border-sidebar-border">
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
    </Sidebar>
  );
}
