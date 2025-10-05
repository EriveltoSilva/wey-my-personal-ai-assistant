import { Send } from "lucide-react";
import type { Dispatch, KeyboardEvent, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { LoadingChatMessages } from "@/components/chats/loading-chat-messages";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import type { ChatMessage } from "@/types/chats";

interface InitialChatStateProps {
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  onSendMessage: () => Promise<void>;
  onKeyPress: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInit() {
  const { session } = useAuth();
  const { addMessage, updateMessage, clearMessages, createChat, isCreatingChat } = useChat();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat when component mounts
  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isCreatingChat) return;
    if (!session?.access_token) return;

    const currentQuery = inputValue.trim();
    setInputValue("");

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: currentQuery,
      role: "user",
    };

    addMessage(userMessage);

    // Create AI message placeholder
    const aiMessageId = crypto.randomUUID();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      content: "",
      role: "agent",
    };
    addMessage(aiMessage);

    try {
      console.log("Creating new chat with message:", currentQuery);

      const result = await createChat({
        initialMessage: currentQuery,
        accessToken: session.access_token,
      });

      if (result.success && result.chat) {
        navigate(`/chat/${result.chat.id}`);
      } else {
        throw new Error(result.error || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Update AI message with error
      updateMessage(aiMessageId, `Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isCreatingChat && inputValue.trim() !== "") {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return (
    <InitialChatState
      inputValue={inputValue}
      setInputValue={setInputValue}
      onSendMessage={handleSendMessage}
      onKeyPress={handleKeyPress}
      isLoading={isCreatingChat}
      inputRef={inputRef}
    />
  );
}

function InitialChatState({
  inputValue,
  setInputValue,
  onSendMessage,
  onKeyPress,
  isLoading,
  inputRef,
}: InitialChatStateProps) {
  if (isLoading) return <LoadingChatMessages />;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-4xl text-center font-semibold text-white mb-10">
          Hello <span className="text-blue-400">Sr.</span> Como posso <span className="text-blue-400">ajuda-lo</span>{" "}
          hoje?
        </h1>

        <div className="relative">
          <div className="flex flex-col gap-2 p-4 bg-black/60 border border-border rounded-2xl shadow-sm transition-all duration-300 focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-400/20">
            <div className="flex items-end gap-2 p-4">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={onKeyPress}
                placeholder="Esperando sua pergunta..."
                rows={1}
                className="flex-1 bg-transparent border-0 resize-none outline-none placeholder:text-muted-foreground text-lg py-2 px-0 min-h-[28px] max-h-[200px] overflow-y-auto scrollbar-hide"
                style={{
                  height: "auto",
                  lineHeight: "1.5",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 200) + "px";
                }}
              />

              <Button
                onClick={onSendMessage}
                disabled={!inputValue.trim() || isLoading}
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <Send className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
