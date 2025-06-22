import { useEffect, useRef, useState } from "react";
import "./ChatBox.css";
import { Link } from "react-router-dom";
import type { Message } from "../../models/Message";
import type { Conversation } from "../../models/Conversation";
import { sendMessageToChatbot } from "../../services/chatService";

function ChatBox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // const controllerRef = useRef<AbortController | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return; //if the message is empty, do nothing

    const userMessage: Message = { type: "user", content: input };

    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setLoading(true);

    //this catch is to handle any errors that might occur during the fetch request
    //primarily network errors or issues with the backend service
    try {
      // If there's an active conversation, use its ID; otherwise, create a new one
      // the convId is used to avoid problems with the fetch in "activeConversationId"
      let convId = activeConversationId;
      if (!convId) {
        convId = Date.now().toString();
        setActiveConversationId(convId);
      }
      //TODO: this has to be a service call to the backend
      const response = await sendMessageToChatbot(input, convId);

      if (!response.body) {
        setMessages((prev) => [
          ...prev,
          { type: "ai", content: "[Error: empty response]" },
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

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.trim().split("\n");

        // console.log(lines);

        for (const line of lines) {
          if (!line.trim().startsWith("data:")) continue;

          const jsonText = line.replace("data: ", "").trim();
          if (!jsonText) continue;

          try {
            const json = JSON.parse(jsonText);

            if (json.type === "content") {
              aiContent += json.content;
            } else if (json.type === "done") {
              setMessages((prev) => [
                ...prev,
                { type: "ai", content: aiContent },
              ]);
              setLoading(false);
            } else if (json.type === "error") {
              console.error("Error desde backend:", json.content);
              setMessages((prev) => [
                ...prev,
                { type: "ai", content: `❌ Error: ${json.content}` },
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
        { type: "ai", content: "[Error connecting to Chatbot] " },
      ]);
      setLoading(false);
      return;
    }
  };

  return (
    <div id="root">
      <div className="go-health-button">
        <Link to="/health">Health Page</Link>
      </div>

      <div className="chatbot-container">
        <h1 className="chatbot-title">Chatbot PDF</h1>
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chatbot-message ${
                msg.type === "user" ? "user-message" : "ai-message"
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
                e.preventDefault(); // evita que el enter haga submit o salte de línea
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

      {/* Panel de historial */}
      <div className="chat-history-panel">
        <h2>History</h2>
        <div className="chat-history-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`history-msg ${msg.type}`}>
              <strong>{msg.type === "user" ? "👤" : "🤖"}:</strong>{" "}
              {msg.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
