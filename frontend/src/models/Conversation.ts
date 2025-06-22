import type { Message } from "./Message";

export interface Conversation {
  [conversationId: string]: Message[];
}
