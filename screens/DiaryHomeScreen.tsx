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
import { SummaryGrid, PixelGrid } from "../components/SummaryGrid";

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

  const remaining = CALORIES_GOAL - state.consumed;

  const updateState = (partial: Partial<DiaryState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    updateState({ currentDayIndex: getDaySelectorIndex(selectedDate) });
  }, [selectedDate]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#030A23" }}
      edges={["top"]}
    >
      <View style={{ flex: 1 }}>
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
          consumed={state.consumed}
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
          onPress={() => router.push("/add-meal?meal=Breakfast")}
          onAdd={() => router.push("/add-meal?meal=Breakfast")}
        />
        <MealSection
          title="Lunch"
          iconName="sunny"
          iconColor="#EAB308"
          onPress={() => router.push("/add-meal?meal=Lunch")}
          onAdd={() => router.push("/add-meal?meal=Lunch")}
        />
        <MealSection
          title="Dinner"
          iconName="sunset-outline"
          iconColor="#F97316"
          onPress={() => router.push("/add-meal?meal=Dinner")}
          onAdd={() => router.push("/add-meal?meal=Dinner")}
        />
        <MealSection
          title="Snacks/Other"
          iconName="moon"
          iconColor="#A78BFA"
          onPress={() => router.push("/add-meal?meal=Snacks")}
          onAdd={() => router.push("/add-meal?meal=Snacks")}
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
            backgroundColor: "#0D1526",
            borderRadius: 16,
            marginHorizontal: 16,
            marginBottom: 16,
            paddingVertical: 16,
            gap: 8,
          }}
        >
          <Ionicons name="walk" size={20} color="#6B7280" />
          <Text style={{ color: "#6B7280", fontSize: 15 }}>
            Add Exercise/Sleep
          </Text>
        </TouchableOpacity>

        {/* ── Bottom Summary ── */}
        <View
          style={{
            backgroundColor: "#0D1526",
            borderRadius: 16,
            marginHorizontal: 16,
            padding: 16,
          }}
        >
          <Text
            style={{
              color: "#F1F5F9",
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
                <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 2 }}>
                  Calories Remaining
                </Text>
                <Text
                  style={{ color: "#F1F5F9", fontWeight: "600", fontSize: 16 }}
                >
                  {remaining.toLocaleString()}
                </Text>
              </View>
              <View>
                <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 2 }}>
                  Calories Consumed
                </Text>
                <Text
                  style={{ color: "#F1F5F9", fontWeight: "600", fontSize: 16 }}
                >
                  {state.consumed}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 12,
                    fontStyle: "italic",
                    marginBottom: 2,
                  }}
                >
                  % of RDI
                </Text>
                <Text
                  style={{ color: "#F1F5F9", fontWeight: "600", fontSize: 16 }}
                >
                  {CALORIES_GOAL.toLocaleString()}
                </Text>
              </View>
            </View>

            <PixelGrid
              filledCells={Math.round(
                (state.consumed / CALORIES_GOAL) * 64
              )}
              cellSize={7}
              cellGap={1.5}
            />
          </View>
        </View>
        </ScrollView>

        <AppBottomNav />
      </View>
    </SafeAreaView>
  );
}
