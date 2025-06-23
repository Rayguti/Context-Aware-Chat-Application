import "./ChatBox.css";
import { Link } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
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

  const downloadMarkdown = () => {
    const markdownContent = messages
      .map((msg) => {
        const role = msg.role === "user" ? "**User**" : "**Assistant**";
        return `${role}:\n\n${msg.content}\n`;
      })
      .join("\n---\n\n");

    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "conversation.md";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div id="root">
      {/* Health */}
      <button className="go-health-button">
        <Link to="/health">Health Page</Link>
      </button>

      {/* Chatbot */}
      <div className="chatbot-container">
        <button onClick={downloadMarkdown} className="chatbot-download-button">
          ⬇ Markdown
        </button>

        <button className="new-chat-button" onClick={handleNewChat}>
          <strong>New conversation</strong>
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
    </div>
  );
}

export default ChatBox;
