import { ScrollView, TouchableOpacity, Text } from "react-native";
import { QuickReply } from "../../types/chat";
import { SCREEN_COLORS } from "../ScreenBackground";

interface Props {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
}

export function QuickReplies({ replies, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
      }}
    >
      {replies.map((r) => (
        <TouchableOpacity
          key={r.id}
          onPress={() => onSelect(r)}
          activeOpacity={0.72}
          style={{
            borderWidth: 1.5,
            borderColor: SCREEN_COLORS.primary,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: SCREEN_COLORS.card,
          }}
        >
          <Text style={{ color: SCREEN_COLORS.primary, fontSize: 13, fontWeight: "500" }}>
            {r.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
