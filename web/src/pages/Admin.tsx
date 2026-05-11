import { AdminSidebar } from "@/components/AdminSidebar";
import { useMe } from "@/service/api/auth/auth.api";

function Admin() {
  const { data } = useMe();

  if (!data) {
    return null;
  }

  return (
    <div>
      <AdminSidebar name={data.data.name} role={data.data.role} />
    </div>
  );
}

export default Admin;
