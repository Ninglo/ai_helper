export type Bot = {
    id: string;
    prompt: string;
};

export type Chat = {
    messages: Message[];
};

export type Role = 'system' | 'user' | 'assistant';
export type Message = {
    role: Role;
    content: string;
};

export interface IBotService {
    get(bot: Pick<Bot, 'id'>): Bot;
    put(bot: Omit<Bot, 'id'>): Bot;
}

export interface ICompletionService {
    post(chat: Chat): Chat;
}
