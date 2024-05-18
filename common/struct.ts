export type Bot = {
  id: string;
  chat: Chat;
};

export type Chat = {
    messages: Message[];
};

export type Role = 'system' | 'user' | 'assistant';
export type Message = {
    role: Role;
    content: string;
};
