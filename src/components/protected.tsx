import { API_URL } from "@/constants/api";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export const ProtectedPage = (props: Props) => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/verify-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          navigate("/");
        }
      } catch (error) {
        localStorage.removeItem("token");
        console.error("Falha ao verificar o token:", error);
        navigate("/");
      }
    };
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
    verifyToken();
  }, [navigate]);

  return <>{props.children}</>;
};
