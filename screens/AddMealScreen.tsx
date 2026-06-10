import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";
import {
  createCustomMeal,
  analyzeFoodImage,
  confirmScannedFood,
  deleteCustomMeal,
  getConfiguredApiBaseUrl,
  getPremiumStatus,
  listCustomMeals,
  listRecipes,
  lookupBarcodeFood,
  logCustomMeal,
  searchFoods,
} from "../src/services/backendApi";
import { useNutrition } from "../src/context/NutritionContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TABS = [
  "COOK BOOK",
  "RECIPES",
  "FOOD",
  "RECENTLY EATEN",
  "MOST EATEN",
  "SAVED MEALS",
] as const;

const FOOD_TAB_INDEX = 2;
const SAVED_MEALS_TAB_INDEX = 5;

type CatalogFood = {
  _id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: number;
};

type CatalogRecipe = {
  _id: string;
  title: string;
  serves: number;
  prepTime: number;
  cookTime: number;
  imageUrl?: string;
};

type CustomMeal = {
  _id: string;
  name: string;
  description?: string;
  defaultMealType?: string;
  items?: {
    foodId?: CatalogFood;
    quantity: number;
    nameSnapshot?: string;
  }[];
  totals?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
};

type ScanFood = {
  name: string;
  brand?: string;
  servingSize?: number;
  servingUnit?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  fiber?: number;
  sodium?: number;
  confidence?: number;
  notes?: string;
};

type ScanResult = {
  _id: string;
  source: "camera" | "barcode";
  barcode?: string;
  foods: ScanFood[];
  totals?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
    fiber?: number;
  };
  mealHealthScore?: number;
  unhealthyFlags?: string[];
  insight?: string;
};

type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "other";

const MEAL_LABEL_TO_TYPE: Record<string, MealType> = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
  snacks: "snacks",
  "snacks/other": "snacks",
  snack: "snacks",
  other: "other",
};

function normalizeMealTypeLabel(value?: string | string[]): MealType {
  const raw = Array.isArray(value) ? value[0] : value;
  const key = String(raw || "Breakfast").trim().toLowerCase();
  return MEAL_LABEL_TO_TYPE[key] ?? "breakfast";
}

