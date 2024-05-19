import { SSE } from "sse.js";
import { Bot, Chat, Message } from "../common/struct";

const baseURL = "/api";

export const getBot = async (id: string): Promise<Bot> => {
  const res = await fetch(`${baseURL}/bot/${id}`, { method: "GET" });
  return res.json();
};

export const putBot = async (chat: Chat): Promise<Bot> => {
  const res = await fetch(`${baseURL}/bot`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chat }),
  });
  return res.json();
};

export const postCompletion = async (
  chat: Chat,
  cb: (message: Message) => unknown
): Promise<void> => {
  const event = new SSE(`${baseURL}/completion`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(chat),
    start: false,
  });

  return new Promise((resolve) => {
    let content = "";
    event.addEventListener("message", (e: { type: string; data: string }) => {
      const message = JSON.parse(e.data).message satisfies Message;
      if (message.type !== "answer") {
        return;
      }

      content += message.content;
      message.content = content;
      cb(message);
    });
    event.addEventListener("done", () => resolve());
    event.stream();
  });
};
