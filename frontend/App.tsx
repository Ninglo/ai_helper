import { ChatUI } from './chatUI';
import { ChatService } from './service';
import { initializer, useChat } from './useChat';

const chatService = new ChatService();

const App = () => {
  const { chatState, dispatchChatAction } = useChat(chatService.channel, initializer());
  return <ChatUI chatState={chatState} dispatchChatAction={dispatchChatAction} />;
};

export default App;
