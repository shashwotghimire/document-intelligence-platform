import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoutes from "@/components/ProtectedRoutes";
import PublicRoute from "@/components/PublicRoute";
import Admin from "@/pages/Admin";
import Chat from "@/pages/Chat";
import EmailVerify from "@/pages/EmailVerify";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="/verify-email" element={<EmailVerify />} />
      <Route element={<ProtectedRoutes allowedRoles={["admin", "user"]} />}>
        <Route path="/chat" element={<Chat />} />
      </Route>
      <Route element={<ProtectedRoutes allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
