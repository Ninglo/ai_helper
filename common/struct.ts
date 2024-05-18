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
