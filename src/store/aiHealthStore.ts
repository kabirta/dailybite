import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  listAIChatMessages,
  listAIChats,
  regenerateAIChatMessage,
  sendAIChatMessage,
} from "../services/backendApi";

export type AIChat = {
  _id: string;
  title: string;
  category: string;
  lastMessageAt: string;
};

export type AIMessage = {
  _id: string;
  chat: string;
  role: "user" | "assistant" | "system";
  content: string;
  status?: string;
  ai?: {
    urgency?: string;
    redFlags?: string[];
  };
  createdAt: string;
};

type ChatPage = {
  items: AIMessage[];
  hasMore: boolean;
  page: number;
};

type AIHealthState = {
  chats: AIChat[];
  activeChatId: string | null;
  messagesByChat: Record<string, AIMessage[]>;
  hasMoreByChat: Record<string, boolean>;
  isLoading: boolean;
  isSending: boolean;
  error: string;
  hydrateChats: () => Promise<void>;
  loadMessages: (chatId: string, page?: number) => Promise<void>;
  sendMessage: (message: string, category?: string) => Promise<void>;
  regenerateLastUserMessage: () => Promise<void>;
  setActiveChat: (chatId: string | null) => void;
};

function normalizeMessage(message: any): AIMessage {
  return {
    _id: String(message._id),
    chat: String(message.chat),
    role: message.role,
    content: String(message.content ?? ""),
    status: message.status,
    ai: message.ai,
    createdAt: String(message.createdAt ?? new Date().toISOString()),
  };
}

function dedupeMessages(messages: AIMessage[]) {
  const map = new Map<string, AIMessage>();
  messages.forEach((message) => map.set(message._id, message));
  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export const useAIHealthStore = create<AIHealthState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,
      messagesByChat: {},
      hasMoreByChat: {},
      isLoading: false,
      isSending: false,
      error: "",

      setActiveChat: (chatId) => set({ activeChatId: chatId }),

      hydrateChats: async () => {
        set({ isLoading: true, error: "" });
        try {
          const page = await listAIChats({ page: 1, limit: 20 });
          const chats = Array.isArray(page?.items) ? page.items : [];
          const activeChatId = get().activeChatId ?? chats[0]?._id ?? null;
          set({ chats, activeChatId, isLoading: false });
          if (activeChatId) {
            await get().loadMessages(activeChatId);
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Could not load AI chat.",
            isLoading: false,
          });
        }
      },

      loadMessages: async (chatId, page = 1) => {
        set({ isLoading: true, error: "" });
        try {
          const result: ChatPage = await listAIChatMessages(chatId, { page, limit: 30 });
          const incoming = (Array.isArray(result?.items) ? result.items : []).map(normalizeMessage);
          set((state) => ({
            messagesByChat: {
              ...state.messagesByChat,
              [chatId]: dedupeMessages([...(state.messagesByChat[chatId] ?? []), ...incoming]),
            },
            hasMoreByChat: { ...state.hasMoreByChat, [chatId]: Boolean(result?.hasMore) },
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Could not load messages.",
            isLoading: false,
          });
        }
      },

      sendMessage: async (message, category = "general") => {
        if (get().isSending) return;

        const tempId = `local-${Date.now()}`;
        const currentChatId = get().activeChatId;
        const optimisticChatId = currentChatId ?? "new";
        const optimistic: AIMessage = {
          _id: tempId,
          chat: optimisticChatId,
          role: "user",
          content: message,
          createdAt: new Date().toISOString(),
          status: "sent",
        };

        set((state) => ({
          isSending: true,
          error: "",
          messagesByChat: {
            ...state.messagesByChat,
            [optimisticChatId]: [...(state.messagesByChat[optimisticChatId] ?? []), optimistic],
          },
        }));

        try {
          const result = await sendAIChatMessage({ chatId: currentChatId, message, category });
          const chat = result.chat;
          const userMessage = normalizeMessage(result.userMessage);
          const assistantMessage = normalizeMessage(result.assistantMessage);
          const chatId = String(chat._id);

          set((state) => {
            const previous = currentChatId
              ? state.messagesByChat[currentChatId] ?? []
              : state.messagesByChat.new ?? [];
            const cleaned = previous.filter((item) => item._id !== tempId);

            return {
              chats: [chat, ...state.chats.filter((item) => item._id !== chatId)],
              activeChatId: chatId,
              messagesByChat: {
                ...state.messagesByChat,
                new: currentChatId ? state.messagesByChat.new : [],
                [chatId]: dedupeMessages([...cleaned, userMessage, assistantMessage]),
              },
              isSending: false,
            };
          });
        } catch (error) {
          set((state) => ({
            error: error instanceof Error ? error.message : "Could not send message.",
            isSending: false,
            messagesByChat: {
              ...state.messagesByChat,
              [optimisticChatId]: (state.messagesByChat[optimisticChatId] ?? []).filter(
                (item) => item._id !== tempId
              ),
            },
          }));
        }
      },

      regenerateLastUserMessage: async () => {
        const chatId = get().activeChatId;
        if (!chatId || get().isSending) return;

        const messages = get().messagesByChat[chatId] ?? [];
        const lastUser = [...messages].reverse().find((message) => message.role === "user");
        if (!lastUser) return;

        set({ isSending: true, error: "" });
        try {
          const result = await regenerateAIChatMessage({ chatId, messageId: lastUser._id });
          const assistantMessage = normalizeMessage(result.assistantMessage);
          set((state) => ({
            messagesByChat: {
              ...state.messagesByChat,
              [chatId]: dedupeMessages([...(state.messagesByChat[chatId] ?? []), assistantMessage]),
            },
            isSending: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Could not regenerate response.",
            isSending: false,
          });
        }
      },
    }),
    {
      name: "nutrimed.ai-health-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        chats: state.chats,
        activeChatId: state.activeChatId,
        messagesByChat: state.messagesByChat,
        hasMoreByChat: state.hasMoreByChat,
      }),
    }
  )
);
