export interface Message {
  role: "user" | "assistant" | "typing";
  content: string;
}
