import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppBottomNav } from "../components/AppBottomNav";
import { Header } from "../components/Header";
import { DaySelector } from "../components/DaySelector";
import { MealPlanCards } from "../components/MealPlanCards";
import { MealSection } from "../components/MealSection";
import { InfoCard } from "../components/InfoCard";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";
import { SummaryGrid, PixelGrid } from "../components/SummaryGrid";
import { getDailyNutritionReport } from "../src/services/backendApi";

const CALORIES_GOAL = 3000;

function parseIsoDate(value?: string | string[]): Date | null {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return null;
  }

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDaySelectorIndex(date: Date): number {
  const day = date.getDay();

  return day === 0 ? 6 : day - 1;
}

interface DiaryState {
  currentDayIndex: number;
  consumed: number;
  isSummaryCollapsed: boolean;
  showCustomMeals: boolean;
  showWaterTracker: boolean;
}

export default function DiaryHomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();

  const selectedDate = useMemo(() => parseIsoDate(params.date), [params.date]);
  const selectedDateForCalendar = selectedDate ?? new Date();
  const selectedDateIso = formatIsoDate(selectedDateForCalendar);

  const [state, setState] = useState<DiaryState>({
    currentDayIndex: getDaySelectorIndex(selectedDateForCalendar),
    consumed: 0,
    isSummaryCollapsed: false,
    showCustomMeals: true,
    showWaterTracker: true,
  });
  const [report, setReport] = useState<any>(null);

  const consumed = Math.round(report?.totals?.calories ?? state.consumed);
  const remaining = CALORIES_GOAL - consumed;

  const updateState = (partial: Partial<DiaryState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    updateState({ currentDayIndex: getDaySelectorIndex(selectedDate) });
  }, [selectedDate]);

  useEffect(() => {
    let isActive = true;

    getDailyNutritionReport(selectedDateForCalendar)
      .then((data) => {
        if (isActive) {
          setReport(data);
          updateState({ consumed: Math.round(data?.totals?.calories ?? 0) });
        }
      })
      .catch(() => {
        if (isActive) {
          setReport(null);
          updateState({ consumed: 0 });
        }
      });

    return () => {
      isActive = false;
    };
  }, [selectedDateIso]);

  const getMeal = (mealType: string) => report?.meals?.[mealType] ?? { foods: [] };
  const openAddMeal = (meal: string) => router.push(`/add-meal?meal=${meal}&date=${selectedDateIso}`);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }}
      edges={["top"]}
    >
      <ScreenBackground>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 116 }}
        >
        {/* ── Header ── */}
        <Header
          notificationCount={1}
          onCalendarPress={() => router.push(`/calendar?date=${selectedDateIso}`)}
        />

        {/* ── Day Selector ── */}
        <DaySelector
          currentDayIndex={state.currentDayIndex}
          streakCount={0}
          onDayPress={(index) => updateState({ currentDayIndex: index })}
        />

        {/* ── Meal Plan Cards ── */}
        <MealPlanCards />

        {/* ── Calories Summary ── */}
        <SummaryGrid
          remaining={remaining}
          consumed={consumed}
          goal={CALORIES_GOAL}
          isCollapsed={state.isSummaryCollapsed}
          onToggleCollapse={() =>
            updateState({ isSummaryCollapsed: !state.isSummaryCollapsed })
          }
        />

        {/* ── Meal Sections ── */}
        <MealSection
          title="Breakfast"
          iconName="partly-sunny"
          iconColor="#FBBF24"
          caloriesLogged={Math.round(getMeal("breakfast").totalCalories ?? 0)}
          foods={getMeal("breakfast").foods}
          onPress={() => openAddMeal("Breakfast")}
          onAdd={() => openAddMeal("Breakfast")}
        />
        <MealSection
          title="Lunch"
          iconName="sunny"
          iconColor="#EAB308"
          caloriesLogged={Math.round(getMeal("lunch").totalCalories ?? 0)}
          foods={getMeal("lunch").foods}
          onPress={() => openAddMeal("Lunch")}
          onAdd={() => openAddMeal("Lunch")}
        />
        <MealSection
          title="Dinner"
          iconName="moon-outline"
          iconColor="#F97316"
          caloriesLogged={Math.round(getMeal("dinner").totalCalories ?? 0)}
          foods={getMeal("dinner").foods}
          onPress={() => openAddMeal("Dinner")}
          onAdd={() => openAddMeal("Dinner")}
        />
        <MealSection
          title="Snacks/Other"
          iconName="moon"
          iconColor="#A78BFA"
          caloriesLogged={Math.round(getMeal("snacks").totalCalories ?? 0)}
          foods={getMeal("snacks").foods}
          onPress={() => openAddMeal("Snacks")}
          onAdd={() => openAddMeal("Snacks")}
        />

        {/* ── Info Cards ── */}
        {state.showCustomMeals && (
          <InfoCard
            title="Custom Meals"
            subtitle="Track more than the main meals"
            iconName="restaurant"
            iconColor="#EF4444"
            onClose={() => updateState({ showCustomMeals: false })}
          />
        )}

        {state.showWaterTracker && (
          <InfoCard
            title="Water Tracker"
            subtitle="Track your daily hydration goals"
            iconName="water"
            iconColor="#38BDF8"
            onClose={() => updateState({ showWaterTracker: false })}
          />
        )}

        {/* ── Add Exercise/Sleep ── */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: SCREEN_COLORS.card,
            borderWidth: 1,
            borderColor: SCREEN_COLORS.border,
            borderRadius: 16,
            marginHorizontal: 16,
            marginBottom: 16,
            paddingVertical: 16,
            gap: 8,
          }}
        >
          <Ionicons name="walk" size={20} color={SCREEN_COLORS.textMuted} />
          <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 15 }}>
            Add Exercise/Sleep
          </Text>
        </TouchableOpacity>

        {/* ── Bottom Summary ── */}
        <View
          style={{
            backgroundColor: SCREEN_COLORS.card,
            borderWidth: 1,
            borderColor: SCREEN_COLORS.border,
            borderRadius: 16,
            marginHorizontal: 16,
            padding: 16,
          }}
        >
          <Text
            style={{
              color: SCREEN_COLORS.text,
              fontWeight: "600",
              fontSize: 16,
              marginBottom: 14,
            }}
          >
            Summary
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ gap: 10 }}>
              <View>
                <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginBottom: 2 }}>
                  Calories Remaining
                </Text>
                <Text
                  style={{ color: SCREEN_COLORS.text, fontWeight: "600", fontSize: 16 }}
                >
                  {remaining.toLocaleString()}
                </Text>
              </View>
              <View>
                <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginBottom: 2 }}>
                  Calories Consumed
                </Text>
                <Text
                  style={{ color: SCREEN_COLORS.text, fontWeight: "600", fontSize: 16 }}
                >
                  {consumed}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: SCREEN_COLORS.textMuted,
                    fontSize: 12,
                    fontStyle: "italic",
                    marginBottom: 2,
                  }}
                >
                  % of RDI
                </Text>
                <Text
                  style={{ color: SCREEN_COLORS.text, fontWeight: "600", fontSize: 16 }}
                >
                  {CALORIES_GOAL.toLocaleString()}
                </Text>
              </View>
            </View>

            <PixelGrid
              filledCells={Math.round(
                (consumed / CALORIES_GOAL) * 64
              )}
              cellSize={7}
              cellGap={1.5}
            />
          </View>
        </View>
        </ScrollView>

        <AppBottomNav />
      </ScreenBackground>
    </SafeAreaView>
  );
}
