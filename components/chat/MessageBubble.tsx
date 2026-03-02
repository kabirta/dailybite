import { View, Text } from "react-native";
import { ChatMessage } from "../../types/chat";

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const content = message.content;

  // Only handles text / quick-replies (the text portion)
  const text =
    content.type === "text"
      ? content.text
      : content.type === "quick-replies"
        ? content.text
        : null;

  if (text === null) return null;

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "82%",
        marginVertical: 4,
        marginHorizontal: 16,
      }}
    >
      {/* Bot avatar row */}
      {!isUser && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 5,
            gap: 6,
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
          <Text style={{ color: "#6B7280", fontSize: 11 }}>Health AI</Text>
        </View>
      )}

      {/* Bubble */}
      <View
        style={{
          backgroundColor: isUser ? "#1D4ED8" : "#0D1526",
          borderRadius: 18,
          borderBottomRightRadius: isUser ? 4 : 18,
          borderBottomLeftRadius: isUser ? 18 : 4,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: "#F1F5F9", fontSize: 14, lineHeight: 21 }}>
          {text}
        </Text>
      </View>

      {/* Timestamp */}
      <Text
        style={{
          color: "#374151",
          fontSize: 10,
          marginTop: 3,
          alignSelf: isUser ? "flex-end" : "flex-start",
          marginHorizontal: 4,
        }}
      >
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}
