import { Navigate, Outlet } from "react-router-dom";

import { useMe } from "@/service/api/auth/auth.api";

const PublicRoute = () => {
  const hasToken = Boolean(localStorage.getItem("accessToken"));
  const { data, isError, isPending } = useMe(hasToken);

  if (!hasToken) {
    return <Outlet />;
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (isError || !data?.data) {
    return <Outlet />;
  }

  return <Navigate to={data.data.role === "admin" ? "/admin" : "/chat"} replace />;
};

export default PublicRoute;
