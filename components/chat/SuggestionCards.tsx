import { View, Text, ScrollView } from "react-native";
import { SuggestionCard } from "../../types/chat";
import { SCREEN_COLORS } from "../ScreenBackground";

type Category = SuggestionCard["category"];

const CAT_STYLE: Record<Category, { accent: string; border: string; bg: string }> = {
  stress: {
    accent: "#A78BFA",
    border: "rgba(167,139,250,0.30)",
    bg: "rgba(139,92,246,0.08)",
  },
  nutrition: {
    accent: "#4ADE80",
    border: "rgba(74,222,128,0.30)",
    bg: "rgba(34,197,94,0.08)",
  },
  sleep: {
    accent: "#38BDF8",
    border: "rgba(56,189,248,0.30)",
    bg: "rgba(14,165,233,0.08)",
  },
};

function Card({ card }: { card: SuggestionCard }) {
  const s = CAT_STYLE[card.category];
  return (
    <View
      style={{
        width: 220,
        marginRight: 12,
        backgroundColor: SCREEN_COLORS.card,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: s.border,
      }}
    >
      {/* Card header */}
      <View
        style={{
          backgroundColor: s.bg,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 26 }}>{card.emoji}</Text>
        <Text
          style={{
            color: s.accent,
            fontWeight: "700",
            fontSize: 14,
            flex: 1,
          }}
        >
          {card.title}
        </Text>
      </View>

      {/* Techniques list */}
      <View style={{ padding: 14, gap: 10 }}>
        {card.techniques.map((t, i) => (
          <View
            key={i}
            style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}
          >
            <Text style={{ fontSize: 16, marginTop: 1 }}>{t.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: SCREEN_COLORS.text,
                  fontWeight: "600",
                  fontSize: 12,
                }}
              >
                {t.name}
              </Text>
              <Text
                style={{
                  color: SCREEN_COLORS.textMuted,
                  fontSize: 11,
                  lineHeight: 15,
                  marginTop: 2,
                }}
              >
                {t.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

interface Props {
  intro: string;
  cards: SuggestionCard[];
}

export function SuggestionCards({ intro, cards }: Props) {
  return (
    <View style={{ marginVertical: 6 }}>
      {/* Intro bubble */}
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 10,
          backgroundColor: SCREEN_COLORS.card,
          borderWidth: 1,
          borderColor: SCREEN_COLORS.border,
          borderRadius: 16,
          padding: 14,
        }}
      >
        <Text style={{ color: SCREEN_COLORS.text, fontSize: 14, lineHeight: 21 }}>
          {intro}
        </Text>
      </View>

      {/* Scrollable cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
      >
        {cards.map((c) => (
          <Card key={c.id} card={c} />
        ))}
      </ScrollView>
    </View>
  );
}
