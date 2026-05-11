import { Navigate, Outlet } from "react-router-dom";

import { useMe, type AuthenticatedUser } from "@/service/api/auth/auth.api";

interface ProtectedRoutesProps {
  allowedRoles?: AuthenticatedUser["role"][];
}

const ProtectedRoutes = ({ allowedRoles }: ProtectedRoutesProps) => {
  const { data, isError, isPending } = useMe();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (isError || !data?.data) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(data.data.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
