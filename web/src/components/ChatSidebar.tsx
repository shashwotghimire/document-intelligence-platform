import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import { LogoDark } from "./Logo";

const conversations = [
  {
    title: "Current chat",
  },
];

interface ChatSidebarProps {
  name: string;
  role: string;
}

export function ChatSidebar(data: ChatSidebarProps) {
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
                <SidebarMenuButton
                  size="lg"
                  className="cursor-pointer text-base hover:bg-ink hover:text-cream hover:shadow-soft [&_svg]:transition-transform hover:[&_svg]:scale-110"
                >
                  <Plus />
                  <span>New chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-1">
          <SidebarGroupLabel className="text-sm">Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-1 gap-2">
              {conversations.map((conversation) => (
                <SidebarMenuItem key={conversation.title}>
                  <SidebarMenuButton
                    isActive
                    size="lg"
                    className="cursor-pointer text-sm hover:bg-ink hover:text-cream hover:shadow-soft data-[active=true]:bg-ink data-[active=true]:text-cream data-[active=true]:shadow-soft [&_svg]:transition-transform hover:[&_svg]:scale-110"
                  >
                    <span>{conversation.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <p>{data.name}</p>
        <p className="text-neutral-500">{data.role}</p>
      </SidebarFooter>
    </Sidebar>
  );
}
