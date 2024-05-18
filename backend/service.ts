import { Bot, Chat } from "../common/struct";

export interface IBotService {
  get(bot: Pick<Bot, "id">): Promise<Bot>;
  put(bot: Omit<Bot, "id">): Promise<Bot>;
}

export interface ICompletionService {
  post(chat: Chat): Promise<Chat>;
}
