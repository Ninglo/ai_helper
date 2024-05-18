import { Dispatch, Reducer, useReducer } from "react";
import { Bot, Chat, Message } from "../common/struct";
import { EventChannel } from "./EventChannel";

export type ChatState = {
  messages: Message[];
  input: string;
  loading: boolean;
  bot?: Bot;
};

export function initializer(): ChatState {
  return {
    messages: [],
    input: "",
    loading: false,
  };
}

export type Actions =
  | {
      type: "input";
      input: string;
    }
  | {
      type: "submit";
    }
  | {
      type: "cancel";
    }
  | {
      type: "APIRespond";
      chat: Chat;
      finish: boolean;
    }
  | {
      type: "getBot";
      bot: Bot;
    };

const reducer: Reducer<ChatState, Actions> = (state, action) => {
  switch (action.type) {
    case "input":
      return { ...state, input: action.input } satisfies ChatState;

    case "submit": {
      if (state.loading || !state.input) {
        return state;
      }

      const messages = state.messages.concat([
        { role: "user", content: state.input },
        { role: "assistant", content: "\u00a0" },
      ]);
      return { messages, input: "", loading: true } satisfies ChatState;
    }

    case "cancel": {
      const prevMessages = state.messages;
      const messages = prevMessages.slice(0, prevMessages.length - 1);
      return { ...state, messages } satisfies ChatState;
    }

    case "APIRespond":
      return {
        ...state,
        messages: action.chat.messages,
        loading: !action.finish,
      } satisfies ChatState;

    case "getBot":
      return {
        ...state,
        bot: action.bot,
      };
  }
};

export type ChatProps = {
  chatState: ChatState;
  dispatchChatAction: Dispatch<Actions>;
};

export const useChat = (channel: EventChannel<Actions>, state: ChatState) => {
  const [chatState, _dispatchChatAction] = useReducer(reducer, state);
  channel.event(_dispatchChatAction);
  const dispatchChatAction: Dispatch<Actions> = (actions) => {
    channel.fire(actions);
    _dispatchChatAction(actions);
  };

  return { chatState, dispatchChatAction };
};
