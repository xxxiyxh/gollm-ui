export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}
  
export interface Session {
  id: string;              // UUID
  title: string;           // 首条 user message（前 20 字）或“New Chat”
  messages: ChatMessage[]; // 客户端持有的显示用历史
}
  