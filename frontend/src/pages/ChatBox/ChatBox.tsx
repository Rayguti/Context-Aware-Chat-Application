import { useEffect, useState } from "react";
import "./ChatBox.css";
import { Link } from "react-router-dom";
import type { Message } from "../../models/Message";
import type { Conversations } from "../../models/Conversations";
import { sendMessageToChatbot } from "../../services/chatService";
import { fetchConversations } from "../../services/chatService";

function ChatBox() {
  const [conversations, setConversations] = useState<Conversations>();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const loadConversations = async () => {
    try {
      const conversations = await fetchConversations();
      setConversations(conversations);
      console.log("Conversations loaded:", conversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return; //if the message is empty, do nothing

    const userMessage: Message = { role: "user", content: input };

    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setLoading(true);

    try {
      let convId = activeConversationId;

      if (!convId) {
        convId = Date.now().toString();
        setActiveConversationId(convId);
        loadConversations();
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

        //this line is just improve the typing effect
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

              //This is to update the last message with the typing indicator
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

      setLoading(false);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "[Error connecting to Chatbot] " },
      ]);
      setLoading(false);
      return;
    }
  };

  return (
    <div id="root">
      {/* Health */}
      <div className="go-health-button">
        <Link to="/health">Health Page</Link>
      </div>

      {/* Chatbot */}
      <div className="chatbot-container">
        <h1 className="chatbot-title">Chatbot PDF</h1>
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chatbot-message ${
                msg.role === "user"
                  ? "user-message"
                  : msg.role === "assistant"
                  ? "ai-message"
                  : "ai-typing"
              }`}
            >
              <span>{msg.content}</span>
            </div>
          ))}
          {loading && <p className="chatbot-loading">AI is typing...</p>}
        </div>

        <div className="chatbot-input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            className="chatbot-input"
          />
          <button onClick={sendMessage} className="chatbot-send-button">
            Send
          </button>
        </div>

        <button
          onClick={() => {
            setMessages([]);
            localStorage.removeItem("chat-history");
          }}
          className="chatbot-clear-button"
        >
          Clear Chat
        </button>
      </div>

      {/* History */}
      <div className="chat-history-panel">
        <h2>History</h2>
        <div className="chat-history-messages">
          {Object.entries(conversations ?? {}).map(([id, messages]) => {
            const firstMessage =
              messages.length > 0 ? messages[0].content : "No messages";

            return (
              <button
                key={id}
                className={activeConversationId === id ? "history-active" : ""}
                onClick={() => {
                  setActiveConversationId(id);
                  setMessages(messages);
                }}
              >
                <strong>{firstMessage}</strong>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
