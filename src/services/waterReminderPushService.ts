import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { registerFcmPushToken } from "./backendApi";

const WATER_CHANNEL_ID = "water-reminders";
const WATER_REMINDER_ID = "nutrimed.water.hourly";

async function ensureNotificationPermission() {
  if (Platform.OS === "web") return false;

  const current = await Notifications.getPermissionsAsync();
  const permission =
    current.status === "granted" ? current : await Notifications.requestPermissionsAsync();

  if (permission.status !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(WATER_CHANNEL_ID, {
      name: "Water reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    });
  }

  return true;
}

export async function registerFcmTokenForWaterReminders() {
  if (Platform.OS === "web") return;

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) return;

  const deviceToken = await Notifications.getDevicePushTokenAsync();
  const token = String(deviceToken?.data || "");
  if (!token) return;

  await registerFcmPushToken({
    token,
    platform: Platform.OS,
  });
}

export async function scheduleHourlyWaterReminder() {
  if (Platform.OS === "web") return;

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) return;

  await Notifications.cancelScheduledNotificationAsync(WATER_REMINDER_ID).catch(() => undefined);
  await Notifications.scheduleNotificationAsync({
    identifier: WATER_REMINDER_ID,
    content: {
      title: "Water reminder",
      body: "Time to drink water and stay hydrated.",
      data: { type: "water", source: "hourly-water-reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60,
      repeats: true,
      channelId: WATER_CHANNEL_ID,
    },
  });
}

export async function setupHourlyWaterReminderPush() {
  await Promise.all([
    registerFcmTokenForWaterReminders().catch((error) => {
      console.warn("[WaterReminder] Could not register FCM token", error);
    }),
    scheduleHourlyWaterReminder().catch((error) => {
      console.warn("[WaterReminder] Could not schedule hourly reminder", error);
    }),
  ]);
}
