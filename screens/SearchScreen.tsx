import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  SCREEN_COLORS,
  ScreenBackground,
} from "../components/ScreenBackground";

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tint: string;
  href: string;
  keywords: string[];
};

const SEARCH_ITEMS: SearchItem[] = [
  {
    id: "diary",
    title: "Diary",
    subtitle: "Calories, meal sections, water tracker, and daily summary",
    category: "App",
    icon: "restaurant-outline",
    tint: "#127dff",
    href: "/diary",
    keywords: ["home", "diary", "calories", "summary", "water", "tracker"],
  },
  {
    id: "calendar",
    title: "Calendar",
    subtitle: "Pick a date and review your diary by day",
    category: "App",
    icon: "calendar-outline",
    tint: "#38BDF8",
    href: "/calendar",
    keywords: ["date", "month", "calendar", "history"],
  },
  {
    id: "chat",
    title: "AI Health Assistant",
    subtitle: "Ask about symptoms, nutrition, sleep, stress, and wellness",
    category: "App",
    icon: "chatbubbles-outline",
    tint: "#A78BFA",
    href: "/chat",
    keywords: ["ai", "assistant", "chat", "symptoms", "nutrition", "sleep"],
  },
  {
    id: "reports",
    title: "Reports",
    subtitle: "Calories, steps, macros, nutrients, and weekly trends",
    category: "App",
    icon: "bar-chart-outline",
    tint: "#22C55E",
    href: "/reports",
    keywords: ["reports", "calories", "steps", "macros", "nutrients", "progress"],
  },
  {
    id: "store",
    title: "Store",
    subtitle: "Browse NutriMed AI by CMC nutrition products",
    category: "App",
    icon: "storefront-outline",
    tint: "#F97316",
    href: "/store",
    keywords: ["store", "shop", "products", "buy", "supplements"],
  },
  {
    id: "profile",
    title: "Profile",
    subtitle: "Account, body snapshot, preferences, and sign out",
    category: "Account",
    icon: "person-circle-outline",
    tint: "#127dff",
    href: "/profile",
    keywords: ["profile", "account", "settings", "preferences", "sign out"],
  },
  {
    id: "help",
    title: "Help and Support",
    subtitle: "FAQs, troubleshooting, and contact support",
    category: "Account",
    icon: "headset-outline",
    tint: "#334155",
    href: "/help-support",
    keywords: ["help", "support", "faq", "problem", "contact", "troubleshoot"],
  },
  {
    id: "premium",
    title: "Premium Plan",
    subtitle: "Upgrade for advanced insights and tailored plans",
    category: "Account",
    icon: "star-outline",
    tint: "#EAB308",
    href: "/premium-plan",
    keywords: ["premium", "upgrade", "plan", "subscription"],
  },
  {
    id: "breakfast",
    title: "Add Breakfast",
    subtitle: "Search and log foods for breakfast",
    category: "Meals",
    icon: "partly-sunny-outline",
    tint: "#FBBF24",
    href: "/add-meal?meal=Breakfast&focusSearch=1",
    keywords: ["breakfast", "food", "meal", "log", "search"],
  },
  {
    id: "lunch",
    title: "Add Lunch",
    subtitle: "Search and log foods for lunch",
    category: "Meals",
    icon: "sunny-outline",
    tint: "#EAB308",
    href: "/add-meal?meal=Lunch&focusSearch=1",
    keywords: ["lunch", "food", "meal", "log", "search"],
  },
  {
    id: "dinner",
    title: "Add Dinner",
    subtitle: "Search and log foods for dinner",
    category: "Meals",
    icon: "moon-outline",
    tint: "#F97316",
    href: "/add-meal?meal=Dinner&focusSearch=1",
    keywords: ["dinner", "food", "meal", "log", "search"],
  },
  {
    id: "snacks",
    title: "Add Snacks",
    subtitle: "Search and log snacks or other meals",
    category: "Meals",
    icon: "ice-cream-outline",
    tint: "#A78BFA",
    href: "/add-meal?meal=Snacks&focusSearch=1",
    keywords: ["snacks", "food", "meal", "log", "other"],
  },
  {
    id: "recipes",
    title: "Recipes",
    subtitle: "Oatmeal bowl, egg salad, banana smoothie, avocado toast",
    category: "Meals",
    icon: "book-outline",
    tint: "#22C55E",
    href: "/add-meal?focusSearch=1",
    keywords: ["recipes", "cook book", "oatmeal", "egg", "banana", "smoothie", "avocado"],
  },
  {
    id: "protein-plus",
    title: "Protein Plus Shake",
    subtitle: "High-protein recovery blend for lean muscle and steady energy",
    category: "Store",
    icon: "fitness-outline",
    tint: "#22C55E",
    href: "/store",
    keywords: ["protein", "shake", "muscle", "recovery", "store"],
  },
  {
    id: "green-detox",
    title: "Green Detox Mix",
    subtitle: "Daily greens powder with fiber, herbs, and digestive support",
    category: "Store",
    icon: "leaf-outline",
    tint: "#10B981",
    href: "/store",
    keywords: ["green", "detox", "fiber", "digestion", "moringa"],
  },
  {
    id: "omega-heart",
    title: "Omega Heart Capsules",
    subtitle: "Omega support for heart health and everyday wellness",
    category: "Store",
    icon: "heart-outline",
    tint: "#38BDF8",
    href: "/store",
    keywords: ["omega", "heart", "capsules", "wellness"],
  },
];

