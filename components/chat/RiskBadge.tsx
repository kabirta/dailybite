import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RiskLevel } from "../../types/chat";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const CONFIG: Record<
  RiskLevel,
  {
    color: string;
    bg: string;
    border: string;
    icon: IoniconsName;
    label: string;
    fallback: string;
  }
> = {
  low: {
    color: "#22C55E",
    bg: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.28)",
    icon: "checkmark-circle",
    label: "🟢 Low Risk",
    fallback: "Your symptoms appear mild. Rest, hydrate, and monitor.",
  },
  moderate: {
    color: "#EAB308",
    bg: "rgba(234,179,8,0.10)",
    border: "rgba(234,179,8,0.28)",
    icon: "warning",
    label: "🟡 Moderate Risk",
    fallback:
      "Consider consulting a healthcare provider within 24–48 hours.",
  },
  emergency: {
    color: "#EF4444",
    bg: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.35)",
    icon: "alert-circle",
    label: "🔴 Emergency",
    fallback:
      "Seek immediate medical attention. Call emergency services now.",
  },
};

interface Props {
  level: RiskLevel;
  summary: string;
}

export function RiskBadge({ level, summary }: Props) {
  const c = CONFIG[level];

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 16,
        backgroundColor: c.bg,
        borderWidth: 1.5,
        borderColor: c.border,
        padding: 16,
        gap: 10,
      }}
    >
      {/* Title row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name={c.icon} size={22} color={c.color} />
        <Text style={{ color: c.color, fontWeight: "700", fontSize: 16 }}>
          {c.label}
        </Text>
      </View>

      {/* Summary */}
      <Text style={{ color: "#D1D5DB", fontSize: 13, lineHeight: 19 }}>
        {summary || c.fallback}
      </Text>

      {/* Emergency bar */}
      {level === "emergency" && (
        <View
          style={{
            backgroundColor: "rgba(239,68,68,0.15)",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Text
            style={{ color: "#FCA5A5", fontSize: 12, fontWeight: "600" }}
          >
            ⚡ Call 911 or go to the nearest emergency room immediately.
          </Text>
        </View>
      )}
    </View>
  );
}
