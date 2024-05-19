import { Chat } from "../common/struct";

// TODO

export function chatToPrompt({ messages }: Chat): string {
  return messages
    .map(
      ({ role, content }) => `${role}:
${content}`
    )
    .join("\n\n");
}