const SUGGESTIONS = ["calories", "breakfast", "reports", "water", "support"];

function matchesSearch(item: SearchItem, normalizedQuery: string) {
  const searchableText = [
    item.title,
    item.subtitle,
    item.category,
    ...item.keywords,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

function groupItems(items: SearchItem[]) {
  return items.reduce<Record<string, SearchItem[]>>((groups, item) => {
    groups[item.category] = groups[item.category] ?? [];
    groups[item.category].push(item);
    return groups;
  }, {});
}

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return SEARCH_ITEMS;
    }

    return SEARCH_ITEMS.filter((item) => matchesSearch(item, normalizedQuery));
  }, [query]);

  const groupedResults = useMemo(() => groupItems(results), [results]);
  const categories = Object.keys(groupedResults);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScreenBackground>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.iconButton,
              pressed ? styles.iconButtonPressed : null,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={SCREEN_COLORS.primaryDark}
            />
          </Pressable>
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={19}
              color={SCREEN_COLORS.textMuted}
            />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Search NutriMed AI by CMC"
              placeholderTextColor={SCREEN_COLORS.textMuted}
              returnKeyType="search"
              style={styles.searchInput}
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={SCREEN_COLORS.textMuted}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.suggestionRow}>
            {SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                activeOpacity={0.8}
                onPress={() => setQuery(suggestion)}
                style={styles.suggestionPill}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.resultCount}>
            {results.length} result{results.length === 1 ? "" : "s"}
          </Text>

          {categories.length > 0 ? (
            categories.map((category) => (
              <View key={category} style={styles.section}>
                <Text style={styles.sectionTitle}>{category}</Text>
                <View style={styles.resultCard}>
                  {groupedResults[category].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.82}
                      onPress={() => router.push(item.href)}
                      style={styles.resultRow}
                    >
                      <View
                        style={[
                          styles.resultIcon,
                          { backgroundColor: `${item.tint}18` },
                        ]}
                      >
                        <Ionicons name={item.icon} size={20} color={item.tint} />
                      </View>
                      <View style={styles.resultCopy}>
                        <Text style={styles.resultTitle}>{item.title}</Text>
                        <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color={SCREEN_COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="search-outline"
                  size={30}
                  color={SCREEN_COLORS.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>
                Try searching for meals, calories, reports, products, profile,
                or support.
              </Text>
            </View>
          )}
        </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_COLORS.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    height: 42,
    width: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: SCREEN_COLORS.iconBg,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
  },
  iconButtonPressed: {
    opacity: 0.82,
  },
  searchBox: {
    flex: 1,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
    backgroundColor: SCREEN_COLORS.card,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: SCREEN_COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 4,
    paddingBottom: 14,
  },
  suggestionPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
    backgroundColor: SCREEN_COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  suggestionText: {
    color: SCREEN_COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  resultCount: {
    color: SCREEN_COLORS.textMuted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: SCREEN_COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
  },
  resultCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
    backgroundColor: SCREEN_COLORS.card,
    overflow: "hidden",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: SCREEN_COLORS.border,
  },
  resultIcon: {
    height: 42,
    width: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  resultCopy: {
    flex: 1,
  },
  resultTitle: {
    color: SCREEN_COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  resultSubtitle: {
    color: SCREEN_COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 64,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    height: 68,
    width: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SCREEN_COLORS.iconBg,
    marginBottom: 14,
  },
  emptyTitle: {
    color: SCREEN_COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyText: {
    color: SCREEN_COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
});
