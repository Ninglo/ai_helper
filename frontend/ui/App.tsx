import { ChatUI } from './chatUI';
import { useChat, initializer } from '../state/useChat';
import { ChatService } from '../state/service';

const chatService = new ChatService();

const App = () => {
  const { chatState, dispatchChatAction } = useChat(chatService.channel, initializer());
  return <ChatUI chatState={chatState} dispatchChatAction={dispatchChatAction} />;
};

export default App;
