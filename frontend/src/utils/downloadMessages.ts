import type { Message } from "../models/Message";

export function downloadMarkdown(messages: Message[]) {
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
}
