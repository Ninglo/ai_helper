import { Chat } from "../common/struct";
import { createBotAPI } from "./api/createBotAPI";
import { publish } from "./api/publish";
import { updatePrompt } from "./api/updatePrompt";

export function chatToPrompt({ messages }: Chat): string {
  return messages
    .map(
      ({ role, content }) => `${role}:
${content}`
    )
    .join("\n\n");
}

export async function createBot(chat: Chat) {
  const bot = await createBotAPI();
  const id = bot.data.bot_id;
  await updatePrompt(id, chatToPrompt(chat));
  const result = await publish(id);
  const link = result.data.publish_result[10000122].connector.share_link;
  return {
    id,
    link,
    chat,
  };
}
