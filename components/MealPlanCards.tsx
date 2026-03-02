import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface MealPlan {
  id: string;
  title: string;
  calories: number;
  provider: string;
  backgroundColor: string;
  overlayColor: string;
  emoji: string;
}

export const MEAL_PLANS: MealPlan[] = [
  {
    id: "1",
    title: "Balanced",
    calories: 2400,
    provider: "Meal Plans by fatsecret",
    backgroundColor: "#14532D",
    overlayColor: "#15803D",
    emoji: "🥗",
  },
  {
    id: "2",
    title: "High Protein",
    calories: 2400,
    provider: "Meal Plans by fatsecret",
    backgroundColor: "#7C2D12",
    overlayColor: "#C2410C",
    emoji: "🥩",
  },
  {
    id: "3",
    title: "Keto Diet",
    calories: 1800,
    provider: "Meal Plans by fatsecret",
    backgroundColor: "#1E3A5F",
    overlayColor: "#1D4ED8",
    emoji: "🥑",
  },
  {
    id: "4",
    title: "Low Carb",
    calories: 2000,
    provider: "Meal Plans by fatsecret",
    backgroundColor: "#4A1D96",
    overlayColor: "#6D28D9",
    emoji: "🫐",
  },
];

interface MealPlanCardsProps {
  onCardPress?: (plan: MealPlan) => void;
}

function MealPlanCard({
  plan,
  onPress,
}: {
  plan: MealPlan;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        width: 195,
        height: 108,
        borderRadius: 16,
        backgroundColor: plan.backgroundColor,
        flexDirection: "row",
        overflow: "hidden",
        marginRight: 12,
      }}
    >
      {/* Image placeholder */}
      <View
        style={{
          width: 80,
          backgroundColor: plan.overlayColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 36 }}>{plan.emoji}</Text>
      </View>

      {/* Info */}
      <View
        style={{
          flex: 1,
          padding: 10,
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "700",
            fontSize: 14,
            lineHeight: 18,
          }}
        >
          {plan.title}
        </Text>
        <Text
          style={{
            color: "#fff",
            fontWeight: "700",
            fontSize: 14,
            lineHeight: 18,
          }}
        >
          {plan.calories} cal
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 6,
            gap: 3,
          }}
        >
          <Ionicons
            name="bookmark-outline"
            size={10}
            color="rgba(255,255,255,0.65)"
          />
          <Text
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 9,
              flexShrink: 1,
            }}
            numberOfLines={1}
          >
            {plan.provider}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function MealPlanCards({ onCardPress }: MealPlanCardsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      {MEAL_PLANS.map((plan) => (
        <MealPlanCard
          key={plan.id}
          plan={plan}
          onPress={() => onCardPress?.(plan)}
        />
      ))}
    </ScrollView>
  );
}
