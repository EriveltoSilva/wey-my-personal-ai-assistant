import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout";
import { ProtectedPage } from "./components/protected";
import { WebSocketProvider } from "./contexts/websocketContext";
import { useAuth } from "./hooks/use-auth";
import { ChatInit } from "./pages/chats/chat-init";
import { ChatRoom } from "./pages/chats/chat-room";
import { LoginPage } from "./pages/login";
import { SignUpPage } from "./pages/signup";

const queryClient = new QueryClient();

function AppRoutes() {
  const { session } = useAuth();

  return (
    <WebSocketProvider userSession={session}>
      <Routes>
        <Route index element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/criar-conta" element={<SignUpPage />} />
        <Route
          path="/chat"
          element={
            <Layout>
              <ProtectedPage>
                <ChatInit />
              </ProtectedPage>
            </Layout>
          }
        />
        <Route
          path="/chat/:chatId"
          element={
            <Layout>
              <ProtectedPage>
                <ChatRoom />
              </ProtectedPage>
            </Layout>
          }
        />
      </Routes>
    </WebSocketProvider>
  );
}

export function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
}
