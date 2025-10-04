import { jwtDecode } from "jwt-decode";

export interface DecodedAPIToken {
  sub: string; // ID do utilizador
  username: string;
  role: string;
  full_name: string;
  exp: number;
}

export type SessionPayload = {
  userId: string;
  username: string;
  role: string;
  fullName: string;
  access_token: string;
  expiresAt: Date;
};

// Simple auth functions for React.js using localStorage
export function createSession(apiToken: string) {
  const apiTokenPayload: DecodedAPIToken = jwtDecode(apiToken);
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 dias

  const session: SessionPayload = {
    userId: apiTokenPayload.sub,
    username: apiTokenPayload.username,
    fullName: apiTokenPayload.full_name,
    role: apiTokenPayload.role,
    access_token: apiToken,
    expiresAt,
  };

  localStorage.setItem("session", JSON.stringify(session));
  localStorage.setItem("token", apiToken);
}

export function deleteSession() {
  try {
    localStorage.removeItem("session");
    localStorage.removeItem("token");
  } catch (error) {
    console.error("Erro ao deletar a sessão:", error);
  }
}

export function logoutSession() {
  deleteSession();
}

export function getSession(): SessionPayload | null {
  try {
    const session = localStorage.getItem("session");
    if (!session) return null;

    const parsed: SessionPayload = JSON.parse(session);

    // Check if session is expired
    if (new Date() > new Date(parsed.expiresAt)) {
      deleteSession();
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Erro ao obter a sessão:", error);
    deleteSession();
    return null;
  }
}

export function getAccessToken(): string | null {
  const session = getSession();
  if (!session) return null;
  return session.access_token;
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
