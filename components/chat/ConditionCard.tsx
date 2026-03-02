import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ConditionData, ConditionType } from "../../types/chat";

const COLORS: Record<ConditionType, { accent: string; bg: string }> = {
  diabetes: { accent: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  hypertension: { accent: "#EF4444", bg: "rgba(239,68,68,0.08)" },
  anemia: { accent: "#EAB308", bg: "rgba(234,179,8,0.08)" },
  gerd: { accent: "#F97316", bg: "rgba(249,115,22,0.08)" },
  ibs: { accent: "#8B5CF6", bg: "rgba(139,92,246,0.08)" },
  hypothyroidism: { accent: "#14B8A6", bg: "rgba(20,184,166,0.08)" },
};

function ListItem({ text, bullet }: { text: string; bullet: string }) {
  return (
    <Text
      style={{ color: "#D1D5DB", fontSize: 12, lineHeight: 18, marginBottom: 2 }}
    >
      {bullet} {text}
    </Text>
  );
}

interface Props {
  data: ConditionData;
}

export function ConditionCard({ data }: Props) {
  const c = COLORS[data.condition] ?? { accent: "#6B7280", bg: "rgba(107,114,128,0.08)" };

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 6,
        backgroundColor: "#0D1526",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: c.accent + "44",
      }}
    >
      {/* ── Header ── */}
      <View
        style={{
          backgroundColor: c.bg,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: c.accent + "28",
        }}
      >
        <Text style={{ fontSize: 28 }}>{data.icon}</Text>
        <Text style={{ color: c.accent, fontWeight: "700", fontSize: 16 }}>
          {data.title}
        </Text>
      </View>

      <View style={{ padding: 14, gap: 14 }}>
        {/* ── Eat More / Avoid ── */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          {/* Eat More */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginBottom: 8,
              }}
            >
              <Ionicons name="checkmark-circle" size={15} color="#22C55E" />
              <Text
                style={{ color: "#22C55E", fontWeight: "700", fontSize: 11 }}
              >
                EAT MORE
              </Text>
            </View>
            {data.eatMore.map((item, i) => (
              <ListItem key={i} text={item} bullet="•" />
            ))}
          </View>

          {/* Divider */}
          <View style={{ width: 1, backgroundColor: "#1E2A45" }} />

          {/* Avoid */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginBottom: 8,
              }}
            >
              <Ionicons name="close-circle" size={15} color="#EF4444" />
              <Text
                style={{ color: "#EF4444", fontWeight: "700", fontSize: 11 }}
              >
                AVOID
              </Text>
            </View>
            {data.avoid.map((item, i) => (
              <ListItem key={i} text={item} bullet="•" />
            ))}
          </View>
        </View>

        {/* ── Supplements / OTC ── */}
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              marginBottom: 10,
            }}
          >
            <Ionicons name="medical" size={15} color={c.accent} />
            <Text
              style={{ color: c.accent, fontWeight: "700", fontSize: 11 }}
            >
              OTC SUPPLEMENTS & MEDICATIONS
            </Text>
          </View>

          {data.supplements.map((s, i) => (
            <View
              key={i}
              style={{
                marginBottom: 10,
                paddingBottom: 10,
                borderBottomWidth: i < data.supplements.length - 1 ? 1 : 0,
                borderBottomColor: "#1A2744",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    color: "#F1F5F9",
                    fontWeight: "600",
                    fontSize: 13,
                    flex: 1,
                  }}
                >
                  {s.name}
                </Text>
                <Text
                  style={{
                    color: c.accent,
                    fontSize: 12,
                    fontWeight: "500",
                    flexShrink: 0,
                  }}
                >
                  {s.dosage}
                </Text>
              </View>
              {s.note ? (
                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 11,
                    marginTop: 3,
                    lineHeight: 16,
                  }}
                >
                  {s.note}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        {/* ── Disclaimer ── */}
        <View
          style={{
            backgroundColor: "rgba(234,179,8,0.07)",
            borderRadius: 10,
            padding: 10,
            borderLeftWidth: 3,
            borderLeftColor: "#EAB308",
          }}
        >
          <Text
            style={{
              color: "#EAB308",
              fontWeight: "700",
              fontSize: 11,
              marginBottom: 4,
            }}
          >
            ⚠️ DISCLAIMER
          </Text>
          <Text
            style={{ color: "#9CA3AF", fontSize: 11, lineHeight: 16 }}
          >
            {data.disclaimer}
          </Text>
        </View>
      </View>
    </View>
  );
}
