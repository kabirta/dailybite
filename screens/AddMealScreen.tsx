import React, { useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TABS = [
  "COOK BOOK",
  "RECIPES",
  "FOOD",
  "RECENTLY EATEN",
  "MOST EATEN",
  "SAVED MEALS",
] as const;

function formatHeaderDate(date: Date): string {
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
  ];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}`;
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
}) {
  return (
    <View style={{ alignItems: "center", paddingTop: 48 }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: "#0D1526",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name={icon} size={34} color="#374151" />
      </View>
      <Text
        style={{ color: "#9CA3AF", fontSize: 15, fontWeight: "600", marginBottom: 6 }}
      >
        {title}
      </Text>
      <Text
        style={{ color: "#4B5563", fontSize: 13, textAlign: "center", maxWidth: 220, lineHeight: 19 }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

// ── Cook Book Tab ─────────────────────────────────────────────────────────────

function CookBookTab() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          borderWidth: 1.5,
          borderColor: "#22C55E",
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginBottom: 32,
        }}
      >
        <Ionicons name="add" size={20} color="#22C55E" />
        <Text style={{ color: "#22C55E", fontSize: 15, fontWeight: "700" }}>
          New Recipe
        </Text>
      </TouchableOpacity>

      <EmptyState
        icon="book-outline"
        title="No Recipes Yet"
        subtitle="Create your own recipes to track custom meals easily."
      />
    </ScrollView>
  );
}

// ── Recipes Tab ───────────────────────────────────────────────────────────────

const SAMPLE_RECIPES = [
  { id: "1", title: "Oatmeal Bowl", time: "10 min", emoji: "🥣" },
  { id: "2", title: "Egg Salad", time: "15 min", emoji: "🥚" },
  { id: "3", title: "Banana Smoothie", time: "5 min", emoji: "🍌" },
  { id: "4", title: "Avocado Toast", time: "8 min", emoji: "🥑" },
];

function RecipesTab() {
  const [query, setQuery] = useState("");

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      {/* Search + Filter */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#0D1526",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: "#1A2744",
            gap: 8,
          }}
        >
          <Ionicons name="search-outline" size={18} color="#6B7280" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search recipes..."
            placeholderTextColor="#4B5563"
            style={{ flex: 1, color: "#F1F5F9", fontSize: 14 }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "#0D1526",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#1A2744",
            width: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="options-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Sort */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 14 }}>
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={{ color: "#9CA3AF", fontSize: 13 }}>Sort</Text>
          <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* 2-column grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {SAMPLE_RECIPES.map((recipe) => (
          <TouchableOpacity
            key={recipe.id}
            activeOpacity={0.8}
            style={{
              width: (SCREEN_WIDTH - 32 - 12) / 2,
              backgroundColor: "#0D1526",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#1A2744",
              overflow: "hidden",
            }}
          >
            {/* Thumbnail */}
            <View
              style={{
                height: 110,
                backgroundColor: "#111C33",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 42 }}>{recipe.emoji}</Text>
              {/* Time badge */}
              <View
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: 8,
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Ionicons name="time-outline" size={11} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 11 }}>{recipe.time}</Text>
              </View>
            </View>
            <View style={{ padding: 10 }}>
              <Text style={{ color: "#F1F5F9", fontSize: 13, fontWeight: "600" }}>
                {recipe.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Food Tab ──────────────────────────────────────────────────────────────────

function FoodTab() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#0D1526",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1.5,
          borderColor: focused ? "#22C55E" : "#1A2744",
          gap: 8,
          marginBottom: 24,
        }}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={focused ? "#22C55E" : "#6B7280"}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search for Food"
          placeholderTextColor="#4B5563"
          style={{ flex: 1, color: "#F1F5F9", fontSize: 14 }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      <EmptyState
        icon="nutrition-outline"
        title="Search for Food"
        subtitle="Find foods from our database to log your meals."
      />
    </ScrollView>
  );
}

// ── Recently Eaten Tab ────────────────────────────────────────────────────────

const MEAL_META: Record<
  string,
  { icon: React.ComponentProps<typeof Ionicons>["name"]; color: string }
> = {
  Breakfast: { icon: "partly-sunny-outline", color: "#FBBF24" },
  Lunch:     { icon: "sunny-outline",        color: "#EAB308" },
  Dinner:    { icon: "moon-outline",         color: "#F97316" },
  Snacks:    { icon: "moon-outline",         color: "#A78BFA" },
};

function RecentlyEatenTab({ meal }: { meal: string }) {
  const meta = MEAL_META[meal] ?? MEAL_META["Breakfast"];
  const sections = [
    { id: "current", label: meal.toUpperCase(), icon: meta.icon, color: meta.color },
    { id: "other",   label: "ALL OTHER MEALS",  icon: "time-outline" as const, color: "#9CA3AF" },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      {sections.map((section) => (
        <View key={section.id} style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Ionicons name={section.icon} size={16} color={section.color} />
            <Text
              style={{
                color: "#6B7280",
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 0.8,
              }}
            >
              {section.label}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "#0D1526",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#1A2744",
              paddingVertical: 20,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#4B5563", fontSize: 13 }}>
              No foods logged yet
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Most Eaten Tab ────────────────────────────────────────────────────────────

function MostEatenTab() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      <EmptyState
        icon="stats-chart-outline"
        title="No foods available"
        subtitle="Foods you eat most often will appear here."
      />
    </ScrollView>
  );
}

// ── Saved Meals Tab ───────────────────────────────────────────────────────────

function SavedMealsTab() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          borderWidth: 1.5,
          borderColor: "#22C55E",
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginBottom: 32,
        }}
      >
        <Ionicons name="add" size={20} color="#22C55E" />
        <Text style={{ color: "#22C55E", fontSize: 15, fontWeight: "700" }}>
          New Saved Meal
        </Text>
      </TouchableOpacity>

      <EmptyState
        icon="bookmark-outline"
        title="No Saved Meals"
        subtitle="Save meal combinations to log them quickly next time."
      />
    </ScrollView>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function AddMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ meal?: string }>();
  const mealLabel = params.meal ?? "Breakfast";

  const [activeTab, setActiveTab] = useState(2); // default: FOOD
  const pagerRef = useRef<ScrollView>(null);

  const today = new Date();

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    pagerRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const handlePageChange = (e: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== activeTab) setActiveTab(index);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#030A23" }} edges={["top"]}>
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#0D1526",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#0D1526",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Text style={{ color: "#F1F5F9", fontSize: 17, fontWeight: "700" }}>
              {mealLabel}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>
            {formatHeaderDate(today)}
          </Text>
        </View>

        {/* Spacer to balance close button */}
        <View style={{ width: 36 }} />
      </View>

      {/* ── Tab Bar ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "#0D1526",
          flexGrow: 0,
        }}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(index)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor:
                activeTab === index ? "#22C55E" : "transparent",
            }}
          >
            <Text
              style={{
                color: activeTab === index ? "#22C55E" : "#6B7280",
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 0.5,
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Pager ── */}
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handlePageChange}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentOffset={{ x: activeTab * SCREEN_WIDTH, y: 0 }}
      >
        <View style={{ width: SCREEN_WIDTH }}>
          <CookBookTab />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <RecipesTab />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <FoodTab />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <RecentlyEatenTab meal={mealLabel} />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <MostEatenTab />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <SavedMealsTab />
        </View>
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <View
        style={{
          backgroundColor: "#030A23",
          borderTopWidth: 1,
          borderTopColor: "#0D1526",
          paddingTop: 14,
          paddingBottom: 28,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {/* Camera */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: "#0D3320",
            borderWidth: 1,
            borderColor: "#22C55E",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="camera-outline" size={24} color="#22C55E" />
        </TouchableOpacity>

        {/* AI Sparkle */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: "#0D3320",
            borderWidth: 1,
            borderColor: "#22C55E",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="sparkles-outline" size={24} color="#22C55E" />
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#F97316",
            }}
          />
        </TouchableOpacity>

        {/* Barcode */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: "transparent",
            borderWidth: 1.5,
            borderColor: "#22C55E",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="barcode-outline" size={24} color="#22C55E" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
