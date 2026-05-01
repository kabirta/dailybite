import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RedFlagData, RedFlagType } from "../../types/chat";
import { SCREEN_COLORS } from "../ScreenBackground";

const PROTOCOL_META: Record<
  RedFlagType,
  { emoji: string; tag: string; accent: string; bg: string }
> = {
  stroke: {
    emoji: "🧠",
    tag: "FAST Protocol",
    accent: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
  },
  cardiac: {
    emoji: "❤️",
    tag: "Cardiac Alert",
    accent: "#F97316",
    bg: "rgba(249,115,22,0.08)",
  },
  sepsis: {
    emoji: "🦠",
    tag: "qSOFA Criteria",
    accent: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
  },
};

interface Props {
  data: RedFlagData;
}

export function RedFlagCard({ data }: Props) {
  const meta = PROTOCOL_META[data.type];

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 16,
        backgroundColor: meta.bg,
        borderWidth: 2,
        borderColor: meta.accent,
        overflow: "hidden",
      }}
    >
      {/* Coloured header strip */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: meta.accent,
          paddingHorizontal: 14,
          paddingVertical: 11,
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 22 }}>{meta.emoji}</Text>
        <View>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            {data.title}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.78)", fontSize: 11 }}>
            {meta.tag}
          </Text>
        </View>
      </View>

      <View style={{ padding: 14, gap: 10 }}>
        {/* Indicators — lettered like FAST / ABC */}
        <Text
          style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, fontWeight: "600" }}
        >
          Watch for:
        </Text>

        {data.indicators.map((ind, i) => (
          <View
            key={i}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: meta.accent,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 1,
                flexShrink: 0,
              }}
            >
              <Text
                style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}
              >
                {String.fromCharCode(65 + i)}
              </Text>
            </View>
            <Text
              style={{
                color: SCREEN_COLORS.text,
                fontSize: 13,
                lineHeight: 19,
                flex: 1,
              }}
            >
              {ind}
            </Text>
          </View>
        ))}

        {/* Action note */}
        <View
          style={{
            backgroundColor: SCREEN_COLORS.card,
            borderWidth: 1,
            borderColor: SCREEN_COLORS.border,
            borderRadius: 10,
            padding: 10,
            marginTop: 2,
          }}
        >
          <Text style={{ color: SCREEN_COLORS.text, fontSize: 12, lineHeight: 17 }}>
            ⚡ {data.action}
          </Text>
        </View>

        {/* Emergency CTA */}
        {data.emergency && (
          <TouchableOpacity
            onPress={() => Linking.openURL("tel:911")}
            activeOpacity={0.82}
            style={{
              backgroundColor: "#EF4444",
              borderRadius: 12,
              paddingVertical: 13,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 2,
            }}
          >
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              Call Emergency (911)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
