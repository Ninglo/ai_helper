import { Chat, Message } from "./struct";

const questionPrompt = `基于上方给定文章的内容，请问你有哪些疑问或者不理解的地方？请首先给出你对文章大意的认识，并提出一个你不甚了解，并有助于涉及文章核心观点认识的问题。`;
const nextQuestionPrompt = `根据你对上述文章以及相关问答的阅读，你可能已经对文章的主旨和某些细节有了一定的理解。那么，有没有新的疑问浮现在你的脑海中？`;
// const summaryPrompt = `作为AI“课代表”，我现在将基于你所阅读的“利用AI降低读者提问成本”的文章和之前的问答环节，为你总结文章的核心观点以及我们讨论过的关键问题。请注意，这一总结将包括文章中提出的AI在教育领域中的应用，以及AI如何帮助降低读者提问的成本，同时也会涵盖我们交流中出现的有关AI可靠性、准确性和个性化响应的问题。`;

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

// export const appendSummaryPrompt = (prevChat: Chat): Chat => {
//   const message: Message = { role: "system", content: summaryPrompt };
//   return {
//     messages: prevChat.messages.concat([message]),
//   };
// };
