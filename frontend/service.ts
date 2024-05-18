import {
  appendNextQuestionPromptPrompt,
  appendSummaryPrompt,
  appendquestionPrompt,
} from "../common/prompt";
import { Bot, Chat } from "../common/struct";
import { EventChannel } from "./EventChannel";
import { postCompletion, putBot } from "./api";
import { clearLastRound } from "./clearLastRound";
import { Actions } from "./useChat";

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
};

type State = CreateStep1 | CreateStep2 | CreateStep3 | ChatState;

const DEFAULT_X = 3;

export class ChatService {
  public channel = new EventChannel<Actions>();

  public state = this.createState();

  constructor() {
    this.listen();
  }

  private createState(): State {
    const flag = true;
    return flag
      ? {
          type: "create1",
          doc: "",
          finished: true,
        }
      : {
          type: "chat",
          chat: {
            messages: [
              { role: "system", content: "hello" },
              { role: "user", content: "hi" },
            ],
          },
          input: "",
          finished: true,
        };
  }

  private listen() {
    this.channel.event((action) => {
      console.log(this.state);

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
        const newState: CreateStep2 = {
          type: "create2",
          n: 0,
          x: DEFAULT_X,
          answer: "",
          chat: newChat,
          finished: false,
        };

        state.finished = false;
        const chat = await postCompletion(newChat);
        newState.n++;
        newState.finished = true;
        newState.chat = chat;

        this.state = newState;
        this.channel.fire({
          type: "APIRespond",
          chat,
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
        const chat = await postCompletion(state.chat);

        state.n = state.n + 1;
        state.finished = true;
        state.chat = chat;

        this.state = state;
        this.channel.fire({
          type: "APIRespond",
          chat,
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
        const chat = appendSummaryPrompt(state.chat);
        const newChat = await postCompletion(chat);
        const prompt = newChat.messages.at(-1)!.content;
        const bot = await putBot(prompt);
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
        const chat = await postCompletion(state.chat);
        state.finished = true;
        state.chat = chat;

        this.state = state;
        this.channel.fire({
          type: "APIRespond",
          chat,
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
        throw new Error(`Illegal action, type: ${action.type}`);
    }
  }
}