import type { Conversations } from "../models/Conversation";
import type { Message } from "../models/Message";

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

export async function fetchConversations(): Promise<Conversations> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations`);
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  const data = await response.json();
  return data;
}

export async function fetchMessages(
  conversationId: string
): Promise<Message[]> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/conversation/${conversationId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  const data = await response.json();
  return data;
}

export async function deleteMessages(conversationId: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/conversation/${conversationId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to delete messages: ${errorMessage}`);
  }
}
