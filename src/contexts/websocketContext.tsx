import { WS_URL } from "@/constants/api";
import type { SessionPayload } from "@/lib/auth";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

// WebSocket message types for chat
type WebSocketMessageType = "typing" | "stop_typing" | "error" | "user_message" | "agent_message";

export interface AgentMessage {
  id: string;
  content: string;
  agentId: string;
  sender: string;
  created_at: string;
  roomId: string;
  type: "agent";
  [key: string]: unknown; // Add index signature
}
export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  sender: string;
  created_at: string;
  roomId: string;
  type: "user";
  [key: string]: unknown; // Add index signature
}

interface WebSocketMessage {
  type: WebSocketMessageType;
  data: Record<string, unknown>;
}

export interface WebSocketUserMessage extends WebSocketMessage {
  type: "user_message";
  data: Record<string, unknown>;
}

export interface WebSocketErrorMessage extends WebSocketMessage {
  type: "error";
  data: {
    error: string;
    message?: string;
    [key: string]: unknown;
  };
}

export interface WebSocketTypingMessage extends WebSocketMessage {
  type: "typing" | "stop_typing";
  data: {
    userId: string;
    username: string;
    roomId: string;
    [key: string]: unknown;
  };
}

interface WebSocketContextType {
  // Connection state
  isConnected: boolean;
  connectionError: string | null;

  // Chat data
  messages: (ChatMessage | AgentMessage)[];
  typingUsers: Array<{ userId: string; username: string; roomId: string }>;

  // Methods
  sendMessage: (message: Record<string, unknown>) => void;
  sendUserMessage: (content: string, roomId: string) => void;
  sendTyping: (roomId: string, isTyping: boolean) => void;
  sendStopTyping: (roomId: string) => void;
  clearMessages: () => void;
  reconnect: () => void;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
  userSession: SessionPayload | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, userSession }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 5000; // 5 seconds

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<(ChatMessage | AgentMessage)[]>([]);
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; username: string; roomId: string }>>([]);

  const connect = React.useCallback(() => {
    if (!userSession?.access_token) {
      console.warn("No access token available, skipping WebSocket connection");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    try {
      // Use environment variable for WebSocket URL, fallback to localhost
      const fullWsUrl = `${WS_URL}/ws?token=${userSession.access_token}`;
      console.log("Connecting to WebSocket:", fullWsUrl);

      const ws = new WebSocket(fullWsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected successfully");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log("WebSocket message received:", message);

          // Handle specific message types
          switch (message.type) {
            case "agent_message": {
              const chatMessage = message.data as AgentMessage;
              // Make sure it has the correct type
              chatMessage.type = "agent";
              setMessages((prev) => [...prev, chatMessage]);
              break;
            }

            // case "user_message": {
            //   const chatMessage = message.data as ChatMessage;
            //   setMessages((prev) => [...prev, chatMessage]);
            //   break;
            // }

            case "typing": {
              const typingData = message.data as { userId: string; username: string; roomId: string };
              setTypingUsers((prev) => {
                const exists = prev.find((u) => u.userId === typingData.userId && u.roomId === typingData.roomId);
                if (!exists) {
                  return [...prev, typingData];
                }
                return prev;
              });
              break;
            }

            case "stop_typing": {
              const stopTypingData = message.data as { userId: string; roomId: string };
              setTypingUsers((prev) =>
                prev.filter((u) => !(u.userId === stopTypingData.userId && u.roomId === stopTypingData.roomId))
              );
              break;
            }

            case "error":
              console.error("WebSocket error message:", message.data);
              break;

            default:
              console.warn("Unknown message type:", message.type);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError("Erro na conexão WebSocket");
      };

      ws.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        if (event.code !== 1000) {
          // Not a normal closure
          setConnectionError("Conexão perdida");

          // Attempt to reconnect if not manually closed and we have attempts left
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectInterval);
          } else {
            console.error("Max reconnection attempts reached");
          }
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionError("Falha ao criar conexão WebSocket");
    }
  }, [userSession?.access_token]);

  const disconnect = React.useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);
  }, []);

  const sendMessage = React.useCallback((message: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Cannot send message:", message);
    }
  }, []);

  const sendUserMessage = React.useCallback(
    (content: string, roomId: string) => {
      if (!userSession) return;

      const message = {
        type: "user_message",
        data: {
          content,
          roomId,
          sender: userSession.username,
          senderId: userSession.userId,
          timestamp: new Date().toISOString(),
          type: "user",
        },
      };
      sendMessage(message);
    },
    [sendMessage, userSession]
  );

  const sendTyping = React.useCallback(
    (roomId: string, isTyping: boolean) => {
      if (!userSession) return;

      const message = {
        type: isTyping ? "typing" : "stop_typing",
        data: {
          userId: userSession.userId,
          username: userSession.username,
          roomId,
        },
      };
      sendMessage(message);
    },
    [sendMessage, userSession]
  );

  const sendStopTyping = React.useCallback(
    (roomId: string) => {
      sendTyping(roomId, false);
    },
    [sendTyping]
  );

  const clearMessages = React.useCallback(() => {
    setMessages([]);
  }, []);

  const reconnect = React.useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    setTimeout(connect, 1000); // Wait 1 second before reconnecting
  }, [connect, disconnect]);

  // Connect when component mounts or userSession changes
  useEffect(() => {
    if (userSession?.access_token) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [userSession?.access_token, connect, disconnect]);

  // Handle page visibility change (reconnect when page becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && userSession?.access_token && !isConnected) {
        console.log("Page became visible, attempting to reconnect...");
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [connect, isConnected, userSession?.access_token]);

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionError,
    messages,
    typingUsers,
    sendMessage,
    sendUserMessage,
    sendTyping,
    sendStopTyping,
    clearMessages,
    reconnect,
  };

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};

export default WebSocketContext;
