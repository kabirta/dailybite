import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";

import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";
import { AIMessage, useAIHealthStore } from "../src/store/aiHealthStore";

const DISCLAIMER = "This assistant is not a replacement for professional medical advice.";

const QUICK_ACTIONS = [
  { label: "Symptoms", value: "I have symptoms I want to analyze", category: "symptoms" },
  { label: "Stress", value: "Help me understand my stress and lifestyle habits", category: "stress" },
  { label: "Nutrition", value: "Analyze my nutrition, hydration, and sleep habits", category: "nutrition" },
  { label: "Medication", value: "Explain medication safety basics and what I should ask my doctor", category: "medication" },
];

function TypingIndicator() {
  return (
    <View style={{ alignSelf: "flex-start", marginHorizontal: 16, marginVertical: 8 }}>
      <View
        style={{
          backgroundColor: SCREEN_COLORS.card,
          borderColor: SCREEN_COLORS.border,
          borderWidth: 1,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <ActivityIndicator color={SCREEN_COLORS.primary} />
      </View>
    </View>
  );
}

function SafetyBanner({ message }: { message: AIMessage }) {
  const urgency = message.ai?.urgency;
  const redFlags = message.ai?.redFlags ?? [];

  if (urgency !== "emergency" && urgency !== "urgent" && redFlags.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#F97316",
        backgroundColor: "#FFF7ED",
        padding: 12,
      }}
    >
      <Text style={{ color: "#9A3412", fontWeight: "800", marginBottom: 4 }}>
        Safety notice
      </Text>
      <Text style={{ color: "#9A3412", fontSize: 12, lineHeight: 17 }}>
        This may need urgent professional attention. If symptoms feel severe or dangerous, contact local emergency services.
      </Text>
    </View>
  );
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === "user";

  return (
    <>
      {!isUser ? <SafetyBanner message={message} /> : null}
      <View
        style={{
          alignSelf: isUser ? "flex-end" : "flex-start",
          maxWidth: "86%",
          marginHorizontal: 16,
          marginVertical: 6,
          borderRadius: 18,
          borderBottomRightRadius: isUser ? 4 : 18,
          borderBottomLeftRadius: isUser ? 18 : 4,
          paddingHorizontal: 14,
          paddingVertical: 10,
          backgroundColor: isUser ? SCREEN_COLORS.primary : SCREEN_COLORS.card,
          borderWidth: isUser ? 0 : 1,
          borderColor: SCREEN_COLORS.border,
        }}
      >
        {isUser ? (
          <Text style={{ color: "#fff", fontSize: 14, lineHeight: 20 }}>{message.content}</Text>
        ) : (
          <Markdown
            style={{
              body: { color: SCREEN_COLORS.text, fontSize: 14, lineHeight: 21 },
              bullet_list: { color: SCREEN_COLORS.text },
              ordered_list: { color: SCREEN_COLORS.text },
              strong: { color: SCREEN_COLORS.text, fontWeight: "800" },
            }}
          >
            {message.content}
          </Markdown>
        )}
      </View>
    </>
  );
}

export default function ChatScreen() {
  const listRef = useRef<FlatList<AIMessage>>(null);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("general");
  const {
    activeChatId,
    error,
    hydrateChats,
    isLoading,
    isSending,
    messagesByChat,
    regenerateLastUserMessage,
    sendMessage,
  } = useAIHealthStore();

  const messages = useMemo(
    () => (activeChatId ? messagesByChat[activeChatId] ?? [] : messagesByChat.new ?? []),
    [activeChatId, messagesByChat]
  );

  useEffect(() => {
    void hydrateChats();
  }, [hydrateChats]);

  const scrollToEnd = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const submit = useCallback(
    async (text = input, nextCategory = category) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;
      setInput("");
      await sendMessage(trimmed, nextCategory);
      scrollToEnd();
    },
    [category, input, isSending, sendMessage]
  );

  const renderItem = useCallback(({ item }: { item: AIMessage }) => <MessageBubble message={item} />, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }} edges={["top"]}>
      <ScreenBackground>
        <Header />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 24, fontWeight: "800" }}>
              AI Health Assistant
            </Text>
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, lineHeight: 17, marginTop: 4 }}>
              {DISCLAIMER}
            </Text>
          </View>

          {messages.length === 0 ? (
            <View style={{ paddingHorizontal: 16, gap: 10 }}>
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  onPress={() => {
                    setCategory(action.category);
                    void submit(action.value, action.category);
                  }}
                  activeOpacity={0.78}
                  style={{
                    backgroundColor: SCREEN_COLORS.card,
                    borderColor: SCREEN_COLORS.border,
                    borderWidth: 1,
                    borderRadius: 14,
                    padding: 14,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: SCREEN_COLORS.text, fontWeight: "700" }}>{action.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={SCREEN_COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: 8, paddingBottom: 12 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={() => void hydrateChats()} />
            }
            onContentSizeChange={scrollToEnd}
            ListFooterComponent={isSending ? <TypingIndicator /> : null}
          />

          {error ? (
            <TouchableOpacity
              onPress={() => void submit()}
              style={{
                marginHorizontal: 16,
                marginBottom: 8,
                borderRadius: 12,
                backgroundColor: "#FEE2E2",
                padding: 10,
              }}
            >
              <Text style={{ color: "#991B1B", fontSize: 12 }}>
                {error} Tap to retry.
              </Text>
            </TouchableOpacity>
          ) : null}

          <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}>
            {["general", "symptoms", "nutrition", "sleep"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(item)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: category === item ? SCREEN_COLORS.primary : SCREEN_COLORS.card,
                  borderWidth: 1,
                  borderColor: category === item ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                }}
              >
                <Text style={{ color: category === item ? "#fff" : SCREEN_COLORS.text, fontSize: 11, fontWeight: "700" }}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => void regenerateLastUserMessage()}
              disabled={!activeChatId || isSending}
              style={{
                marginLeft: "auto",
                paddingHorizontal: 10,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: SCREEN_COLORS.card,
                borderWidth: 1,
                borderColor: SCREEN_COLORS.border,
                opacity: !activeChatId || isSending ? 0.5 : 1,
              }}
            >
              <Text style={{ color: SCREEN_COLORS.primary, fontSize: 11, fontWeight: "800" }}>
                Regenerate
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 10,
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: Platform.OS === "ios" ? 12 : 16,
              borderTopWidth: 1,
              borderTopColor: SCREEN_COLORS.border,
            }}
          >
            <View
              style={{
                flex: 1,
                minHeight: 44,
                maxHeight: 120,
                borderRadius: 22,
                backgroundColor: SCREEN_COLORS.card,
                borderWidth: 1,
                borderColor: SCREEN_COLORS.border,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask about symptoms, sleep, nutrition..."
                placeholderTextColor={SCREEN_COLORS.textMuted}
                multiline
                style={{ color: SCREEN_COLORS.text, fontSize: 14, lineHeight: 20 }}
              />
            </View>

            <TouchableOpacity
              onPress={() => void submit()}
              disabled={!input.trim() || isSending}
              activeOpacity={0.82}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: input.trim() && !isSending ? SCREEN_COLORS.primary : SCREEN_COLORS.iconBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="send" size={18} color={input.trim() && !isSending ? "#fff" : SCREEN_COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScreenBackground>
    </SafeAreaView>
  );
}
