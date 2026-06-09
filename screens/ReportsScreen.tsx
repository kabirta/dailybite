import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBottomNav } from "../components/AppBottomNav";
import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";
import { getDiaryAnalytics } from "../src/services/backendApi";

// ─── Data (unchanged) ─────────────────────────────────────────────────────────

const REPORT_TABS = [
  { key: "calories", label: "CALORIES" },
  { key: "steps", label: "WATER" },
  { key: "macros", label: "MACROS" },
  { key: "nutrients", label: "NUTRIENTS" },
] as const;

type ReportTabKey = (typeof REPORT_TABS)[number]["key"];

const WEEK_DAYS = ["Mo 2", "Tu 3", "We 4", "Th 5", "Fr 6", "Sa 7", "Su 8"];
const STEP_GOAL = 10000;
const STEP_ROWS = [
  { day: "Monday", short: "Mo", steps: 0 },
  { day: "Tuesday", short: "Tu", steps: 0 },
  { day: "Wednesday", short: "We", steps: 0 },
  { day: "Thursday", short: "Th", steps: 0 },
  { day: "Friday", short: "Fr", steps: 0 },
  { day: "Saturday", short: "Sa", steps: 0 },
  { day: "Sunday", short: "Su", steps: 0 },
];

const MEAL_ROWS = [
  { label: "Breakfast", color: "#FFC107" },
  { label: "Lunch", color: "#14B8F5" },
  { label: "Dinner", color: "#FF9A70" },
  { label: "Snacks/Other", color: "#A86BE1" },
];

const MACRO_ROWS = [
  { label: "Carbohydrate", color: "#4DA8D8", goal: "50%" },
  { label: "Fat", color: "#D3A017", goal: "30%" },
  { label: "Protein", color: "#C9757E", goal: "20%" },
];

const NUTRIENT_ROWS = [
  { label: "Calories (kcal)", total: "-", goal: "21000", delta: "-" },
  { label: "Protein (g)", total: "-", goal: "1050", delta: "-" },
  { label: "Carbohydrate (g)", total: "-", goal: "2625", delta: "-" },
  { label: "Fiber (g)", total: "-", goal: "-", delta: "-" },
  { label: "Sugar (g)", total: "-", goal: "-", delta: "-" },
  { label: "Fat (g)", total: "-", goal: "700", delta: "-" },
  { label: "Saturated Fat (g)", total: "-", goal: "-", delta: "-" },
  { label: "Polyunsaturated Fat (g)", total: "-", goal: "-", delta: "-" },
  { label: "Monounsaturated Fat (g)", total: "-", goal: "-", delta: "-" },
  { label: "Cholesterol (mg)", total: "-", goal: "-", delta: "-" },
  { label: "Sodium (mg)", total: "-", goal: "-", delta: "-" },
  { label: "Potassium (mg)", total: "-", goal: "-", delta: "-" },
];

// ─── Design tokens ────────────────────────────────────────────────────────────

const BG = SCREEN_COLORS.background;
const CARD = SCREEN_COLORS.card;
const BORDER = SCREEN_COLORS.border;
const TEXT_PRIMARY = SCREEN_COLORS.text;
const TEXT_SECONDARY = SCREEN_COLORS.textMuted;
const ACCENT = SCREEN_COLORS.primary;
const GRID_LINE = "#d8ecff";

// ─── Shared sub-components ────────────────────────────────────────────────────

function ChartGrid() {
  return (
    <View style={{ height: 170, marginBottom: 10 }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {WEEK_DAYS.map((day, index) => (
          <View
            key={day}
            style={{
              flex: 1,
              borderLeftWidth: index === 0 ? 0 : 1,
              borderLeftColor: GRID_LINE,
            }}
          />
        ))}
      </View>

      {[43, 86, 129].map((top) => (
        <View
          key={top}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top,
            borderTopWidth: 1,
            borderTopColor: GRID_LINE,
          }}
        />
      ))}
    </View>
  );
}

function DayLabels() {
  return (
    <View style={{ flexDirection: "row", marginBottom: 10 }}>
      {WEEK_DAYS.map((day) => (
        <Text
          key={day}
          style={{
            flex: 1,
            textAlign: "center",
            color: TEXT_SECONDARY,
            fontSize: 11,
            fontWeight: "500",
          }}
        >
          {day}
        </Text>
      ))}
    </View>
  );
}

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: CARD,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: BORDER,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <Text
      style={{
        color: TEXT_PRIMARY,
        fontSize: 16,
        fontWeight: "700",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
      }}
    >
      {text}
    </Text>
  );
}

