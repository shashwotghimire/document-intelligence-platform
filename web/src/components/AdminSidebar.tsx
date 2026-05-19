import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Settings, Users, MessageSquare } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { LogoDark } from "./Logo";
import { Button } from "./ui/button";

interface AdminSidebarProps {
  name: string;
  role: string;
  gravatarUrl?: string;
}

const navItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar(data: AdminSidebarProps) {
  const { pathname } = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border pb-4">
        <LogoDark />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="mt-4 border-l border-sidebar-border pl-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Button
                    asChild
                    data-active={pathname === item.url}
                    variant="ghost"
                    className="h-11 w-full cursor-pointer justify-start rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-ink hover:text-cream hover:shadow-soft data-[active=true]:bg-ink data-[active=true]:text-cream data-[active=true]:shadow-soft [&_svg]:size-4 [&_svg]:transition-transform hover:[&_svg]:scale-110"
                  >
                    <NavLink to={item.url}>
                      <item.icon />
                      {item.title}
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
