import { Plus, Send } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ChatAssistantWritingEffect } from "@/components/chats/chat-assistant-writing-effect";
import { MessageContent } from "@/components/chats/message-content";
import { Button } from "@/components/ui/button";
import { LOGO_THINKING, LOGO_WAITING } from "@/constants/logo";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";

export function ChatRoom() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { chatMessages, isLoading, isInitializing, loadChatHistory, sendMessage } = useChat();

  const [inputValue, setInputValue] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Initialize chat when component mounts
  useEffect(() => {
    if (!session?.access_token || !chatId) return;

    loadChatHistory(chatId, session?.access_token);
  }, [session?.access_token, chatId, loadChatHistory]);

  // Focus input when chat is ready and has messages
  useEffect(() => {
    if (!isInitializing && !isLoading && chatMessages.length > 0 && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current && !inputRef.current.disabled) {
          inputRef.current.focus();
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [chatMessages.length, isInitializing, isLoading]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading || !chatId || !session?.access_token) return;

    const currentQuery = inputValue.trim();
    setInputValue("");

    await sendMessage(chatId, currentQuery, session.access_token);
  }, [inputValue, isLoading, chatId, session?.access_token, sendMessage]);

  // Check if we need to process a single user message after loading chat history
  useEffect(() => {
    (async () => {
      if (!isInitializing && chatMessages.length === 1 && chatMessages[0].role === "user" && !isLoading) {
        if (chatId && session?.access_token) {
          await sendMessage(chatId, chatMessages[0].content, session.access_token);
        }
      }
    })();
  }, [chatMessages, sendMessage, isInitializing, isLoading, chatId, session?.access_token]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Allow Shift+Enter for new lines
    if (e.key === "Enter" && !e.shiftKey && inputValue.trim() !== "") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isInitializing) {
    // return <LoadingChatMessages />;
    return (
      <div className="flex items-center justify-center h-full">
        <img
          src={LOGO_THINKING}
          alt="Wey Logo"
          className="w-80 h-80 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 "
        />
        <p className="absolute">Analisando Sr...</p>
      </div>
    );
  }

  // Show error if no chat ID
  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Ups!! Chat não encontrado!</p>
        </div>
      </div>
    );
  }

  // Initial state - no messages
  if (chatMessages.length === 0) {
    navigate("/chat", {
      replace: true,
    });
  }

  // Chat state - with messages
  return (
    <div className="flex flex-col h-full max-h-screen relative">
      <img
        src={LOGO_WAITING}
        alt="Wey Logo"
        className="w-64 h-64 absolute left-25 top-35 transform -translate-x-1/2 -translate-y-1/2"
      />

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {chatMessages.map((message) => {
            if (message.role === "user") {
              return (
                <div key={message.id} className={`flex justify-end`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 bg-primary text-primary-foreground`}>
                    <div className="text-sm leading-relaxed">
                      <MessageContent content={message.content} />
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div key={message.id} className="flex">
                <div className="w-full rounded-2xl px-4 py-3 text-foreground">
                  <div className="text-sm leading-relaxed">
                    <MessageContent content={message.content} />
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && <ChatAssistantWritingEffect />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-background p-4 relative z-10">
        <div className="max-w-4xl mx-auto ">
          <div className="flex items-end gap-2 p-3 bg-card border border-border rounded-2xl shadow-sm focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-400/20">
            <Button
              disabled
              title="Ainda não temos nenhum recurso para ferramentas"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-foreground mb-1"
            >
              <Plus className="size-5" />
            </Button>

            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Pergunte-me o que quiser.."
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent border-0 resize-none outline-none placeholder:text-muted-foreground text-sm py-2 px-0 min-h-[20px] max-h-[200px] overflow-y-auto scrollbar-hide"
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
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-50 mb-1"
            >
              <Send className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
