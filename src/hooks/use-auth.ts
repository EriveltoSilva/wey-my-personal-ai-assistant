import { getSession, type SessionPayload } from "@/lib/auth";
import { useCallback, useEffect, useState } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<SessionPayload | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem("session");
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
    setSession(null);
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);

      // Try to get session information
      try {
        const sessionInfo = getSession();
        if (sessionInfo) {
          setSession(sessionInfo);
        } else {
          // Session is invalid, logout
          logout();
        }
      } catch (error) {
        console.error("Error getting session:", error);
        logout();
      }
    }
  }, [logout]);

  return {
    isAuthenticated,
    token,
    session,
    logout,
  };
};
