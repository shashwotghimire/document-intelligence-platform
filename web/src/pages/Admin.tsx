import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useMe } from "@/service/api/auth/auth.api";
import { Outlet } from "react-router-dom";

function Admin() {
  const { data } = useMe();

  if (!data) {
    return null;
  }

  return (
    <SidebarProvider>
      <AdminSidebar
        email={data.data.email}
        name={data.data.name}
        role={data.data.role}
        gravatarUrl={data.data.gravatarUrl}
      />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export default Admin;