function RowDivider() {
  return <View style={{ height: 1, backgroundColor: BORDER }} />;
}

// ─── Header ───────────────────────────────────────────────────────────────────

function ReportsHeader() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
        paddingHorizontal: 4,
      }}
    >
      {/* Left: nutrition + notifications */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: SCREEN_COLORS.iconBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: "#EFE6CE",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="nutrition-outline" size={20} color="#8D7A5D" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: SCREEN_COLORS.iconBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="notifications-outline" size={22} color={SCREEN_COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* Right: Goals + locate */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ color: TEXT_PRIMARY, fontSize: 22, fontWeight: "700" }}>
          Goals
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: SCREEN_COLORS.iconBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="locate-outline" size={22} color={SCREEN_COLORS.primaryDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Week Picker ──────────────────────────────────────────────────────────────

function WeekPicker() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: CARD,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: BORDER,
        marginBottom: 16,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          width: 52,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="caret-back" size={20} color={TEXT_PRIMARY} />
      </TouchableOpacity>

      <View
        style={{
          flex: 1,
          height: 50,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: BORDER,
          paddingHorizontal: 14,
        }}
      >
        <Text style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: "600" }}>
          This Week
        </Text>
        <Ionicons name="chevron-down" size={18} color={TEXT_SECONDARY} />
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          width: 52,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="caret-forward" size={20} color={TEXT_PRIMARY} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Calories Panel ───────────────────────────────────────────────────────────

