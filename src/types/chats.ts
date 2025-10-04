export interface ChatResponse {
  id: string;
  title: string;
  status: string;
  message_count: number;
  last_message_at: string;
  created_at: string;
  user_id: string;
  agent_id: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "agent";
  message_type?: "text" | "image" | "file" | "code" | "system_info" | "error";
  tokens_used?: number;
  response_time_ms?: number;
  model_used?: string;
  created_at?: string;
}

export interface ChatCreateRequest {
  agent_id: string;
  initial_message: string;
}
