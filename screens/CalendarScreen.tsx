import { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
}

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

function buildCalendarGrid(monthDate: Date): CalendarCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const firstVisibleDay = new Date(year, month, 1 - startOffset);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(firstVisibleDay);
    date.setDate(firstVisibleDay.getDate() + i);

    cells.push({
      date,
      isCurrentMonth: date.getMonth() === month,
    });
  }

  return cells;
}

function isSameDate(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export default function CalendarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();

  const initialDate = useMemo(() => parseIsoDate(params.date) ?? new Date(), [params.date]);

  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const today = new Date();
  const calendarCells = useMemo(() => buildCalendarGrid(visibleMonth), [visibleMonth]);

  const monthLabel = useMemo(
    () =>
      visibleMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [visibleMonth]
  );

  const selectedLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [selectedDate]
  );

  const selectedIso = formatIsoDate(selectedDate);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }} edges={["top"]}>
      <ScreenBackground>
      <Header />
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}>
        {false ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/diary");
              }
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: SCREEN_COLORS.iconBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={20} color={SCREEN_COLORS.primaryDark} />
          </TouchableOpacity>

          <Text style={{ color: SCREEN_COLORS.text, fontSize: 22, fontWeight: "700" }}>Calendar</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              const nextDate = new Date();
              setSelectedDate(nextDate);
              setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
            }}
            style={{
              minWidth: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: SCREEN_COLORS.iconBg,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ color: SCREEN_COLORS.primaryDark, fontSize: 12, fontWeight: "700" }}>Today</Text>
          </TouchableOpacity>
        </View>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: SCREEN_COLORS.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: SCREEN_COLORS.border,
            paddingHorizontal: 8,
            paddingVertical: 8,
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setVisibleMonth(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
              )
            }
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={18} color={SCREEN_COLORS.textMuted} />
          </TouchableOpacity>

          <Text style={{ color: SCREEN_COLORS.text, fontSize: 18, fontWeight: "600" }}>{monthLabel}</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setVisibleMonth(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
              )
            }
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-forward" size={18} color={SCREEN_COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          {WEEKDAY_LABELS.map((label) => (
            <Text
              key={label}
              style={{
                width: "14.2857%",
                textAlign: "center",
                color: SCREEN_COLORS.textMuted,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {label}
            </Text>
          ))}
        </View>

        <View
          style={{
            backgroundColor: SCREEN_COLORS.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: SCREEN_COLORS.border,
            paddingHorizontal: 4,
            paddingTop: 10,
            paddingBottom: 4,
          }}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {calendarCells.map((cell) => {
              const isSelected = isSameDate(cell.date, selectedDate);
              const isToday = isSameDate(cell.date, today);

              return (
                <TouchableOpacity
                  key={formatIsoDate(cell.date)}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDate(cell.date)}
                  style={{ width: "14.2857%", paddingHorizontal: 2, marginBottom: 8 }}
                >
                  <View
                    style={{
                      height: 42,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected ? SCREEN_COLORS.primary : "transparent",
                      borderWidth: isToday && !isSelected ? 1 : 0,
                      borderColor: SCREEN_COLORS.primary,
                      opacity: cell.isCurrentMonth ? 1 : 0.4,
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? "#ffffff" : SCREEN_COLORS.text,
                        fontSize: 15,
                        fontWeight: isSelected ? "700" : "500",
                      }}
                    >
                      {cell.date.getDate()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ marginTop: "auto", paddingTop: 18 }}>
          <Text
            style={{
              color: SCREEN_COLORS.textMuted,
              fontSize: 13,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Selected: {selectedLabel}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.replace(`/diary?date=${selectedIso}`)}
            style={{
              backgroundColor: SCREEN_COLORS.primary,
              borderRadius: 14,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Ionicons name="calendar" size={18} color="#ffffff" />
            <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: "700" }}>
              Open Diary For Selected Date
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScreenBackground>
    </SafeAreaView>
  );
}
