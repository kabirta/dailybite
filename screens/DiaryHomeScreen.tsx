import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
import { useNutrition } from "../src/context/NutritionContext";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const DEFAULT_CALORIES_GOAL = 3000;

function parseIsoDate(value?: string | string[]): Date | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
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

function getDateForWeekIndex(anchorDate: Date, index: number): Date {
  const monday = new Date(anchorDate);
  monday.setDate(anchorDate.getDate() - getDaySelectorIndex(anchorDate));
  monday.setHours(12, 0, 0, 0);

  const date = new Date(monday);
  date.setDate(monday.getDate() + index);
  return date;
}

function formatMinutes(minutes?: number): string {
  const safeMinutes = Math.max(0, Math.round(minutes ?? 0));
  const hours = Math.floor(safeMinutes / 60);
  const rest = safeMinutes % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

function getBestStreak(streaks: any[] = []) {
  return streaks.reduce((best, streak) => Math.max(best, Number(streak?.currentStreak || 0)), 0);
}

function buildSleepWindow(date: Date, hours: number) {
  const sleepEnd = new Date(date);
  sleepEnd.setHours(7, 0, 0, 0);
  const sleepStart = new Date(sleepEnd.getTime() - Math.max(hours, 0.25) * 60 * 60 * 1000);
  return { sleepStart, sleepEnd };
}

function buildLogTime(date: Date) {
  const loggedAt = new Date(date);
  loggedAt.setHours(12, 0, 0, 0);
  return loggedAt;
}

function ProgressLine({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const progress = Math.min(value / Math.max(target, 1), 1);

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: SCREEN_COLORS.text, fontSize: 13, fontWeight: "600" }}>{label}</Text>
        <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12 }}>
          {Math.round(value).toLocaleString()} / {Math.round(target).toLocaleString()}
        </Text>
      </View>
      <View style={{ height: 7, borderRadius: 999, backgroundColor: "#d8ecff", overflow: "hidden" }}>
        <View style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 999, backgroundColor: color }} />
      </View>
    </View>
  );
}

function MetricCard({
  title,
  subtitle,
  iconName,
  iconColor,
  children,
  flush = false,
}: {
  title: string;
  subtitle: string;
  iconName: IoniconsName;
  iconColor: string;
  children?: React.ReactNode;
  flush?: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: SCREEN_COLORS.card,
        borderWidth: 1,
        borderColor: SCREEN_COLORS.border,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: flush ? 0 : 16,
        marginBottom: 8,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: SCREEN_COLORS.iconBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: SCREEN_COLORS.text, fontWeight: "700", fontSize: 15 }}>{title}</Text>
          <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function QuickButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flex: 1,
        minHeight: 38,
        borderRadius: 12,
        backgroundColor: SCREEN_COLORS.cardSoft,
        borderWidth: 1,
        borderColor: SCREEN_COLORS.border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: SCREEN_COLORS.primary, fontSize: 13, fontWeight: "700" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function InlineInput({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={SCREEN_COLORS.textMuted}
      keyboardType="numeric"
      style={{
        flex: 1,
        minHeight: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: SCREEN_COLORS.border,
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        color: SCREEN_COLORS.text,
        fontSize: 14,
      }}
    />
  );
}