function parseIsoDateParam(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return new Date();

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date();

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  date.setHours(12, 0, 0, 0);
  return date;
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

function inferImageType(uri?: string, mimeType?: string) {
  if (mimeType) return mimeType;
  const lower = String(uri || "").toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function toNumberInput(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : "";
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
          backgroundColor: SCREEN_COLORS.iconBg,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name={icon} size={34} color={SCREEN_COLORS.primary} />
      </View>
      <Text
        style={{ color: SCREEN_COLORS.text, fontSize: 15, fontWeight: "600", marginBottom: 6 }}
      >
        {title}
      </Text>
      <Text
        style={{ color: SCREEN_COLORS.textMuted, fontSize: 13, textAlign: "center", maxWidth: 220, lineHeight: 19 }}
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
          borderColor: SCREEN_COLORS.primary,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginBottom: 32,
        }}
      >
        <Ionicons name="add" size={20} color={SCREEN_COLORS.primary} />
        <Text style={{ color: SCREEN_COLORS.primary, fontSize: 15, fontWeight: "700" }}>
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

function RecipesTab() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);
  const [recipes, setRecipes] = useState<CatalogRecipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await listRecipes(query);
        if (isActive) {
          setRecipes(data);
        }
      } catch (error) {
        if (isActive) {
          setRecipes([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(load, 250);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [query]);

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
            backgroundColor: SCREEN_COLORS.card,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: SCREEN_COLORS.border,
            gap: 8,
          }}
        >
          <TouchableOpacity onPress={() => inputRef.current?.focus()}>
            <Ionicons name="search-outline" size={18} color={SCREEN_COLORS.textMuted} />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search recipes..."
            placeholderTextColor={SCREEN_COLORS.textMuted}
            style={{ flex: 1, color: SCREEN_COLORS.text, fontSize: 14 }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={SCREEN_COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: SCREEN_COLORS.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: SCREEN_COLORS.border,
            width: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="options-outline" size={20} color={SCREEN_COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Sort */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 14 }}>
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 13 }}>Sort</Text>
          <Ionicons name="chevron-down" size={14} color={SCREEN_COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={SCREEN_COLORS.primary} />
      ) : recipes.length === 0 ? (
        <EmptyState
          icon="restaurant-outline"
          title="No recipes found"
          subtitle="Admin recipes added to the database will appear here."
        />
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {recipes.map((recipe) => {
            const selected = selectedRecipeId === recipe._id;
            const totalTime = Number(recipe.prepTime ?? 0) + Number(recipe.cookTime ?? 0);

            return (
              <TouchableOpacity
                key={recipe._id}
                activeOpacity={0.8}
                onPress={() => setSelectedRecipeId(selected ? null : recipe._id)}
                style={{
                  width: (SCREEN_WIDTH - 32 - 12) / 2,
                  backgroundColor: SCREEN_COLORS.card,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: selected ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: 110,
                    backgroundColor: SCREEN_COLORS.cardSoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {recipe.imageUrl ? (
                    <Image source={{ uri: recipe.imageUrl }} style={{ width: "100%", height: "100%" }} />
                  ) : (
                    <Ionicons name="restaurant-outline" size={40} color={SCREEN_COLORS.primary} />
                  )}
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
                    <Text style={{ color: "#fff", fontSize: 11 }}>{totalTime} min</Text>
                  </View>
                </View>
                <View style={{ padding: 10, gap: 4 }}>
                  <Text style={{ color: SCREEN_COLORS.text, fontSize: 13, fontWeight: "600" }}>
                    {recipe.title}
                  </Text>
                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12 }}>
                    Serves {recipe.serves}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

// ── Food Tab ──────────────────────────────────────────────────────────────────

function FoodTab({
  autoFocus = false,
  selectedFoodIds,
  onToggleFood,
}: {
  autoFocus?: boolean;
  selectedFoodIds: string[];
  onToggleFood: (foodId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [foods, setFoods] = useState<CatalogFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await searchFoods(query);
        if (isActive) {
          setFoods(data);
          setLoadError("");
        }
      } catch (error) {
        if (isActive) {
          setFoods([]);
          setLoadError(error instanceof Error ? error.message : "Could not load foods");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(load, 250);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);

    return () => clearTimeout(timer);
  }, [autoFocus]);

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
          backgroundColor: SCREEN_COLORS.card,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1.5,
          borderColor: focused ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
          gap: 8,
          marginBottom: 24,
        }}
      >
        <TouchableOpacity onPress={() => inputRef.current?.focus()}>
          <Ionicons
            name="search-outline"
            size={18}
            color={focused ? SCREEN_COLORS.primary : SCREEN_COLORS.textMuted}
          />
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search for Food"
          placeholderTextColor={SCREEN_COLORS.textMuted}
          style={{ flex: 1, color: SCREEN_COLORS.text, fontSize: 14 }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color={SCREEN_COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={SCREEN_COLORS.primary} />
      ) : loadError ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Could not load foods"
          subtitle={`${loadError}. API: ${getConfiguredApiBaseUrl()}`}
        />
      ) : foods.length === 0 ? (
        <EmptyState
          icon="nutrition-outline"
          title="No foods found"
          subtitle="Admin foods added to the database will appear here."
        />
      ) : (
        <View style={{ gap: 10 }}>
          {foods.map((food) => {
            const selected = selectedFoodIds.includes(food._id);

            return (
              <TouchableOpacity
                key={food._id}
                activeOpacity={0.82}
                onPress={() => onToggleFood(food._id)}
                style={{
                  backgroundColor: SCREEN_COLORS.card,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: selected ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: SCREEN_COLORS.text, fontSize: 15, fontWeight: "700" }}>
                    {food.name}
                  </Text>
                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginTop: 3 }}>
                    {food.brand ? `${food.brand} · ` : ""}{food.servingSize ?? 100}g serving
                  </Text>
                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginTop: 6 }}>
                    P {food.protein}g · C {food.carbs}g · F {food.fat}g
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 8 }}>
                  <Text style={{ color: SCREEN_COLORS.text, fontSize: 14, fontWeight: "800" }}>
                    {Math.round(food.calories)} kcal
                  </Text>
                  <Ionicons
                    name={selected ? "checkmark-circle" : "add-circle-outline"}
                    size={24}
                    color={selected ? SCREEN_COLORS.primary : SCREEN_COLORS.textMuted}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
                color: SCREEN_COLORS.textMuted,
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
              backgroundColor: SCREEN_COLORS.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: SCREEN_COLORS.border,
              paddingVertical: 20,
              alignItems: "center",
            }}
          >
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 13 }}>
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

