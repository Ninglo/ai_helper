import { mergeDeepRight } from "ramda";
import { Actions } from "./useChat";
import {
  appendquestionPrompt,
  appendNextQuestionPromptPrompt,
} from "../../common/prompt";
import { Chat, Bot } from "../../common/struct";
import { EventChannel } from "../utils/EventChannel";
import { postCompletion, putBot, getBot } from "../utils/api";
import { clearLastRound } from "../utils/clearLastRound";

type CreateStep1 = {
  type: "create1";
  doc: string;
  finished: boolean;
};

type CreateStep2 = {
  type: "create2";
  n: number;
  x: number;
  answer: string;
  chat: Chat;
  finished: boolean;
};

type CreateStep3 = {
  type: "create3";
  chat: Chat;
  bot?: Bot;
  finished: boolean;
};

type ChatState = {
  type: "chat";
  chat: Chat;
  input: string;
  finished: boolean;
  queryId: string;
  inited: boolean;
};

type State = CreateStep1 | CreateStep2 | CreateStep3 | ChatState;

const DEFAULT_X = 1;

export class ChatService {
  public channel = new EventChannel<Actions>();

  public state: State;

  constructor() {
    this.listen();
    this.state = this.createState();
  }

  private createState(): State {
    const queryId = new URL(location.href).searchParams.get("id");
    if (!queryId) {
      return {
        type: "create1",
        doc: "",
        finished: true,
      };
    }

    const state: State = {
      type: "chat",
      chat: { messages: [] },
      input: "",
      finished: true,
      queryId,
      inited: false,
    };
    return state;
  }

  private listen() {
    this.channel.event((action) => {
      switch (this.state.type) {
        case "chat":
          this.handleChat(this.state, action);
          break;

        case "create1":
          this.handleStep1(this.state, action);
          break;

        case "create2":
          this.handleStep2(this.state, action);
          break;

        case "create3":
          this.handleStep3(this.state, action);
          break;
      }
    });
  }

  private async handleStep1(
    state: CreateStep1,
    action: Actions
  ): Promise<void> {
    switch (action.type) {
      case "input":
        state.doc = action.input;
        this.state = state;
        return;

      case "submit":
        const newChat = appendquestionPrompt(state.doc);
        const newMessages = newChat.messages;
        const newState: CreateStep2 = {
          type: "create2",
          n: 0,
          x: DEFAULT_X,
          answer: "",
          chat: newChat,
          finished: false,
        };

        this.state = newState;
        await postCompletion(newChat, (message) => {
          const chat = {
            messages: newMessages.concat([message]),
          };
          this.state = mergeDeepRight(newState, { chat });
          this.channel.fire({
            type: "APIRespond",
            chat,
            finish: false,
          });
        });

        this.state.n++;
        this.state.finished = true;
        this.channel.fire({
          type: "APIRespond",
          chat: this.state.chat,
          finish: true,
        });
        return;

      case "cancel":
      case "APIRespond":
        console.log(this.state);
        throw new Error(`Illegal action, type: ${action.type}`);
    }
  }

  private async handleStep2(
    state: CreateStep2,
    action: Actions
  ): Promise<void> {
    switch (action.type) {
      case "input": {
        state.answer = action.input;
        this.state = state;
        return;
      }

      case "submit": {
        if (state.n >= state.x) {
          const newState: CreateStep3 = {
            type: "create3",
            chat: state.chat,
            finished: false,
            bot: undefined,
          };
          this.state = newState;
          this.channel.fire({
            type: "submit",
          });
          return;
        }

        state.finished = false;
        state.chat = appendNextQuestionPromptPrompt(state.chat, state.answer);
        const prevChat = state.chat;
        const prevMessage = prevChat.messages;
        this.state = state;
        await postCompletion(prevChat, (message) => {
          const chat = {
            messages: prevMessage.concat([message]),
          };
          this.state = mergeDeepRight(state, { chat });
          this.channel.fire({
            type: "APIRespond",
            chat,
            finish: false,
          });
        });

        this.state.n++;
        this.state.finished = true;
        this.channel.fire({
          type: "APIRespond",
          chat: this.state.chat,
          finish: true,
        });
        return;
      }

      case "cancel": {
        const { messages } = state.chat;
        state.chat.messages = clearLastRound(messages);
        state.finished = true;
        this.state = state;
        return;
      }

      case "APIRespond":
        return;
    }
  }

  private async handleStep3(
    state: CreateStep3,
    action: Actions
  ): Promise<void> {
    switch (action.type) {
      case "input":
      case "cancel":
      case "APIRespond":
        throw new Error(`Illegal action, type: ${action.type}`);

      case "submit": {
        const bot = await putBot(state.chat);
        state.bot = bot;
        this.channel.fire({
          type: "getBot",
          bot,
        });
      }
    }
  }

  private async handleChat(state: ChatState, action: Actions): Promise<void> {
    switch (action.type) {
      case "input":
        state.input = action.input;
        this.state = state;
        return;

      case "submit": {
        state.finished = false;
        state.chat.messages.push({
          role: "user",
          content: state.input,
        });
        const prevChat = state.chat;
        const prevMessage = prevChat.messages;
        this.state = state;
        await postCompletion(prevChat, (message) => {
          const chat = {
            messages: prevMessage.concat([message]),
          };
          this.state = mergeDeepRight(state, { chat });
          this.channel.fire({
            type: "APIRespond",
            chat,
            finish: false,
          });
        });

        this.state.finished = true;
        this.channel.fire({
          type: "APIRespond",
          chat: this.state.chat,
          finish: true,
        });
        return;
      }

      case "cancel": {
        const { messages } = state.chat;
        state.chat.messages = clearLastRound(messages);
        state.finished = true;
        this.state = state;
        return;
      }

      case "APIRespond":
        return;
    }
  }
}
