import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    localStorage.setItem("accessToken", token);
    navigate("/chats");
  }, [navigate]);

  return <p>Logging you in...</p>;
}
