import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppBottomNav } from "../components/AppBottomNav";
import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";
import {
  createReminder,
  deleteReminder,
  getPremiumStatus,
  listReminders,
  toggleReminder,
} from "../src/services/backendApi";
import {
  syncSmartReminderNotifications,
  type SmartReminder,
} from "../src/services/smartReminderService";

type ReminderType = "water" | "breakfast" | "lunch" | "dinner" | "exercise" | "sleep";

const REMINDER_TYPES: Array<{ label: string; value: ReminderType; icon: React.ComponentProps<typeof Ionicons>["name"] }> = [
  { label: "Water", value: "water", icon: "water" },
  { label: "Breakfast", value: "breakfast", icon: "partly-sunny-outline" },
  { label: "Lunch", value: "lunch", icon: "sunny-outline" },
  { label: "Dinner", value: "dinner", icon: "moon-outline" },
  { label: "Exercise", value: "exercise", icon: "walk-outline" },
  { label: "Sleep", value: "sleep", icon: "bed-outline" },
];

const WEEKDAYS = [
  { label: "S", value: 0 },
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
  { label: "S", value: 6 },
];

const DEFAULT_MESSAGES: Record<ReminderType, string> = {
  water: "Time to drink water and stay hydrated.",
  breakfast: "Log breakfast before the day gets busy.",
  lunch: "Lunch check-in: add what you ate.",
  dinner: "Dinner reminder: keep your diary complete.",
  exercise: "A short walk can help close your activity goal.",
  sleep: "Start winding down for better sleep.",
};

function isPremiumActive(status: any) {
  return Boolean(status?.isPremium);
}

function getReminderId(reminder: SmartReminder) {
  return String(reminder._id ?? reminder.id ?? "");
}

