import { Chat, Message } from "./struct";

const questionPrompt = `questionPrompt`;
const nextQuestionPrompt = `nextQuestionPrompt`;
const summaryPrompt = `summaryPrompt`;

export const appendquestionPrompt = (doc: string): Chat => {
  const content = `${questionPrompt} ${doc}`;
  return {
    messages: [{ role: "system", content }],
  };
};

export const appendNextQuestionPromptPrompt = (
  prevChat: Chat,
  answer: string
): Chat => {
  const content = `${answer} ${nextQuestionPrompt}`;
  const message: Message = { role: "user", content };
  return {
    messages: prevChat.messages.concat([message]),
  };
};

export const appendSummaryPrompt = (prevChat: Chat): Chat => {
  const message: Message = { role: "system", content: summaryPrompt };
  return {
    messages: prevChat.messages.concat([message]),
  };
};
