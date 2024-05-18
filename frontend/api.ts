import { Bot, Chat } from "../common/struct";

const baseURL = "/api";

export const getBot = async (id: string): Promise<Bot> => {
  const res = await fetch(`${baseURL}/bot/${id}`, { method: "GET" });
  return res.json();
};

export const putBot = async (prompt: string): Promise<Bot> => {
  const res = await fetch(`${baseURL}/bot`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });
  return res.json();
};

export const postCompletion = async (chat: Chat): Promise<Chat> => {
  const res = await fetch(`${baseURL}/completion`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chat),
  });
  return res.json();
};
