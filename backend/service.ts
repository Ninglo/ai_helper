import { Bot } from "../common/struct";

export interface IBotService {
  get(bot: Pick<Bot, "id">): Promise<Bot>;
  put(bot: Omit<Bot, "id">): Promise<Bot>;
}