function SavedMealsTab({
  selectedFoodIds,
  mealType,
  selectedDate,
  selectedDateIso,
  onLogged,
}: {
  selectedFoodIds: string[];
  mealType: MealType;
  selectedDate: Date;
  selectedDateIso: string;
  onLogged: () => void;
}) {
  const router = useRouter();
  const [meals, setMeals] = useState<CustomMeal[]>([]);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingId, setIsLoggingId] = useState<string | null>(null);
  const [premiumLocked, setPremiumLocked] = useState(false);

  const openPremium = () => router.push("/premium-plan");

  const handlePremiumError = (error: unknown) => {
    if (typeof error === "object" && error && "status" in error && (error as any).status === 402) {
      setPremiumLocked(true);
      return true;
    }
    return false;
  };

  const loadMeals = async () => {
    try {
      setIsLoading(true);
      const data = await listCustomMeals({ query });
      setMeals(Array.isArray(data) ? data : []);
      setPremiumLocked(false);
    } catch (error) {
      if (!handlePremiumError(error)) {
        console.warn("[CustomMeals] Failed to load", error);
        setMeals([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadMeals();
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const saveSelectedAsMeal = async () => {
    const uniqueFoodIds = [...new Set(selectedFoodIds)];
    if (!name.trim()) {
      Alert.alert("Name your meal", "Add a short name like Protein breakfast or Office lunch.");
      return;
    }
    if (!uniqueFoodIds.length) {
      Alert.alert("Select foods first", "Go to the Food tab, select the foods, then save them as a custom meal.");
      return;
    }

    setIsSaving(true);
    try {
      await createCustomMeal({
        name: name.trim(),
        defaultMealType: mealType,
        items: uniqueFoodIds.map((foodId) => ({ foodId, quantity: 1 })),
      });
      setName("");
      onLogged();
      await loadMeals();
    } catch (error) {
      if (handlePremiumError(error)) return;
      Alert.alert("Could not save custom meal", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const logMeal = async (mealId: string) => {
    if (isLoggingId) return;
    setIsLoggingId(mealId);
    try {
      await logCustomMeal(mealId, {
        mealType,
        date: selectedDate,
        scale: 1,
      });
      router.replace(`/diary?date=${selectedDateIso}`);
    } catch (error) {
      if (handlePremiumError(error)) return;
      Alert.alert("Could not log custom meal", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setIsLoggingId(null);
    }
  };

  const removeMeal = (meal: CustomMeal) => {
    Alert.alert("Delete custom meal?", meal.name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCustomMeal(meal._id);
            setMeals((current) => current.filter((item) => item._id !== meal._id));
          } catch (error) {
            if (handlePremiumError(error)) return;
            Alert.alert("Could not delete meal", error instanceof Error ? error.message : "Please try again.");
          }
        },
      },
    ]);
  };

  if (premiumLocked) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        <View
          style={{
            backgroundColor: SCREEN_COLORS.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: SCREEN_COLORS.border,
            padding: 18,
            gap: 12,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              backgroundColor: SCREEN_COLORS.iconBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="sparkles-outline" size={26} color={SCREEN_COLORS.primary} />
          </View>
          <Text style={{ color: SCREEN_COLORS.text, fontSize: 18, fontWeight: "800" }}>
            Custom Meals are Premium
          </Text>
          <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 14, lineHeight: 21 }}>
            Save full meal combinations and log them in one tap after activating your plan.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={openPremium}
            style={{
              height: 48,
              borderRadius: 14,
              backgroundColor: SCREEN_COLORS.primary,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>
              View Premium Plan
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      <View
        style={{
          backgroundColor: SCREEN_COLORS.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: SCREEN_COLORS.border,
          padding: 14,
          marginBottom: 14,
          gap: 10,
        }}
      >
        <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "800" }}>
          Save selected foods
        </Text>
        <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 13, lineHeight: 19 }}>
          {selectedFoodIds.length
            ? `${selectedFoodIds.length} selected food${selectedFoodIds.length === 1 ? "" : "s"} will become a reusable meal.`
            : "Select foods in the Food tab first, then save the combo here."}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Meal name"
          placeholderTextColor={SCREEN_COLORS.textMuted}
          style={{
            minHeight: 46,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: SCREEN_COLORS.border,
            paddingHorizontal: 12,
            color: SCREEN_COLORS.text,
            backgroundColor: SCREEN_COLORS.cardSoft,
          }}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isSaving || !selectedFoodIds.length}
          onPress={() => void saveSelectedAsMeal()}
          style={{
            height: 46,
            borderRadius: 12,
            backgroundColor: SCREEN_COLORS.primary,
            opacity: isSaving || !selectedFoodIds.length ? 0.55 : 1,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          {isSaving ? <ActivityIndicator color="#fff" /> : <Ionicons name="bookmark" size={18} color="#fff" />}
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>
            Save Custom Meal
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: SCREEN_COLORS.card,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: SCREEN_COLORS.border,
          gap: 8,
          marginBottom: 14,
        }}
      >
        <Ionicons name="search-outline" size={18} color={SCREEN_COLORS.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search saved meals..."
          placeholderTextColor={SCREEN_COLORS.textMuted}
          style={{ flex: 1, color: SCREEN_COLORS.text, fontSize: 14 }}
        />
      </View>

      {isLoading ? (
        <View style={{ paddingTop: 36 }}>
          <ActivityIndicator color={SCREEN_COLORS.primary} />
        </View>
      ) : meals.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title="No Saved Meals"
          subtitle="Save meal combinations to log them quickly next time."
        />
      ) : (
        <View style={{ gap: 12 }}>
          {meals.map((meal) => {
            const totals = meal.totals ?? {};
            const itemCount = meal.items?.length ?? 0;
            return (
              <View
                key={meal._id}
                style={{
                  backgroundColor: SCREEN_COLORS.card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: SCREEN_COLORS.border,
                  padding: 14,
                  gap: 12,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "800" }}>
                      {meal.name}
                    </Text>
                    <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginTop: 3 }}>
                      {itemCount} food{itemCount === 1 ? "" : "s"} • {Math.round(totals.calories ?? 0)} kcal
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeMeal(meal)} hitSlop={10}>
                    <Ionicons name="trash-outline" size={20} color="#E5484D" />
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  {[
                    ["Protein", totals.protein],
                    ["Carbs", totals.carbs],
                    ["Fat", totals.fat],
                  ].map(([label, value]) => (
                    <View
                      key={String(label)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 999,
                        backgroundColor: SCREEN_COLORS.cardSoft,
                        borderWidth: 1,
                        borderColor: SCREEN_COLORS.border,
                      }}
                    >
                      <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, fontWeight: "700" }}>
                        {label}: {Math.round(Number(value ?? 0))}g
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isLoggingId === meal._id}
                  onPress={() => void logMeal(meal._id)}
                  style={{
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: SCREEN_COLORS.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                    opacity: isLoggingId === meal._id ? 0.65 : 1,
                  }}
                >
                  {isLoggingId === meal._id ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  )}
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>
                    Add to {String(mealType)}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function ScannerResultModal({
  visible,
  result,
  foods,
  barcodeInput,
  isBusy,
  onBarcodeChange,
  onClose,
  onLookupBarcode,
  onConfirm,
  onUpdateFood,
}: {
  visible: boolean;
  result: ScanResult | null;
  foods: ScanFood[];
  barcodeInput: string;
  isBusy: boolean;
  onBarcodeChange: (value: string) => void;
  onClose: () => void;
  onLookupBarcode: () => void;
  onConfirm: () => void;
  onUpdateFood: (index: number, field: keyof ScanFood, value: string) => void;
}) {
  const totals = result?.totals ?? {};

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(3,17,31,0.42)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            maxHeight: "88%",
            backgroundColor: SCREEN_COLORS.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 14,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: SCREEN_COLORS.border,
            }}
          >
            <View>
              <Text style={{ color: SCREEN_COLORS.text, fontSize: 18, fontWeight: "900" }}>
                Food scanner
              </Text>
              <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                Review before adding to diary
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={SCREEN_COLORS.primaryDark} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 26 }} keyboardShouldPersistTaps="handled">
            {!result ? (
              <View style={{ gap: 12 }}>
                <Text style={{ color: SCREEN_COLORS.text, fontSize: 15, fontWeight: "800" }}>
                  Scan barcode / QR code
                </Text>
                <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 13, lineHeight: 19 }}>
                  Enter the barcode number from packaged food. The backend checks OpenFoodFacts and saves the result after confirmation.
                </Text>
                <TextInput
                  value={barcodeInput}
                  onChangeText={onBarcodeChange}
                  keyboardType="number-pad"
                  placeholder="Enter barcode number"
                  placeholderTextColor={SCREEN_COLORS.textMuted}
                  style={{
                    height: 48,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: SCREEN_COLORS.border,
                    backgroundColor: SCREEN_COLORS.card,
                    paddingHorizontal: 14,
                    color: SCREEN_COLORS.text,
                    fontSize: 15,
                  }}
                />
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isBusy || barcodeInput.replace(/\D/g, "").length < 6}
                  onPress={onLookupBarcode}
                  style={{
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: SCREEN_COLORS.primary,
                    opacity: isBusy || barcodeInput.replace(/\D/g, "").length < 6 ? 0.55 : 1,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  {isBusy ? <ActivityIndicator color="#fff" /> : <Ionicons name="barcode-outline" size={19} color="#fff" />}
                  <Text style={{ color: "#fff", fontWeight: "900" }}>Lookup food</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                <View
                  style={{
                    backgroundColor: SCREEN_COLORS.card,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: SCREEN_COLORS.border,
                    padding: 14,
                    gap: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: SCREEN_COLORS.text, fontSize: 15, fontWeight: "900" }}>
                      {result.source === "camera" ? "AI image analysis" : "Barcode lookup"}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 999,
                        backgroundColor: SCREEN_COLORS.iconBg,
                      }}
                    >
                      <Text style={{ color: SCREEN_COLORS.primaryDark, fontSize: 12, fontWeight: "800" }}>
                        Score {Math.round(result.mealHealthScore ?? 0)}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 13, lineHeight: 19 }}>
                    {result.insight || "Adjust values if needed, then add this scan to your selected meal."}
                  </Text>
                  {(result.unhealthyFlags ?? []).length ? (
                    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                      {result.unhealthyFlags?.map((flag) => (
                        <Text
                          key={flag}
                          style={{
                            color: "#9A3412",
                            backgroundColor: "#FFF7ED",
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            fontSize: 12,
                            fontWeight: "800",
                          }}
                        >
                          {flag}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>

                {foods.map((food, index) => (
                  <View
                    key={`${food.name}-${index}`}
                    style={{
                      backgroundColor: SCREEN_COLORS.card,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: SCREEN_COLORS.border,
                      padding: 14,
                      gap: 10,
                    }}
                  >
                    <TextInput
                      value={food.name}
                      onChangeText={(value) => onUpdateFood(index, "name", value)}
                      placeholder="Food name"
                      placeholderTextColor={SCREEN_COLORS.textMuted}
                      style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "900" }}
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TextInput
                        value={toNumberInput(food.servingSize ?? 1)}
                        onChangeText={(value) => onUpdateFood(index, "servingSize", value)}
                        keyboardType="decimal-pad"
                        placeholder="Serving"
                        style={{
                          flex: 1,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: SCREEN_COLORS.border,
                          paddingHorizontal: 10,
                          color: SCREEN_COLORS.text,
                        }}
                      />
                      <TextInput
                        value={food.servingUnit ?? "serving"}
                        onChangeText={(value) => onUpdateFood(index, "servingUnit", value)}
                        placeholder="Unit"
                        style={{
                          flex: 1,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: SCREEN_COLORS.border,
                          paddingHorizontal: 10,
                          color: SCREEN_COLORS.text,
                        }}
                      />
                    </View>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {[
                        ["calories", "kcal"],
                        ["protein", "protein"],
                        ["carbs", "carbs"],
                        ["fat", "fat"],
                        ["sugar", "sugar"],
                        ["fiber", "fiber"],
                      ].map(([field, label]) => (
                        <View key={field} style={{ width: "31%" }}>
                          <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 11, marginBottom: 4 }}>
                            {label}
                          </Text>
                          <TextInput
                            value={toNumberInput(food[field as keyof ScanFood])}
                            onChangeText={(value) => onUpdateFood(index, field as keyof ScanFood, value)}
                            keyboardType="decimal-pad"
                            style={{
                              height: 38,
                              borderRadius: 10,
                              borderWidth: 1,
                              borderColor: SCREEN_COLORS.border,
                              paddingHorizontal: 8,
                              color: SCREEN_COLORS.text,
                              fontSize: 13,
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                ))}

                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, fontWeight: "800" }}>
                    Total: {Math.round(totals.calories ?? 0)} kcal
                  </Text>
                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, fontWeight: "800" }}>
                    Protein: {Math.round(totals.protein ?? 0)}g
                  </Text>
                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, fontWeight: "800" }}>
                    Carbs: {Math.round(totals.carbs ?? 0)}g
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isBusy}
                  onPress={onConfirm}
                  style={{
                    height: 50,
                    borderRadius: 14,
                    backgroundColor: SCREEN_COLORS.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                    opacity: isBusy ? 0.65 : 1,
                  }}
                >
                  {isBusy ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "900" }}>
                    Add scanned food
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function AddMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ meal?: string; date?: string; focusSearch?: string; tab?: string }>();
  const { logFoods } = useNutrition();
  const mealLabel = params.meal ?? "Breakfast";
  const mealType = normalizeMealTypeLabel(params.meal);
  const shouldFocusSearch = params.focusSearch === "1";
  const initialTab = params.tab === "saved-meals" ? SAVED_MEALS_TAB_INDEX : FOOD_TAB_INDEX;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scannerResult, setScannerResult] = useState<ScanResult | null>(null);
  const [scannerFoods, setScannerFoods] = useState<ScanFood[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannerBusy, setScannerBusy] = useState(false);
  const [scannerPremiumChecking, setScannerPremiumChecking] = useState(false);
  const pagerRef = useRef<ScrollView>(null);

  const selectedDate = parseIsoDateParam(params.date);
  const selectedDateIso = formatIsoDate(selectedDate);

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

  const toggleFood = (foodId: string) => {
    setSelectedFoodIds((current) =>
      current.includes(foodId) ? current.filter((id) => id !== foodId) : [...current, foodId],
    );
  };

  const saveSelectedFoods = async () => {
    const foodIds = [...new Set(selectedFoodIds)];
    if (!foodIds.length || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      console.info("[AddMeal] Saving selected foods", {
        mealType,
        date: selectedDateIso,
        count: foodIds.length,
      });

      // The previous implementation only selected foods locally in FoodTab.
      // Persist each selected item through the shared nutrition context so the
      // backend save and diary refetch stay in sync for every meal type.
      const entries = await logFoods(
        foodIds.map((foodId) => ({ foodId, mealType, quantity: 1, date: selectedDate })),
        selectedDate
      );

      console.info("[AddMeal] Saved selected foods", {
        mealType,
        date: selectedDateIso,
        savedCount: entries.length,
      });

      setSelectedFoodIds([]);
      router.replace(`/diary?date=${selectedDateIso}`);
    } catch (error) {
      console.warn("[AddMeal] Failed to save selected foods", error);
      Alert.alert("Could not save meal", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const showScannerPremiumAlert = () => {
    Alert.alert(
      "Premium scanner",
      "Camera and QR scan are premium features. Upgrade to use meal scanning.",
      [
        { text: "Not now", style: "cancel" },
        { text: "View Premium", onPress: () => router.push("/premium-plan") },
      ]
    );
  };

  const isScannerPremiumActive = (status: any) => {
    const expiresAt = status?.premium?.expiresAt ? new Date(status.premium.expiresAt).getTime() : 0;
    return Boolean(status?.isPremium || (status?.premium?.status === "active" && expiresAt > Date.now()));
  };

  const isPaymentRequiredError = (error: unknown) =>
    typeof error === "object" && error !== null && "status" in error && (error as any).status === 402;

  const ensureScannerPremium = async () => {
    if (scannerPremiumChecking) return false;

    setScannerPremiumChecking(true);
    try {
      const status = await getPremiumStatus();
      if (isScannerPremiumActive(status)) {
        return true;
      }

      showScannerPremiumAlert();
      return false;
    } catch (error) {
      if (isPaymentRequiredError(error)) {
        showScannerPremiumAlert();
        return false;
      }

      console.warn("[Scanner] Premium check failed", error);
      Alert.alert("Could not check premium", error instanceof Error ? error.message : "Please try again.");
      return false;
    } finally {
      setScannerPremiumChecking(false);
    }
  };

  const handleScannerPremiumError = (error: unknown) => {
    if (!isPaymentRequiredError(error)) {
      return false;
    }

    setScannerVisible(false);
    showScannerPremiumAlert();
    return true;
  };

  const openBarcodeScanner = async () => {
    if (scannerBusy || !(await ensureScannerPremium())) return;

    setScannerResult(null);
    setScannerFoods([]);
    setBarcodeInput("");
    setScannerVisible(true);
  };

  const openCameraScanner = async () => {
    if (scannerBusy) return;
    if (!(await ensureScannerPremium())) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera permission needed", "Allow camera access to scan meals with AI.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.55,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    const asset = result.assets[0];
    setScannerBusy(true);
    setScannerVisible(true);
    setScannerResult(null);
    setScannerFoods([]);

    try {
      const scan = await analyzeFoodImage({
        uri: asset.uri,
        name: asset.fileName || `meal-${Date.now()}.jpg`,
        type: inferImageType(asset.uri, asset.mimeType),
        mealType,
      });
      setScannerResult(scan);
      setScannerFoods(scan.foods ?? []);
    } catch (error) {
      console.warn("[Scanner] Image analysis failed", error);
      setScannerVisible(false);
      if (handleScannerPremiumError(error)) return;
      Alert.alert("Could not analyze meal", error instanceof Error ? error.message : "Please try another photo.");
    } finally {
      setScannerBusy(false);
    }
  };

  const lookupBarcode = async () => {
    const barcode = barcodeInput.replace(/\D/g, "");
    if (barcode.length < 6 || scannerBusy) return;

    setScannerBusy(true);
    try {
      const scan = await lookupBarcodeFood({ barcode, mealType });
      setScannerResult(scan);
      setScannerFoods(scan.foods ?? []);
    } catch (error) {
      console.warn("[Scanner] Barcode lookup failed", error);
      if (handleScannerPremiumError(error)) return;
      Alert.alert("Could not find barcode", error instanceof Error ? error.message : "Try another barcode.");
    } finally {
      setScannerBusy(false);
    }
  };

  const updateScannerFood = (index: number, field: keyof ScanFood, value: string) => {
    setScannerFoods((current) =>
      current.map((food, foodIndex) => {
        if (foodIndex !== index) return food;
        const numericFields: Array<keyof ScanFood> = [
          "servingSize",
          "calories",
          "protein",
          "carbs",
          "fat",
          "sugar",
          "fiber",
          "sodium",
          "confidence",
        ];
        return {
          ...food,
          [field]: numericFields.includes(field) ? Number(value) || 0 : value,
        };
      })
    );
  };

  const confirmScannerResult = async () => {
    if (!scannerResult || scannerBusy) return;
    const validFoods = scannerFoods.filter((food) => food.name.trim());
    if (!validFoods.length) {
      Alert.alert("Food needed", "Keep at least one detected food before adding.");
      return;
    }

    setScannerBusy(true);
    try {
      await confirmScannedFood({
        scanId: scannerResult._id,
        mealType,
        date: selectedDate,
        foods: validFoods,
      });
      setScannerVisible(false);
      setScannerResult(null);
      setScannerFoods([]);
      router.replace(`/diary?date=${selectedDateIso}`);
    } catch (error) {
      console.warn("[Scanner] Confirm failed", error);
      if (handleScannerPremiumError(error)) return;
      Alert.alert("Could not add scanned food", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setScannerBusy(false);
    }
  };

  useEffect(() => {
    if (!shouldFocusSearch) {
      return;
    }

    setActiveTab(FOOD_TAB_INDEX);
    const timer = setTimeout(() => {
      pagerRef.current?.scrollTo({ x: FOOD_TAB_INDEX * SCREEN_WIDTH, animated: false });
    }, 0);

    return () => clearTimeout(timer);
  }, [shouldFocusSearch]);

  useEffect(() => {
    if (params.tab !== "saved-meals") {
      return;
    }

    setActiveTab(SAVED_MEALS_TAB_INDEX);
    const timer = setTimeout(() => {
      pagerRef.current?.scrollTo({ x: SAVED_MEALS_TAB_INDEX * SCREEN_WIDTH, animated: false });
    }, 0);

    return () => clearTimeout(timer);
  }, [params.tab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }} edges={["top"]}>
      <ScreenBackground>
      <Header />
      {false ? (<>
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: SCREEN_COLORS.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: SCREEN_COLORS.iconBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={20} color={SCREEN_COLORS.primaryDark} />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 17, fontWeight: "700" }}>
              {mealLabel}
            </Text>
            <Ionicons name="chevron-down" size={16} color={SCREEN_COLORS.textMuted} />
          </TouchableOpacity>
          <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
            {formatHeaderDate(selectedDate)}
          </Text>
        </View>

        {/* Spacer to balance close button */}
        <View style={{ width: 36 }} />
      </View>

      {/* ── Tab Bar ── */}
      </>) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: SCREEN_COLORS.border,
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
                activeTab === index ? SCREEN_COLORS.primary : "transparent",
            }}
          >
            <Text
              style={{
                color: activeTab === index ? SCREEN_COLORS.primary : SCREEN_COLORS.textMuted,
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
          <FoodTab
            autoFocus={shouldFocusSearch && activeTab === FOOD_TAB_INDEX}
            selectedFoodIds={selectedFoodIds}
            onToggleFood={toggleFood}
          />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <RecentlyEatenTab meal={mealLabel} />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <MostEatenTab />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <SavedMealsTab
            selectedFoodIds={selectedFoodIds}
            mealType={mealType}
            selectedDate={selectedDate}
            selectedDateIso={selectedDateIso}
            onLogged={() => setSelectedFoodIds([])}
          />
        </View>
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <ScannerResultModal
        visible={scannerVisible}
        result={scannerResult}
        foods={scannerFoods}
        barcodeInput={barcodeInput}
        isBusy={scannerBusy}
        onBarcodeChange={setBarcodeInput}
        onClose={() => {
          if (scannerBusy) return;
          setScannerVisible(false);
          setScannerResult(null);
          setScannerFoods([]);
        }}
        onLookupBarcode={() => void lookupBarcode()}
        onConfirm={() => void confirmScannerResult()}
        onUpdateFood={updateScannerFood}
      />

      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.94)",
          borderTopWidth: 1,
          borderTopColor: SCREEN_COLORS.border,
          paddingTop: 14,
          paddingBottom: 28,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={selectedFoodIds.length === 0 || isSaving}
          onPress={() => void saveSelectedFoods()}
          style={{
            flex: 1,
            height: 52,
            borderRadius: 14,
            backgroundColor: SCREEN_COLORS.primary,
            alignItems: "center",
            justifyContent: "center",
            opacity: selectedFoodIds.length === 0 || isSaving ? 0.55 : 1,
          }}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>
              {selectedFoodIds.length ? `Add ${selectedFoodIds.length} to ${String(mealLabel)}` : "Select food"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Camera */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={scannerBusy || scannerPremiumChecking}
          onPress={() => void openCameraScanner()}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: SCREEN_COLORS.iconBg,
            borderWidth: 1,
            borderColor: SCREEN_COLORS.primary,
            alignItems: "center",
            justifyContent: "center",
            opacity: scannerBusy || scannerPremiumChecking ? 0.6 : 1,
          }}
        >
          <Ionicons name="camera-outline" size={24} color={SCREEN_COLORS.primary} />
        </TouchableOpacity>

        {/* QR / Barcode */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={scannerBusy || scannerPremiumChecking}
          onPress={() => void openBarcodeScanner()}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: "transparent",
            borderWidth: 1.5,
            borderColor: SCREEN_COLORS.primary,
            alignItems: "center",
            justifyContent: "center",
            opacity: scannerBusy || scannerPremiumChecking ? 0.6 : 1,
          }}
        >
          <Ionicons name="barcode-outline" size={24} color={SCREEN_COLORS.primary} />
        </TouchableOpacity>
      </View>
      </ScreenBackground>
    </SafeAreaView>
  );
}
