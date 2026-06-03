import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMe } from "@/service/api/auth/auth.api";

export default function CallbackPage() {
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get("token");
  const [tokenReady, setTokenReady] = useState(false);
  const { data, error, isError } = useMe(tokenReady);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("accessToken", token);
    setTokenReady(true);
  }, [navigate, token]);

  useEffect(() => {
    if (!data) return;

    navigate(
      data.data.role === "admin" ? "/admin/dashboard" : "/chat",
      { replace: true },
    );
  }, [data, navigate]);

  useEffect(() => {
    if (!isError) return;

    console.error("OAuth callback failed to fetch user", error);
    localStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  }, [error, isError, navigate]);

  return <p>Logging you in...</p>;
}
