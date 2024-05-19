import { FC } from 'react';
import './ChatUI.css'; // 假设样式代码在 ChatUI.css 文件中
import { type Message } from '../../common/struct';
import { ChatProps } from '../state/useChat';

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
            onKeyDown={e => e.key === 'Enter' && dispatchChatAction({ type: 'submit' })}
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
        return <div>
            <div>
                Create bot success!
            </div>
            <div>
                <a href={bot.link}>{bot.link}</a>
            </div>
        </div>;
    }

    return (
        <div className="chat-ui">
            <div className="message-list">
                {messages.filter(filtMessage).map((message, index) => (
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

const inTest = true;
const filtMessage = (message: Message) => {
    if (inTest) {
        return true;
    } else {
        return message.role !== 'system';
    }
};
