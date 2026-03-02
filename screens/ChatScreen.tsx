import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { sendToN8n } from "../services/n8nService";
import {
  ChatMessage,
  MessageContent,
  QuickReply,
} from "../types/chat";

import { MessageBubble } from "../components/chat/MessageBubble";
import { QuickReplies } from "../components/chat/QuickReplies";
import { RiskBadge } from "../components/chat/RiskBadge";
import { RedFlagCard } from "../components/chat/RedFlagCard";
import { WaterTracker } from "../components/chat/WaterTracker";
import { ConditionCard } from "../components/chat/ConditionCard";
import { SuggestionCards } from "../components/chat/SuggestionCards";

// ─── Initial greeting ─────────────────────────────────────────────────────────

const GREETING: ChatMessage = {
  id: "init",
  role: "bot",
  content: {
    type: "quick-replies",
    text: "👋 Hi! I'm your AI Health Assistant \n\nI can help you analyze symptoms, assess risk levels, and provide evidence-based wellness guidance.\n\nHow can I help you today?",
    replies: [
      {
        id: "q1",
        label: "🩺 Analyze Symptoms",
        value: "I have symptoms I want to analyze",
      },
      {
        id: "q2",
        label: "🧘 Stress & Lifestyle",
        value: "Give me stress reduction and lifestyle tips",
      },
      {
        id: "q3",
        label: "🥗 Nutrition & Sleep",
        value: "Show me nutrition and sleep optimization guidance",
      },
      {
        id: "q4",
        label: "💊 Diet & Meds Guide",
        value: "Show diet and medication guidance for a condition",
      },
      {
        id: "q5",
        label: "💧 Water Tracker",
        value: "Open the daily water tracker",
      },
    ],
  },
  timestamp: new Date(),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _uid = 0;
const uid = (prefix: string) => `${prefix}-${++_uid}-${Date.now()}`;

const sessionId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function extractText(content: MessageContent): string {
  if (content.type === "text") return content.text;
  if (content.type === "quick-replies") return content.text;
  return "";
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: "#1E3A5F",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 14 }}>🤖</Text>
      </View>
      <View
        style={{
          backgroundColor: "#0D1526",
          borderRadius: 16,
          borderBottomLeftRadius: 4,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(
    (GREETING.content as { replies: QuickReply[] }).replies
  );

  // ── Scroll helpers ────────────────────────────────────────────────────────

  const scrollToEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  // ── Message dispatch ──────────────────────────────────────────────────────

  const appendMessages = useCallback((incoming: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...incoming]);
    scrollToEnd();
  }, []);

  const buildBotMessages = useCallback(
    (contents: MessageContent[]): [ChatMessage[], QuickReply[]] => {
      const msgs: ChatMessage[] = contents.map((c) => ({
        id: uid("bot"),
        role: "bot",
        content: c,
        timestamp: new Date(),
      }));

      const lastQR = [...contents]
        .reverse()
        .find((c) => c.type === "quick-replies");

      const replies =
        lastQR && lastQR.type === "quick-replies" ? lastQR.replies : [];

      return [msgs, replies];
    },
    []
  );

  // ── Send ──────────────────────────────────────────────────────────────────

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: uid("user"),
        role: "user",
        content: { type: "text", text: trimmed },
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setQuickReplies([]);
      setLoading(true);
      scrollToEnd();

      // Build history for n8n context (last 20 text messages)
      const history = messages
        .filter(
          (m) =>
            m.content.type === "text" || m.content.type === "quick-replies"
        )
        .slice(-20)
        .map((m) => ({ role: m.role, text: extractText(m.content) }));

      try {
        const contents = await sendToN8n({ sessionId, message: trimmed, history });
        const [botMsgs, replies] = buildBotMessages(contents);
        appendMessages(botMsgs);
        setQuickReplies(replies);
      } catch (err) {
        const errMsg: ChatMessage = {
          id: uid("err"),
          role: "bot",
          content: {
            type: "text",
            text: "⚠️ Couldn't reach the server. Please check your n8n webhook URL in constants/config.ts and try again.",
          },
          timestamp: new Date(),
        };
        appendMessages([errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, buildBotMessages, appendMessages]
  );

  const handleQuickReply = useCallback(
    (r: QuickReply) => send(r.value),
    [send]
  );

  // ── Message renderer ──────────────────────────────────────────────────────

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => {
    const { content } = item;
    switch (content.type) {
      case "text":
      case "quick-replies":
        return <MessageBubble message={item} />;
      case "risk-assessment":
        return <RiskBadge level={content.level} summary={content.summary} />;
      case "red-flag":
        return <RedFlagCard data={content.data} />;
      case "water-tracker":
        return <WaterTracker target={content.target} />;
      case "condition-card":
        return <ConditionCard data={content.data} />;
      case "suggestion-cards":
        return <SuggestionCards intro={content.intro} cards={content.cards} />;
      default:
        return null;
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#030A23" }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* ── Header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 13,
            borderBottomWidth: 1,
            borderBottomColor: "#0D1526",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#E2E8F0" />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: "center" }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#22C55E",
                }}
              />
              <Text
                style={{ color: "#F1F5F9", fontWeight: "700", fontSize: 16 }}
              >
                AI Health Assistant
              </Text>
            </View>
            <Text style={{ color: "#6B7280", fontSize: 11, marginTop: 1 }}>
              Powered by n8n · Evidence-based
            </Text>
          </View>

          {/* Placeholder to centre the title */}
          <View style={{ width: 24 }} />
        </View>

        {/* ── Message list ── */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />

        {/* ── Quick replies ── */}
        {quickReplies.length > 0 && !loading && (
          <QuickReplies replies={quickReplies} onSelect={handleQuickReply} />
        )}

        {/* ── Input bar ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: Platform.OS === "ios" ? 12 : 16,
            borderTopWidth: 1,
            borderTopColor: "#0D1526",
            gap: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#0D1526",
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 10,
              minHeight: 44,
              maxHeight: 120,
              justifyContent: "center",
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Describe your symptoms..."
              placeholderTextColor="#374151"
              style={{ color: "#F1F5F9", fontSize: 14, lineHeight: 20 }}
              multiline
              blurOnSubmit={false}
            />
          </View>

          <TouchableOpacity
            onPress={() => send(input)}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor:
                input.trim() && !loading ? "#3B82F6" : "#0D1526",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="send"
              size={18}
              color={input.trim() && !loading ? "#fff" : "#374151"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
