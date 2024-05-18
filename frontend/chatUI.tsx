import { FC } from 'react';
import './ChatUI.css'; // 假设样式代码在 ChatUI.css 文件中
import { ChatProps } from './useChat';
import { type Message } from '../common/struct';

// 聊天消息组件
const Message: FC<Message> = ({ content, role }) => (
    <div className={`message ${role}`}>
        <div className="content">{content}</div>
    </div>
);

// 输入区域组件
const ChatInput: FC<ChatProps> = ({ chatState, dispatchChatAction }) => (
    <div className="chat-input">
        <input
            type="text"
            onChange={e => dispatchChatAction({ type: 'input', input: e.target.value })}
            value={chatState.input}
            placeholder="Type a message..."
        />
        <button onClick={() => dispatchChatAction({ type: 'submit' })}>Send</button>
    </div>
);

// ChatUI 组件
export const ChatUI: FC<ChatProps> = ({ chatState, dispatchChatAction }) => {
    const { messages, loading, bot } = chatState;

    if (bot) {
        return <div>Create {bot.id} success!</div>
    }

    return (
        <div className="chat-ui">
            <div className="message-list">
                {messages.filter(message => message.role !== 'system').map((message, index) => (
                    <Message
                        key={index}
                        role={message.role}
                        content={message.content}
                    />
                ))}
            </div>
            {loading && <div className="loading">Sending...</div>}
            <ChatInput chatState={chatState} dispatchChatAction={dispatchChatAction} />
        </div>
    );
};
