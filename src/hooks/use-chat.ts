import { API_URL } from "@/constants/api";
import type { ChatCreateRequest, ChatMessage, ChatResponse } from "@/types/chats";
import { useCallback, useState } from "react";

interface CreateChatParams {
  initialMessage: string;
  accessToken: string;
}

interface CreateChatResult {
  success: boolean;
  chat?: ChatResponse;
  error?: string;
}

export const useChat = () => {
  const [chat, setChat] = useState<ChatResponse | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const createChat = useCallback(
    async ({ initialMessage, accessToken }: CreateChatParams): Promise<CreateChatResult> => {
      setIsCreatingChat(true);

      try {
        const requestBody: ChatCreateRequest = {
          initial_message: initialMessage,
        };

        const response = await fetch(`${API_URL}/chats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const chatResponse = (await response.json()) as ChatResponse;
        setChat(chatResponse);

        return {
          success: true,
          chat: chatResponse,
        };
      } catch (error) {
        console.error("Error creating chat:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        };
      } finally {
        setIsCreatingChat(false);
      }
    },
    []
  );

  const loadChatHistory = useCallback(
    async (chatId: string, token: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setIsInitializing(true);

        console.log("======================= GETTING CHAT HIstory FROM API ============================");
        const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const chatMessagesResponse = (await response.json()) as ChatMessage[];
          setChatMessages(chatMessagesResponse);
          return { success: true };
        } else {
          console.error("Failed to load chat history");
          return { success: false, error: "Failed to load chat history" };
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        };
      } finally {
        setIsInitializing(false);
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (chatId: string, content: string, accessToken: string): Promise<{ success: boolean; error?: string }> => {
      if (!content.trim() || isLoading || !chatId) {
        return { success: false, error: "Invalid input" };
      }

      setIsLoading(true);

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: content.trim(),
        role: "user",
      };
      setChatMessages((prev) => [...prev, userMessage]);

      // Create AI message placeholder
      const aiMessageId = crypto.randomUUID();
      const aiMessage: ChatMessage = {
        id: aiMessageId,
        content: "",
        role: "agent",
      };
      setChatMessages((prev) => [...prev, aiMessage]);

      try {
        // Get the last 100 messages including the new user message
        const allMessages = [...chatMessages, userMessage];
        const last100Messages = allMessages.slice(-100);

        // Convert messages to the format expected by the API
        const apiMessages = last100Messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Create conversation object according to Conversation model
        const conversation = {
          streaming_mode: true,
          search_mode: false,
          model_name: null, // Let backend use default
          temperature: null, // Let backend use default
          messages: apiMessages,
        };

        // Updated API call to include chat ID
        const response = await fetch(`${API_URL}/chat/conversation/${chatId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(conversation),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulatedContent = "";

        if (reader) {
          let myBuffer = "";
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            let chunk = decoder.decode(value, { stream: true });

            // Handle SSE format
            if (chunk.endsWith("\n\n")) {
              chunk = chunk.replaceAll("\n\n", ""); // Remove newlines for better processing
            }
            chunk = chunk.replaceAll("data: ", ""); // Remove 'data: ' prefix

            myBuffer += chunk;
            accumulatedContent += chunk;
            setChatMessages((prev) =>
              prev.map((msg) => (msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg))
            );
          }
          console.log(myBuffer);
        }

        setIsLoading(false);
        return { success: true };
      } catch (error) {
        console.error("Error sending message:", error);

        // Update AI message with error
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: `Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}` }
              : msg
          )
        );

        setIsLoading(false);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
    [isLoading, chatMessages]
  );

  // const processExistingUserMessage = useCallback(
  //   async (
  //     userMessage: ChatMessage,
  //     chatId: string,
  //     accessToken: string
  //   ): Promise<{ success: boolean; error?: string }> => {
  //     return sendMessage(chatId, userMessage.content, accessToken);
  //   },
  //   [sendMessage]
  // );

  const addMessage = useCallback((message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback((messageId: string, content: string) => {
    setChatMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, content } : msg)));
  }, []);

  const clearMessages = useCallback(() => {
    setChatMessages([]);
  }, []);

  const resetChat = useCallback(() => {
    setChat(null);
    setChatMessages([]);
    setIsLoading(false);
    setIsInitializing(true);
  }, []);

  return {
    // State
    chat,
    chatMessages,
    isCreatingChat,
    isLoading,
    isInitializing,

    // Actions
    setChat,
    setChatMessages,
    createChat,
    loadChatHistory,
    sendMessage,
    // processExistingUserMessage,
    addMessage,
    updateMessage,
    clearMessages,
    resetChat,
  };
};
