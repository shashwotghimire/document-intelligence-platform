import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, MessageSquare, Users } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { LogoDark } from "./Logo";
import { UserAccountMenu } from "./UserAccountMenu";

interface AdminSidebarProps {
  email: string;
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
];

export function AdminSidebar(data: AdminSidebarProps) {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex w-full flex-row items-center justify-between border-b border-sidebar-border px-4 pb-4 pt-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-b-0 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pb-8 group-data-[collapsible=icon]:pt-5">
        <div className="group-data-[collapsible=icon]:hidden">
          <LogoDark />
        </div>
        <SidebarTrigger className="shrink-0 border border-sidebar-border bg-sidebar shadow-sm opacity-0 transition-opacity group-hover:opacity-100 group-data-[collapsible=icon]:opacity-100" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="mt-4 border-l border-sidebar-border pl-3 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:px-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    size="lg"
                    tooltip={item.title}
                    className="h-11 cursor-pointer rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-ink hover:text-cream hover:shadow-soft data-[active=true]:bg-ink data-[active=true]:text-cream data-[active=true]:shadow-soft group-data-[collapsible=icon]:justify-center [&_svg]:transition-transform hover:[&_svg]:scale-110"
                  >
                    <NavLink
                      to={item.url}
                      aria-label={item.title}
                      onClick={closeSidebarOnMobile}
                    >
                      <item.icon data-icon="inline-start" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
      <SidebarRail />
    </Sidebar>
  );
}
