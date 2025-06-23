/*All the logic to manage the chat functionality, including fetching conversations,
sending messages, and handling the chat state is encapsulated in this custom hook.*/

import { useEffect, useState } from "react";
import type { Message } from "../models/Message";
import type { Conversations } from "../models/Conversation";
import {
  fetchMessages,
  deleteMessages,
  sendMessageToChatbot,
  fetchConversations,
} from "../services/chatService";

export function useChat() {
  const [conversations, setConversations] = useState<Conversations>();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const result = await fetchConversations();
      setConversations(result);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const handleLoadMessages = async (conversationId: string) => {
    try {
      const loadedMessages = await fetchMessages(conversationId);
      setMessages(loadedMessages);
      setActiveConversationId(conversationId);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
      setActiveConversationId(null);
    }
  };

  const handleClearChat = async (conversationId: string) => {
    try {
      await deleteMessages(conversationId);
      setMessages([]);
      setActiveConversationId(null);
      await loadConversations();
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    setInput("");
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let convId = activeConversationId;
      if (!convId) {
        convId = Date.now().toString();
        setActiveConversationId(convId);
        await loadConversations();
      }

      const response = await sendMessageToChatbot(input, convId);
      if (!response.body) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "[Error: empty response]" },
        ]);
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        await new Promise((resolve) => setTimeout(resolve, 100));

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.trim().split("\n");

        for (const line of lines) {
          if (!line.trim().startsWith("data:")) continue;

          const jsonText = line.replace("data: ", "").trim();
          if (!jsonText) continue;

          try {
            const json = JSON.parse(jsonText);

            if (json.type === "content") {
              aiContent += json.content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "typing") {
                  return [
                    ...prev.slice(0, -1),
                    { role: "typing", content: aiContent },
                  ];
                }
                return [...prev, { role: "typing", content: aiContent }];
              });
            } else if (json.type === "done") {
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: "assistant", content: aiContent },
              ]);
              setLoading(false);
            } else if (json.type === "error") {
              console.error("Error desde backend:", json.content);
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `❌ Error: ${json.content}` },
              ]);
              setLoading(false);
            }
          } catch (err) {
            console.error("Error al parsear línea SSE:", err, line);
          }
        }
      }

      await loadConversations();
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "[Error connecting to Chatbot]" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    input,
    conversations,
    activeConversationId,
    setInput,
    handleSendMessage,
    handleNewChat,
    handleClearChat,
    handleLoadMessages,
  };
}
