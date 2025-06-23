import "./ChatBox.css";
import { Link } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { downloadMarkdown } from "../../utils/downloadMessages";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ChatBox() {
  const {
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
  } = useChat();

  return (
    <div id="root">
      {/* Health */}
      <button className="go-health-button">
        <Link to="/health">Health Page</Link>
      </button>

      {/* Chatbot */}
      <div className="chatbot-container">
        <button
          onClick={() => downloadMarkdown(messages)}
          className="chatbot-download-button"
        >
          ⬇ Markdown
        </button>

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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
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
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            className="chatbot-input"
          />
          <button onClick={handleSendMessage} className="chatbot-send-button">
            Send
          </button>
        </div>

        <button
          onClick={() => {
            handleClearChat(activeConversationId ?? "");
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
                  handleLoadMessages(id);
                }}
              >
                <strong>{firstMessage}</strong>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Conversation Button */}
      <button className="new-chat-button" onClick={handleNewChat}>
        <strong>New conversation</strong>
      </button>
    </div>
  );
}

export default ChatBox;