function CaloriesPanel({ analytics, report }: { analytics: any; report: any }) {
  const totals = report?.totals ?? {};
  const meals = report?.meals ?? {};
  const dailyCalories = Math.round(totals.calories ?? 0);
  const days = analytics?.days ?? [];
  const weeklyCalories = days.reduce((sum: number, day: any) => sum + Number(day?.caloriesConsumed ?? 0), 0);
  const calorieGoal = Math.round(report?.calorieTarget ?? 3000);
  const mealRows = MEAL_ROWS.map((meal) => {
    const key = meal.label === "Snacks/Other" ? "snacks" : meal.label.toLowerCase();
    const calories = Math.round(meals[key]?.totalCalories ?? 0);
    return {
      ...meal,
      calories,
      pct: dailyCalories ? Math.round((calories / dailyCalories) * 100) : 0,
    };
  });
  const foodsCount = Object.values(meals).reduce(
    (count: number, meal: any) => count + (meal?.foods?.length ?? 0),
    0,
  );

  return (
    <View style={{ gap: 12 }}>
      {/* Calories chart card */}
      <Card>
        <View style={{ padding: 16 }}>
          <Text style={{ color: TEXT_SECONDARY, fontSize: 12, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
            Weekly Total
          </Text>
          <Text
            style={{
              color: TEXT_PRIMARY,
              fontSize: 48,
              fontWeight: "700",
              lineHeight: 56,
            }}
          >
            {Math.round(weeklyCalories || dailyCalories)}
          </Text>
          <Text style={{ color: TEXT_SECONDARY, fontSize: 12, marginBottom: 14 }}>
            kcal
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: TEXT_SECONDARY }} />
              <Text style={{ color: TEXT_SECONDARY, fontSize: 13 }}>
                Daily Total: {dailyCalories}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(34,197,94,0.1)",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Ionicons name="flag" size={12} color={ACCENT} />
              <Text style={{ color: ACCENT, fontSize: 12, fontWeight: "600" }}>
                Goal: {calorieGoal} kcal
              </Text>
            </View>
          </View>

          {/* Dashed divider */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: BORDER,
              borderStyle: "dashed",
              marginBottom: 12,
            }}
          />

          <TrendBars
            days={days.length ? days : [report]}
            getValue={(day) => Number(day?.caloriesConsumed ?? day?.totals?.calories ?? 0)}
            color={ACCENT}
            unit="kcal"
          />
        </View>

        {/* Column header */}
        <RowDivider />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              width: 90,
              textAlign: "right",
              color: TEXT_SECONDARY,
              fontSize: 12,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            Cals{"\n"}(kcal)
          </Text>
        </View>

        {/* Meal rows */}
        {mealRows.map((meal) => (
          <View key={meal.label}>
            <RowDivider />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: meal.color,
                  }}
                />
                <Text style={{ color: TEXT_PRIMARY, fontSize: 14 }}>
                  {meal.label}
                </Text>
              </View>
              <Text
                style={{
                  width: 60,
                  textAlign: "right",
                  color: TEXT_SECONDARY,
                  fontSize: 14,
                }}
              >
                ({meal.pct}%)
              </Text>
              <Text
                style={{
                  width: 44,
                  textAlign: "right",
                  color: TEXT_PRIMARY,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {meal.calories || "-"}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Foods Eaten card */}
      <Card>
        <SectionTitle text="Foods Eaten" />
        <RowDivider />

        {/* Table header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <Text style={{ flex: 1, color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Foods
          </Text>
          <Text style={{ width: 90, textAlign: "center", color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Times{"\n"}Eaten
          </Text>
          <Text style={{ width: 72, textAlign: "right", color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Cals{"\n"}(kcal)
          </Text>
        </View>

        <RowDivider />

        {/* Total row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Text style={{ flex: 1, color: TEXT_PRIMARY, fontSize: 15, fontWeight: "700" }}>
            Total
          </Text>
          <Text style={{ width: 90, textAlign: "center", color: TEXT_PRIMARY, fontSize: 18, fontWeight: "700" }}>
            {foodsCount || "-"}
          </Text>
          <Text style={{ width: 72, textAlign: "right", color: TEXT_PRIMARY, fontSize: 18, fontWeight: "700" }}>
            {dailyCalories || "-"}
          </Text>
        </View>
      </Card>
    </View>
  );
}

// ─── Macros Panel ─────────────────────────────────────────────────────────────

function HydrationPanel({ analytics }: { analytics: any }) {
  const days = analytics?.days ?? [];
  const weeklyWater = days.reduce((total: number, day: any) => total + Number(day?.water?.totalMl ?? 0), 0);
  const dailyAverage = days.length ? Math.round(weeklyWater / days.length) : 0;
  const latestGoal = Number(days[days.length - 1]?.water?.goalMl ?? 2500);
  const weeklyGoal = latestGoal * Math.max(days.length, 1);
  const weeklyPct = Math.min(weeklyWater / Math.max(weeklyGoal, 1), 1);

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <View style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <View>
              <Text
                style={{
                  color: TEXT_SECONDARY,
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                  marginBottom: 4,
                  textTransform: "uppercase",
                }}
              >
                Weekly Hydration
              </Text>
              <Text
                style={{
                  color: TEXT_PRIMARY,
                  fontSize: 48,
                  fontWeight: "700",
                  lineHeight: 56,
                }}
              >
                {weeklyWater.toLocaleString()}
              </Text>
              <Text style={{ color: TEXT_SECONDARY, fontSize: 12 }}>
                Daily Avg: {dailyAverage.toLocaleString()} ml
              </Text>
            </View>

            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                backgroundColor: SCREEN_COLORS.iconBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="water-outline" size={30} color={ACCENT} />
            </View>
          </View>

          <View
            style={{
              backgroundColor: SCREEN_COLORS.cardSoft,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: BORDER,
              padding: 14,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: TEXT_PRIMARY, fontSize: 14, fontWeight: "700" }}>
                Goal Progress
              </Text>
              <Text style={{ color: ACCENT, fontSize: 13, fontWeight: "700" }}>
                {Math.round(weeklyPct * 100)}%
              </Text>
            </View>

            <View
              style={{
                height: 10,
                borderRadius: 999,
                backgroundColor: "#d8ecff",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${weeklyPct * 100}%`,
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: ACCENT,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <Text style={{ color: TEXT_SECONDARY, fontSize: 12 }}>
                {weeklyWater.toLocaleString()} ml
              </Text>
              <Text style={{ color: TEXT_SECONDARY, fontSize: 12 }}>
                Goal: {weeklyGoal.toLocaleString()} ml
              </Text>
            </View>
          </View>
        </View>
      </Card>

      <Card>
        <SectionTitle text="Daily Hydration" />
        <RowDivider />

        {days.map((day: any, index: number) => {
          const date = day?.date ? new Date(day.date) : new Date();
          const totalMl = Number(day?.water?.totalMl ?? 0);
          const goalMl = Number(day?.water?.goalMl ?? latestGoal);
          const progress = Math.min(totalMl / Math.max(goalMl, 1), 1);
          const label = date.toLocaleDateString(undefined, { weekday: "long" });

          return (
            <View key={`${day?.date ?? index}`}>
              <View style={{ paddingHorizontal: 16, paddingVertical: 14, gap: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        backgroundColor: SCREEN_COLORS.iconBg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: ACCENT, fontSize: 12, fontWeight: "800" }}>
                        {label.slice(0, 2)}
                      </Text>
                    </View>
                    <Text style={{ color: TEXT_PRIMARY, fontSize: 14, fontWeight: "600" }}>
                      {label}
                    </Text>
                  </View>

                  <Text style={{ color: TEXT_PRIMARY, fontSize: 15, fontWeight: "700" }}>
                    {totalMl.toLocaleString()} ml
                  </Text>
                </View>

                <View
                  style={{
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: "#d8ecff",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${progress * 100}%`,
                      height: "100%",
                      borderRadius: 999,
                      backgroundColor: ACCENT,
                    }}
                  />
                </View>
              </View>
              {index < days.length - 1 ? <RowDivider /> : null}
            </View>
          );
        })}
      </Card>
    </View>
  );
}

function TrendBars({
  days,
  getValue,
  color,
  unit,
}: {
  days: any[];
  getValue: (day: any) => number;
  color: string;
  unit: string;
}) {
  const values = days.map((day) => Math.max(0, getValue(day)));
  const maxValue = Math.max(...values, 1);

  return (
    <View style={{ height: 172, flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 }}>
      {days.map((day, index) => {
        const value = values[index] ?? 0;
        const barHeight = Math.max(8, (value / maxValue) * 150);
        const date = day?.date ? new Date(day.date) : new Date();

        return (
          <View key={`${day?.date ?? index}`} style={{ flex: 1, alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: "100%",
                height: barHeight,
                borderRadius: 8,
                backgroundColor: value > 0 ? color : "#d8ecff",
              }}
            />
            <Text style={{ color: TEXT_SECONDARY, fontSize: 10, textAlign: "center" }}>
              {date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
            </Text>
          </View>
        );
      })}
      <Text
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          color: TEXT_SECONDARY,
          fontSize: 11,
        }}
      >
        {Math.round(maxValue).toLocaleString()} {unit}
      </Text>
    </View>
  );
}

function MacrosPanel({ report }: { report: any }) {
  const totals = report?.totals ?? {};
  const targets = report?.macroTargets ?? {};
  const macroRows = [
    { label: "Carbohydrate", color: "#4DA8D8", total: `${Math.round(totals.carbs ?? 0)}g`, goal: `${Math.round(targets.carbs ?? 0) || "-"}g` },
    { label: "Fat", color: "#D3A017", total: `${Math.round(totals.fat ?? 0)}g`, goal: `${Math.round(targets.fat ?? 0) || "-"}g` },
    { label: "Protein", color: "#C9757E", total: `${Math.round(totals.protein ?? 0)}g`, goal: `${Math.round(targets.protein ?? 0) || "-"}g` },
  ];
  return (
    <View style={{ gap: 12 }}>
      {/* Macros chart card */}
      <Card>
        <View style={{ padding: 16 }}>
          <Text style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: "700", marginBottom: 14 }}>
            Macronutrients
          </Text>
          <ChartGrid />
          <DayLabels />
        </View>

        {/* Column header */}
        <RowDivider />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 4,
          }}
        >
          <Text style={{ width: 80, textAlign: "right", color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, marginRight: 16 }}>
            Total
          </Text>
          <Text style={{ width: 64, textAlign: "right", color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Goal
          </Text>
        </View>

        {/* Macro rows */}
        {macroRows.map((macro) => (
          <View key={macro.label}>
            <RowDivider />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: macro.color,
                  }}
                />
                <Text style={{ color: TEXT_PRIMARY, fontSize: 14 }}>
                  {macro.label}
                </Text>
              </View>
              <Text style={{ width: 80, textAlign: "right", color: TEXT_SECONDARY, fontSize: 14, marginRight: 16 }}>
                {macro.total}
              </Text>
              <Text style={{ width: 64, textAlign: "right", color: TEXT_PRIMARY, fontSize: 14, fontWeight: "600" }}>
                {macro.goal}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Foods Eaten card */}
      <Card>
        <SectionTitle text="Foods Eaten" />
        <RowDivider />

        {/* Table header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <Text style={{ flex: 1, color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Foods
          </Text>
          <Text style={{ width: 72, textAlign: "right", color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Carbs{"\n"}(g)
          </Text>
          <Text style={{ width: 64, textAlign: "right", color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Fat{"\n"}(g)
          </Text>
          <Text style={{ width: 64, textAlign: "right", color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Prot{"\n"}(g)
          </Text>
        </View>

        <RowDivider />

        {/* Total row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Text style={{ flex: 1, color: TEXT_PRIMARY, fontSize: 15, fontWeight: "700" }}>
            Total
          </Text>
          <Text style={{ width: 72, textAlign: "right", color: TEXT_PRIMARY, fontSize: 18, fontWeight: "700" }}>
            {Math.round(totals.carbs ?? 0) || "-"}
          </Text>
          <Text style={{ width: 64, textAlign: "right", color: TEXT_PRIMARY, fontSize: 18, fontWeight: "700" }}>
            {Math.round(totals.fat ?? 0) || "-"}
          </Text>
          <Text style={{ width: 64, textAlign: "right", color: TEXT_PRIMARY, fontSize: 18, fontWeight: "700" }}>
            {Math.round(totals.protein ?? 0) || "-"}
          </Text>
        </View>
      </Card>
    </View>
  );
}

// ─── Nutrients Panel ──────────────────────────────────────────────────────────

function NutrientsPanel({ report }: { report: any }) {
  const totals = report?.totals ?? {};
  const targets = report?.macroTargets ?? {};
  const calorieGoal = Math.round(report?.calorieTarget ?? 3000);
  const nutrientRows = [
    { label: "Calories (kcal)", total: Math.round(totals.calories ?? 0), goal: String(calorieGoal), delta: Math.round(report?.remainingCalories ?? 0) },
    { label: "Protein (g)", total: Math.round(totals.protein ?? 0), goal: Math.round(targets.protein ?? 0) || "-", delta: "-" },
    { label: "Carbohydrate (g)", total: Math.round(totals.carbs ?? 0), goal: Math.round(targets.carbs ?? 0) || "-", delta: "-" },
    { label: "Fiber (g)", total: Math.round(totals.fiber ?? 0), goal: "30", delta: "-" },
    { label: "Sugar (g)", total: Math.round(totals.sugar ?? 0), goal: "-", delta: "-" },
    { label: "Fat (g)", total: Math.round(totals.fat ?? 0), goal: Math.round(targets.fat ?? 0) || "-", delta: "-" },
    { label: "Cholesterol (mg)", total: Math.round(totals.cholesterol ?? 0), goal: "300", delta: "-" },
    { label: "Sodium (mg)", total: Math.round(totals.sodium ?? 0), goal: "2300", delta: "-" },
    { label: "Potassium (mg)", total: Math.round(totals.potassium ?? 0), goal: "3500", delta: "-" },
    { label: "Water (ml)", total: Math.round(report?.water?.totalMl ?? 0), goal: Math.round(report?.water?.goalMl ?? 0) || "-", delta: Math.round(report?.water?.remainingMl ?? 0) || "-" },
    { label: "Sleep (min)", total: Math.round(report?.sleep?.totalMinutes ?? 0), goal: Math.round(report?.sleep?.goalMinutes ?? 0) || "-", delta: "-" },
    { label: "Exercise (min)", total: Math.round(report?.exercise?.totalMinutes ?? 0), goal: Math.round(report?.exercise?.goalMinutes ?? 0) || "-", delta: Math.round(report?.exercise?.caloriesBurned ?? 0) || "-" },
  ];
  return (
    <Card>
      <SectionTitle text="Nutrients" />
      <RowDivider />

      {/* Table header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <Text style={{ flex: 1, color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
          Nutrient
        </Text>
        <Text style={{ width: 58, textAlign: "right", color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
          Total
        </Text>
        <Text style={{ width: 66, textAlign: "right", color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
          Goal
        </Text>
        {/* Delta header: [+/-] */}
        <View style={{ width: 58, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
          <Text style={{ color: TEXT_SECONDARY, fontSize: 11, fontWeight: "700" }}>[</Text>
          <Text style={{ color: "#EF4444", fontSize: 11, fontWeight: "700" }}>+</Text>
          <Text style={{ color: TEXT_SECONDARY, fontSize: 11, fontWeight: "700" }}>/</Text>
          <Text style={{ color: "#60A5FA", fontSize: 11, fontWeight: "700" }}>-</Text>
          <Text style={{ color: TEXT_SECONDARY, fontSize: 11, fontWeight: "700" }}>]</Text>
        </View>
      </View>

      {/* Nutrient rows */}
      {nutrientRows.map((nutrient, index) => (
        <View key={nutrient.label}>
          <RowDivider />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 13,
              backgroundColor: index % 2 === 0 ? "transparent" : SCREEN_COLORS.cardSoft,
            }}
          >
            <Text
              style={{
                flex: 1,
                color: TEXT_PRIMARY,
                fontSize: 13,
                lineHeight: 18,
                marginRight: 8,
              }}
            >
              {nutrient.label}
            </Text>
            <Text style={{ width: 58, textAlign: "right", color: TEXT_SECONDARY, fontSize: 13 }}>
              {nutrient.total}
            </Text>
            <Text style={{ width: 66, textAlign: "right", color: TEXT_SECONDARY, fontSize: 13 }}>
              {nutrient.goal}
            </Text>
            <Text style={{ width: 58, textAlign: "right", color: TEXT_SECONDARY, fontSize: 13 }}>
              {nutrient.delta}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<ReportTabKey>("nutrients");
  const [analytics, setAnalytics] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const pagerRef = useRef<ScrollView>(null);
  const { width: screenWidth } = useWindowDimensions();
  const pageWidth = Math.max(screenWidth - 24, 1);

  useEffect(() => {
    const activeTabIndex = REPORT_TABS.findIndex((tab) => tab.key === activeTab);
    pagerRef.current?.scrollTo({ x: activeTabIndex * pageWidth, animated: false });
  }, [activeTab, pageWidth]);

  useEffect(() => {
    let isActive = true;
    getDiaryAnalytics({ range: "week" })
      .then((data) => {
        if (isActive) {
          setAnalytics(data);
          setReport(data?.days?.[data.days.length - 1] ?? null);
        }
      })
      .catch(() => {
        if (isActive) {
          setAnalytics(null);
          setReport(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const onTabPress = (tabKey: ReportTabKey) => {
    const tabIndex = REPORT_TABS.findIndex((tab) => tab.key === tabKey);
    setActiveTab(tabKey);
    pagerRef.current?.scrollTo({ x: tabIndex * pageWidth, animated: true });
  };

  const onPagerScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const tabIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    const nextTab = REPORT_TABS[tabIndex];

    if (nextTab && nextTab.key !== activeTab) {
      setActiveTab(nextTab.key);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
      <ScreenBackground>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: 116,
          }}
        >
          <Header />
          <WeekPicker />

          {/* ── Tab bar ── */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: CARD,
              borderRadius: 12,
              padding: 4,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: BORDER,
            }}
          >
            {REPORT_TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.8}
                  onPress={() => onTabPress(tab.key)}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    paddingVertical: 10,
                    borderRadius: 9,
                    backgroundColor: isActive ? ACCENT : "transparent",
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? "#fff" : TEXT_SECONDARY,
                      fontSize: 12,
                      fontWeight: "700",
                      letterSpacing: 0.5,
                    }}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Pager ── */}
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onPagerScrollEnd}
            scrollEventThrottle={16}
          >
            <View style={{ width: pageWidth }}>
              <CaloriesPanel analytics={analytics} report={report} />
            </View>
            <View style={{ width: pageWidth }}>
              <HydrationPanel analytics={analytics} />
            </View>
            <View style={{ width: pageWidth }}>
              <MacrosPanel report={report} />
            </View>
            <View style={{ width: pageWidth }}>
              <NutrientsPanel report={report} />
            </View>
          </ScrollView>
        </ScrollView>

        <AppBottomNav />
      </ScreenBackground>
    </SafeAreaView>
  );
}
