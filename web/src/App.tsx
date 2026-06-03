import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import ProtectedRoutes from "@/components/ProtectedRoutes";
import PublicRoute from "@/components/PublicRoute";
import Admin from "@/pages/Admin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminSettings from "@/pages/AdminSettings";
import AdminUsers from "@/pages/AdminUsers";
import Chat from "@/pages/Chat";
import EmailVerify from "@/pages/EmailVerify";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Register from "@/pages/Register";
import CallbackPage from "./pages/CallbackPage";

const getPageTitle = (pathname: string) => {
  if (pathname === "/") return "documentGPT";
  if (pathname === "/login") return "Sign in";
  if (pathname === "/register") return "Create account";
  if (pathname === "/verify-email") return "Verify email";
  if (pathname.startsWith("/chat")) return "Chat";
  if (pathname === "/profile") return "Profile";
  if (pathname === "/admin" || pathname === "/admin/dashboard") {
    return "Admin Dashboard";
  }
  if (pathname === "/admin/users") return "Users";
  if (pathname === "/admin/settings") return "Settings";

  return "documentGPT";
};

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getPageTitle(pathname);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<CallbackPage />} />
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="/verify-email" element={<EmailVerify />} />
      <Route element={<ProtectedRoutes allowedRoles={["admin", "user"]} />}>
        <Route path="/chat/:chatId?" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route element={<ProtectedRoutes allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<Admin />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
