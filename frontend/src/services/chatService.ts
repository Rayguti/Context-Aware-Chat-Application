import type { Conversation } from "../models/Conversation";

export async function sendMessageToChatbot(
  message: string,
  conversationId: string
): Promise<Response> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, conversation_id: conversationId }),
  });

  return response;
}

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations`);
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  const data = await response.json();
  return data;
}
