import { ScrollView, TouchableOpacity, Text } from "react-native";
import { QuickReply } from "../../types/chat";

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
            borderColor: "#3B82F6",
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: "rgba(59,130,246,0.1)",
          }}
        >
          <Text style={{ color: "#60A5FA", fontSize: 13, fontWeight: "500" }}>
            {r.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
