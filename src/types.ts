export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}
  
export interface Session {
  id: string;              // UUID
  title: string;           // 首条 user message（前 20 字）或“New Chat”
  messages: ChatMessage[]; // 客户端持有的显示用历史
}

export interface Template {
  name: string;
  version: number;
  prompt: string;
  system?: string;
  createdAt?: string;   // 后端返回的时间戳（可选）
}
