import type { Message } from "./Message";

export interface Conversations {
  [conversationId: string]: Message[];
}
