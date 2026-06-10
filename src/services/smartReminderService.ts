import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const NOTIFICATION_PREFIX = "nutrimed.smartReminder.";
const CHANNEL_ID = "smart-reminders";

export type SmartReminder = {
  _id?: string;
  id?: string;
  type: string;
  message: string;
  time: string;
  days: number[];
  isActive?: boolean;
};

function getReminderId(reminder: SmartReminder) {
  return String(reminder._id ?? reminder.id ?? "");
}

async function ensureNotificationAccess() {
  if (Platform.OS === "web") {
    return false;
  }

  const current = await Notifications.getPermissionsAsync();
  const permission =
    current.status === "granted" ? current : await Notifications.requestPermissionsAsync();

  if (permission.status !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Smart reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return true;
}

export async function cancelSmartReminderNotifications(reminderId?: string) {
  if (Platform.OS === "web") return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const prefix = reminderId ? `${NOTIFICATION_PREFIX}${reminderId}.` : NOTIFICATION_PREFIX;

  await Promise.all(
    scheduled
      .filter((notification) => String(notification.identifier).startsWith(prefix))
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier))
  );
}

export async function syncSmartReminderNotifications(reminders: SmartReminder[], isPremium: boolean) {
  await cancelSmartReminderNotifications();

  if (!isPremium) {
    return;
  }

  const canSchedule = await ensureNotificationAccess();
  if (!canSchedule) {
    return;
  }

  for (const reminder of reminders) {
    if (reminder.isActive === false) continue;

    const reminderId = getReminderId(reminder);
    const [hourText, minuteText] = reminder.time.split(":");
    const hour = Number(hourText);
    const minute = Number(minuteText);
    if (!reminderId || !Number.isInteger(hour) || !Number.isInteger(minute)) continue;

    for (const day of reminder.days) {
      if (!Number.isInteger(day) || day < 0 || day > 6) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: `${NOTIFICATION_PREFIX}${reminderId}.${day}`,
        content: {
          title: "NutriMed Smart Reminder",
          body: reminder.message,
          data: { reminderId, type: reminder.type },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday: day === 0 ? 1 : day + 1,
          hour,
          minute,
          repeats: true,
          channelId: CHANNEL_ID,
        },
      });
    }
  }
}
