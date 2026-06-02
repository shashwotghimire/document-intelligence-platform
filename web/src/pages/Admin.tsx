import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useMe } from "@/service/api/auth/auth.api";
import { Outlet } from "react-router-dom";

function Admin() {
  const { data } = useMe();

  if (!data) {
    return null;
  }

  return (
    <SidebarProvider className="min-h-svh">
      <AdminSidebar
        email={data.data.email}
        name={data.data.name}
        role={data.data.role}
        gravatarUrl={data.data.gravatarUrl}
      />
      <main className="min-w-0 flex-1 p-4 sm:p-6">
        <div className="-mx-4 -mt-4 mb-4 flex items-center gap-2 border-b border-sidebar-border px-4 py-3 sm:-mx-6 sm:-mt-6 sm:px-6 md:hidden">
          <SidebarTrigger />
          <span className="text-sm font-semibold text-foreground">Admin</span>
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export default Admin;
