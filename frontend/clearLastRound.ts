import { Message } from '../common/struct';

export function clearLastRound(messages: Message[]): Message[] {
    return messages.slice(0, messages.length - 2);
}