export default function DiaryHomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const {
    addExercise,
    addSleep,
    addWater,
    addWeight,
    dailyReport,
    editMeal,
    isLoadingReport,
    lastDeletedMealEntry,
    refreshDailyReport,
    removeMeal,
    reportError,
    undoDeleteMeal,
  } = useNutrition();

  const selectedDate = useMemo(() => parseIsoDate(params.date), [params.date]);
  const selectedDateForCalendar = selectedDate ?? new Date();
  const selectedDateIso = formatIsoDate(selectedDateForCalendar);

  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
  const [showCustomMeals, setShowCustomMeals] = useState(true);
  const [showWaterTracker, setShowWaterTracker] = useState(true);
  const [customWaterMl, setCustomWaterMl] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("30");
  const [sleepHours, setSleepHours] = useState("8");

  useEffect(() => {
    let isActive = true;
    refreshDailyReport(selectedDateForCalendar).catch(() => {
      if (isActive) {
        // reportError is surfaced in the UI from context.
      }
    });

    return () => {
      isActive = false;
    };
  }, [refreshDailyReport, selectedDateIso]);

  const report = dailyReport;
  const goal = Math.round(report?.calorieTarget ?? DEFAULT_CALORIES_GOAL);
  const consumed = Math.round(report?.caloriesConsumed ?? report?.totals?.calories ?? 0);
  const burned = Math.round(report?.caloriesBurned ?? 0);
  const remaining = Math.round(report?.remainingCalories ?? goal - consumed + burned);
  const bestStreak = getBestStreak(report?.streaks ?? []);
  const currentDayIndex = getDaySelectorIndex(selectedDateForCalendar);
  const water = report?.water ?? {};
  const sleep = report?.sleep ?? {};
  const exercise = report?.exercise ?? {};
  const weight = report?.weight ?? {};

  const getMeal = useCallback(
    (mealType: string) => report?.meals?.[mealType] ?? { foods: [] },
    [report]
  );

  const openAddMeal = (meal: string) => router.push(`/add-meal?meal=${meal}&date=${selectedDateIso}`);

  const onDayPress = (index: number) => {
    const date = getDateForWeekIndex(selectedDateForCalendar, index);
    router.setParams({ date: formatIsoDate(date) });
  };

  const handleWater = async (amountMl: number) => {
    if (!Number.isFinite(amountMl) || amountMl <= 0) {
      Alert.alert("Water amount", "Enter a valid water amount.");
      return;
    }

    try {
      await addWater({ amountMl, loggedAt: buildLogTime(selectedDateForCalendar) }, selectedDateForCalendar);
      setCustomWaterMl("");
    } catch (error) {
      Alert.alert("Water log failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleWeight = async () => {
    const weightValue = Number(weightKg);
    if (!Number.isFinite(weightValue) || weightValue <= 0) {
      Alert.alert("Weight", "Enter a valid weight in kg.");
      return;
    }

    try {
      await addWeight({ weight: weightValue, loggedAt: buildLogTime(selectedDateForCalendar) }, selectedDateForCalendar);
      setWeightKg("");
    } catch (error) {
      Alert.alert("Weight log failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleExercise = async () => {
    const minutes = Number(exerciseMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      Alert.alert("Exercise", "Enter exercise duration in minutes.");
      return;
    }

    try {
      await addExercise(
        {
          exerciseName: "Walking",
          category: "walking",
          durationMinutes: minutes,
          estimationMode: "auto",
          loggedAt: buildLogTime(selectedDateForCalendar).toISOString(),
        },
        selectedDateForCalendar
      );
      setExerciseMinutes("30");
    } catch (error) {
      Alert.alert("Exercise log failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleSleep = async () => {
    const hours = Number(sleepHours);
    if (!Number.isFinite(hours) || hours <= 0) {
      Alert.alert("Sleep", "Enter sleep hours.");
      return;
    }

    const { sleepStart, sleepEnd } = buildSleepWindow(selectedDateForCalendar, hours);
    try {
      await addSleep(
        {
          sleepStart: sleepStart.toISOString(),
          sleepEnd: sleepEnd.toISOString(),
          quality: "good",
        },
        selectedDateForCalendar
      );
      setSleepHours("8");
    } catch (error) {
      Alert.alert("Sleep log failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleEditEntry = (entry: any) => {
    const entryId = String(entry?.id ?? "");
    if (!entryId) return;

    const editQuantity = async (quantity: number) => {
      try {
        await editMeal(entryId, { quantity }, selectedDateForCalendar);
      } catch (error) {
        Alert.alert("Could not edit meal", error instanceof Error ? error.message : "Please try again.");
      }
    };

    Alert.alert("Edit meal", entry?.food?.name ?? "Meal entry", [
      { text: "0.5x", onPress: () => void editQuantity(0.5) },
      { text: "1x", onPress: () => void editQuantity(1) },
      { text: "2x", onPress: () => void editQuantity(2) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleDeleteEntry = (entry: any) => {
    const entryId = String(entry?.id ?? "");
    if (!entryId) return;

    Alert.alert("Delete meal", `Remove ${entry?.food?.name ?? "this item"} from the diary?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void removeMeal(entryId, selectedDateForCalendar).catch((error) => {
            Alert.alert("Could not delete meal", error instanceof Error ? error.message : "Please try again.");
          });
        },
      },
    ]);
  };

  const handleUndoDelete = async () => {
    try {
      await undoDeleteMeal(selectedDateForCalendar);
    } catch (error) {
      Alert.alert("Undo failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const shareSummary = async () => {
    const message = [
      `DailyBite summary for ${selectedDateIso}`,
      `${consumed} kcal consumed, ${burned} kcal burned, ${remaining} kcal remaining.`,
      `Water: ${Math.round(water.totalMl ?? 0)} ml. Sleep: ${formatMinutes(sleep.totalMinutes)}. Exercise: ${formatMinutes(exercise.totalMinutes)}.`,
      report?.insightText ?? "",
    ]
      .filter(Boolean)
      .join("\n");

    await Share.share({ message });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }} edges={["top"]}>
      <ScreenBackground>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 116 }}>
          <Header notificationCount={1} onCalendarPress={() => router.push(`/calendar?date=${selectedDateIso}`)} />

          <DaySelector currentDayIndex={currentDayIndex} streakCount={bestStreak} onDayPress={onDayPress} />

          <MealPlanCards />

          {isLoadingReport && !report ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator color={SCREEN_COLORS.primary} />
            </View>
          ) : null}

          {reportError ? (
            <InfoCard
              title="Diary Sync"
              subtitle={reportError}
              iconName="alert-circle-outline"
              iconColor="#EF4444"
              onClose={() => undefined}
            />
          ) : null}

          <SummaryGrid
            remaining={remaining}
            consumed={consumed}
            goal={goal}
            macros={report?.macros}
            macroTargets={report?.macroTargets}
            isCollapsed={isSummaryCollapsed}
            onToggleCollapse={() => setIsSummaryCollapsed((value) => !value)}
          />

          <MealSection
            title="Breakfast"
            iconName="partly-sunny"
            iconColor="#FBBF24"
            caloriesLogged={Math.round(getMeal("breakfast").totalCalories ?? 0)}
            foods={getMeal("breakfast").foods}
            onPress={() => openAddMeal("Breakfast")}
            onAdd={() => openAddMeal("Breakfast")}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
          <MealSection
            title="Lunch"
            iconName="sunny"
            iconColor="#EAB308"
            caloriesLogged={Math.round(getMeal("lunch").totalCalories ?? 0)}
            foods={getMeal("lunch").foods}
            onPress={() => openAddMeal("Lunch")}
            onAdd={() => openAddMeal("Lunch")}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
          <MealSection
            title="Dinner"
            iconName="moon-outline"
            iconColor="#F97316"
            caloriesLogged={Math.round(getMeal("dinner").totalCalories ?? 0)}
            foods={getMeal("dinner").foods}
            onPress={() => openAddMeal("Dinner")}
            onAdd={() => openAddMeal("Dinner")}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
          <MealSection
            title="Snacks/Other"
            iconName="moon"
            iconColor="#A78BFA"
            caloriesLogged={Math.round(getMeal("snacks").totalCalories ?? 0)}
            foods={getMeal("snacks").foods}
            onPress={() => openAddMeal("Snacks")}
            onAdd={() => openAddMeal("Snacks")}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />

          {lastDeletedMealEntry ? (
            <MetricCard
              title="Meal Removed"
              subtitle="Undo is available until you delete another meal"
              iconName="refresh-outline"
              iconColor={SCREEN_COLORS.primary}
            >
              <TouchableOpacity
                onPress={handleUndoDelete}
                activeOpacity={0.75}
                style={{
                  minHeight: 40,
                  borderRadius: 12,
                  backgroundColor: SCREEN_COLORS.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Undo Delete</Text>
              </TouchableOpacity>
            </MetricCard>
          ) : null}

          <MetricCard
            title="Hydration"
            subtitle={`${Math.round(water.remainingMl ?? 0).toLocaleString()} ml remaining`}
            iconName="water"
            iconColor="#38BDF8"
          >
            <ProgressLine label="Water" value={Number(water.totalMl ?? 0)} target={Number(water.goalMl ?? 2500)} color="#38BDF8" />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <QuickButton label="250ml" onPress={() => void handleWater(250)} />
              <QuickButton label="500ml" onPress={() => void handleWater(500)} />
              <QuickButton label="1L" onPress={() => void handleWater(1000)} />
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <InlineInput value={customWaterMl} onChangeText={setCustomWaterMl} placeholder="Custom ml" />
              <TouchableOpacity
                onPress={() => void handleWater(Number(customWaterMl))}
                activeOpacity={0.75}
                style={{
                  width: 86,
                  borderRadius: 12,
                  backgroundColor: SCREEN_COLORS.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Add</Text>
              </TouchableOpacity>
            </View>
          </MetricCard>

          <View style={{ flexDirection: "row", marginHorizontal: 16, gap: 8, marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <MetricCard
                title="Sleep"
                subtitle={`${formatMinutes(sleep.totalMinutes)} logged`}
                iconName="bed-outline"
                iconColor="#8B5CF6"
                flush
              >
                <ProgressLine
                  label="Goal"
                  value={Number(sleep.totalMinutes ?? 0)}
                  target={Number(sleep.goalMinutes ?? 480)}
                  color="#8B5CF6"
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <InlineInput value={sleepHours} onChangeText={setSleepHours} placeholder="Hours" />
                  <QuickButton label="Log" onPress={() => void handleSleep()} />
                </View>
              </MetricCard>
            </View>
            <View style={{ flex: 1 }}>
              <MetricCard
                title="Exercise"
                subtitle={`${formatMinutes(exercise.totalMinutes)} today`}
                iconName="walk"
                iconColor="#22C55E"
                flush
              >
                <ProgressLine
                  label="Move"
                  value={Number(exercise.totalMinutes ?? 0)}
                  target={Number(exercise.goalMinutes ?? 30)}
                  color="#22C55E"
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <InlineInput value={exerciseMinutes} onChangeText={setExerciseMinutes} placeholder="Min" />
                  <QuickButton label="Log" onPress={() => void handleExercise()} />
                </View>
              </MetricCard>
            </View>
          </View>

          <MetricCard
            title="Weight"
            subtitle={
              weight.current
                ? `${Number(weight.current).toFixed(1)} kg now, BMI ${weight.bmi ?? "-"}`
                : "Add your first weight log"
            }
            iconName="scale-outline"
            iconColor="#F97316"
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              <InlineInput value={weightKg} onChangeText={setWeightKg} placeholder="Weight kg" />
              <TouchableOpacity
                onPress={() => void handleWeight()}
                activeOpacity={0.75}
                style={{
                  width: 86,
                  borderRadius: 12,
                  backgroundColor: SCREEN_COLORS.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </MetricCard>

          {showCustomMeals && (
            <InfoCard
              title="Custom Meals"
              subtitle="Track more than the main meals"
              iconName="restaurant"
              iconColor="#EF4444"
              onClose={() => setShowCustomMeals(false)}
            />
          )}

          {showWaterTracker && (
            <InfoCard
              title="Smart Reminders"
              subtitle="Water, meal, sleep, and exercise nudges are ready for your goals"
              iconName="notifications-outline"
              iconColor="#38BDF8"
              onClose={() => setShowWaterTracker(false)}
            />
          )}

          <View
            style={{
              backgroundColor: SCREEN_COLORS.card,
              borderWidth: 1,
              borderColor: SCREEN_COLORS.border,
              borderRadius: 16,
              marginHorizontal: 16,
              padding: 16,
              gap: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: SCREEN_COLORS.text, fontWeight: "700", fontSize: 16 }}>Daily Summary</Text>
              <TouchableOpacity onPress={shareSummary} activeOpacity={0.75}>
                <Ionicons name="share-outline" size={21} color={SCREEN_COLORS.primary} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 13, lineHeight: 19 }}>
              {report?.insightText ?? "Start with one quick log today to build momentum."}
            </Text>

            {(report?.recommendations ?? []).map((item: string) => (
              <View key={item} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                <Ionicons name="sparkles-outline" size={15} color={SCREEN_COLORS.primary} style={{ marginTop: 1 }} />
                <Text style={{ flex: 1, color: SCREEN_COLORS.text, fontSize: 13, lineHeight: 19 }}>{item}</Text>
              </View>
            ))}

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ gap: 10 }}>
                <View>
                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginBottom: 2 }}>Calories Remaining</Text>
                  <Text style={{ color: SCREEN_COLORS.text, fontWeight: "600", fontSize: 16 }}>{remaining.toLocaleString()}</Text>
                </View>
                <View>
                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginBottom: 2 }}>Goal</Text>
                  <Text style={{ color: SCREEN_COLORS.text, fontWeight: "600", fontSize: 16 }}>{goal.toLocaleString()}</Text>
                </View>
                <View>
                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginBottom: 2 }}>Streak</Text>
                  <Text style={{ color: SCREEN_COLORS.text, fontWeight: "600", fontSize: 16 }}>{bestStreak} days</Text>
                </View>
              </View>

              <PixelGrid filledCells={Math.round((consumed / Math.max(goal, 1)) * 64)} cellSize={7} cellGap={1.5} />
            </View>
          </View>
        </ScrollView>

        <AppBottomNav />
      </ScreenBackground>
    </SafeAreaView>
  );
}
