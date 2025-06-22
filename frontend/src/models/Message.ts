export interface Message {
  type: "user" | "ai";
  content: string;
}