export default function SmartRemindersScreen() {
  const router = useRouter();
  const [premiumStatus, setPremiumStatus] = useState<any>(null);
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [type, setType] = useState<ReminderType>("water");
  const [time, setTime] = useState("09:00");
  const [message, setMessage] = useState(DEFAULT_MESSAGES.water);
  const [days, setDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const hasPremium = isPremiumActive(premiumStatus);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await getPremiumStatus();
      setPremiumStatus(status);

      if (!isPremiumActive(status)) {
        setReminders([]);
        await syncSmartReminderNotifications([], false);
        return;
      }

      const data = await listReminders();
      const nextReminders = Array.isArray(data) ? data : [];
      setReminders(nextReminders);
      await syncSmartReminderNotifications(nextReminders, true);
    } catch (error) {
      Alert.alert("Smart reminders", error instanceof Error ? error.message : "Could not load reminders.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedTypeMeta = useMemo(
    () => REMINDER_TYPES.find((item) => item.value === type) ?? REMINDER_TYPES[0],
    [type]
  );

  const selectType = (nextType: ReminderType) => {
    setType(nextType);
    setMessage(DEFAULT_MESSAGES[nextType]);
  };

  const toggleDay = (day: number) => {
    setDays((current) => {
      if (current.includes(day)) {
        const next = current.filter((item) => item !== day);
        return next.length ? next : current;
      }

      return [...current, day].sort((a, b) => a - b);
    });
  };

  const saveReminder = async () => {
    if (!hasPremium || isSaving) return;
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      Alert.alert("Reminder time", "Use 24-hour HH:mm format, for example 09:00.");
      return;
    }

    setIsSaving(true);
    try {
      await createReminder({
        type,
        message: message.trim() || DEFAULT_MESSAGES[type],
        time,
        days,
        isActive: true,
        quietHours: { enabled: true, start: "22:00", end: "07:00" },
      });
      await load();
    } catch (error) {
      Alert.alert("Could not save reminder", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const setReminderStatus = async (reminder: SmartReminder, isActive: boolean) => {
    const reminderId = getReminderId(reminder);
    if (!reminderId) return;

    const previous = reminders;
    const next = reminders.map((item) =>
      getReminderId(item) === reminderId ? { ...item, isActive } : item
    );
    setReminders(next);
    await syncSmartReminderNotifications(next, hasPremium);

    try {
      await toggleReminder(reminderId, isActive);
    } catch (error) {
      setReminders(previous);
      await syncSmartReminderNotifications(previous, hasPremium);
      Alert.alert("Could not update reminder", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const removeReminder = async (reminder: SmartReminder) => {
    const reminderId = getReminderId(reminder);
    if (!reminderId) return;

    try {
      await deleteReminder(reminderId);
      const next = reminders.filter((item) => getReminderId(item) !== reminderId);
      setReminders(next);
      await syncSmartReminderNotifications(next, hasPremium);
    } catch (error) {
      Alert.alert("Could not delete reminder", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }} edges={["top"]}>
      <ScreenBackground>
        <Header />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <View style={{ gap: 6, marginBottom: 16 }}>
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 28, fontWeight: "800" }}>Smart Reminders</Text>
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 14, lineHeight: 20 }}>
              Premium reminders sync with your backend account and schedule device notifications.
            </Text>
          </View>

          {isLoading ? (
            <ActivityIndicator color={SCREEN_COLORS.primary} />
          ) : !hasPremium ? (
            <View
              style={{
                backgroundColor: SCREEN_COLORS.card,
                borderColor: SCREEN_COLORS.border,
                borderWidth: 1,
                borderRadius: 16,
                padding: 18,
                gap: 12,
              }}
            >
              <Ionicons name="lock-closed-outline" size={28} color={SCREEN_COLORS.primary} />
              <Text style={{ color: SCREEN_COLORS.text, fontSize: 18, fontWeight: "800" }}>
                Premium plan required
              </Text>
              <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 13, lineHeight: 19 }}>
                Smart reminders are stored and scheduled only after payment activates your premium plan.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/premium-plan")}
                activeOpacity={0.82}
                style={{
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: SCREEN_COLORS.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>Buy Premium</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View
                style={{
                  backgroundColor: SCREEN_COLORS.card,
                  borderColor: SCREEN_COLORS.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 14,
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <Text style={{ color: SCREEN_COLORS.text, fontWeight: "800", fontSize: 16 }}>Create reminder</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {REMINDER_TYPES.map((item) => {
                    const selected = item.value === type;
                    return (
                      <TouchableOpacity
                        key={item.value}
                        onPress={() => selectType(item.value)}
                        activeOpacity={0.78}
                        style={{
                          minHeight: 40,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          borderWidth: 1,
                          borderColor: selected ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                          backgroundColor: selected ? SCREEN_COLORS.iconBg : "#fff",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Ionicons name={item.icon} size={16} color={SCREEN_COLORS.primary} />
                        <Text style={{ color: SCREEN_COLORS.text, fontWeight: "700", fontSize: 13 }}>{item.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TextInput
                    value={time}
                    onChangeText={setTime}
                    placeholder="09:00"
                    keyboardType="numbers-and-punctuation"
                    style={{
                      width: 86,
                      minHeight: 44,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: SCREEN_COLORS.border,
                      paddingHorizontal: 12,
                      color: SCREEN_COLORS.text,
                      backgroundColor: "#fff",
                    }}
                  />
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder={DEFAULT_MESSAGES[type]}
                    style={{
                      flex: 1,
                      minHeight: 44,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: SCREEN_COLORS.border,
                      paddingHorizontal: 12,
                      color: SCREEN_COLORS.text,
                      backgroundColor: "#fff",
                    }}
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  {WEEKDAYS.map((day) => {
                    const selected = days.includes(day.value);
                    return (
                      <TouchableOpacity
                        key={day.value}
                        onPress={() => toggleDay(day.value)}
                        activeOpacity={0.78}
                        style={{
                          flex: 1,
                          aspectRatio: 1,
                          borderRadius: 12,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: selected ? SCREEN_COLORS.primary : SCREEN_COLORS.cardSoft,
                        }}
                      >
                        <Text style={{ color: selected ? "#fff" : SCREEN_COLORS.text, fontWeight: "800" }}>
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={() => void saveReminder()}
                  disabled={isSaving}
                  activeOpacity={0.82}
                  style={{
                    minHeight: 48,
                    borderRadius: 14,
                    backgroundColor: SCREEN_COLORS.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isSaving ? 0.65 : 1,
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  {isSaving ? <ActivityIndicator color="#fff" /> : <Ionicons name={selectedTypeMeta.icon} size={18} color="#fff" />}
                  <Text style={{ color: "#fff", fontWeight: "800" }}>Save Smart Reminder</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 10 }}>
                {reminders.length === 0 ? (
                  <Text style={{ color: SCREEN_COLORS.textMuted, textAlign: "center", paddingVertical: 20 }}>
                    No reminders yet.
                  </Text>
                ) : (
                  reminders.map((reminder) => (
                    <View
                      key={getReminderId(reminder)}
                      style={{
                        backgroundColor: SCREEN_COLORS.card,
                        borderColor: SCREEN_COLORS.border,
                        borderWidth: 1,
                        borderRadius: 16,
                        padding: 14,
                        gap: 8,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Ionicons name="notifications-outline" size={20} color={SCREEN_COLORS.primary} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: SCREEN_COLORS.text, fontWeight: "800" }}>
                            {reminder.type} at {reminder.time}
                          </Text>
                          <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 2, fontSize: 12 }}>
                            {reminder.message}
                          </Text>
                        </View>
                        <Switch
                          value={reminder.isActive !== false}
                          onValueChange={(value) => void setReminderStatus(reminder, value)}
                        />
                      </View>
                      <TouchableOpacity onPress={() => void removeReminder(reminder)} activeOpacity={0.75}>
                        <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 13 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>

        <AppBottomNav />
      </ScreenBackground>
    </SafeAreaView>
  );
}
