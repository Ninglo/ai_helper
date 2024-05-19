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
  const { body } = await fetch(`${baseURL}/completion`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chat),
  });

  const reader = body?.getReader();
  if (!reader) {
    return;
  }

  let messageContent = "";
  let cache = "";
  while (true) {
    const content = await reader.read();
    if (content?.done) {
      console.log("done1");
      return;
    }

    const str = new TextDecoder().decode(content.value);
    if (str.includes("event:done")) {
      const [prev] = str.split("event:done");
      cache += prev;

      const message = handleEvent(cache);
      if (!message) {
        return;
      }

      messageContent += message.content;
      message.content = messageContent;
      cb(message);

      cache = "";
      console.log("done2");
      return;
    } else if (str.startsWith("event:message")) {
      const message = handleEvent(cache);
      if (!message) {
        continue;
      }

      messageContent += message.content;
      message.content = messageContent;
      cb(message);

      cache = str;
    } else {
      cache += str;
    }
  }
};

function handleEvent(event: string): Message | undefined {
  if (!event) {
    return;
  }

  const text = event
    .split("\n")
    .find((str) => str.startsWith("data:"))
    ?.split("data:")[1];
  if (!text) {
    return;
  }

  const message = JSON.parse(text).message;
  console.log(message.content);
  if (message.type === "answer") return message;
}
