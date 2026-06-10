import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMyAppointments, listMyStoreOrders, listReminders } from "./backendApi";

const READ_KEY = "nutrimed.notifications.read";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  category: "reminder" | "appointment" | "order";
  createdAt?: string;
  href?: string;
  unread: boolean;
};

const getReadIds = async () => {
  const raw = await AsyncStorage.getItem(READ_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
};

const saveReadIds = async (ids: Set<string>) => {
  await AsyncStorage.setItem(READ_KEY, JSON.stringify(Array.from(ids)));
};

const getReminderId = (reminder: any) => String(reminder?._id ?? reminder?.id ?? "");

export async function loadNotificationItems(): Promise<NotificationItem[]> {
  const readIds = await getReadIds();
  const [reminders, appointmentPayload, orders] = await Promise.all([
    listReminders().catch(() => []),
    getMyAppointments({ status: "upcoming", limit: 20 }).catch(() => ({ appointments: [] })),
    listMyStoreOrders().catch(() => []),
  ]);

  const reminderItems = (Array.isArray(reminders) ? reminders : [])
    .filter((reminder) => reminder?.isActive !== false)
    .map((reminder) => {
      const id = `reminder:${getReminderId(reminder)}`;
      return {
        id,
        title: `${String(reminder.type || "Reminder")} reminder`,
        body: `${reminder.message || "Smart reminder"} at ${reminder.time || "--:--"}`,
        category: "reminder" as const,
        createdAt: reminder.updatedAt || reminder.createdAt,
        href: "/reminders",
        unread: !readIds.has(id),
      };
    });

  const appointmentItems = (Array.isArray(appointmentPayload?.appointments) ? appointmentPayload.appointments : [])
    .map((appointment: any) => {
      const id = `appointment:${appointment._id}:${appointment.status}`;
      return {
        id,
        title: `Appointment ${appointment.status || "updated"}`,
        body: `${appointment.doctor?.name || "Doctor"} · ${appointment.date || ""} ${appointment.slotTime || ""}`,
        category: "appointment" as const,
        createdAt: appointment.updatedAt || appointment.createdAt,
        href: "/my-appointments",
        unread: !readIds.has(id),
      };
    });

  const orderItems = (Array.isArray(orders) ? orders : [])
    .filter((order: any) => ["pending_payment", "paid", "processing", "shipped"].includes(order?.status))
    .slice(0, 20)
    .map((order: any) => {
      const id = `order:${order._id}:${order.status}`;
      return {
        id,
        title: `Order ${order.status || "updated"}`,
        body: `${order.orderNumber || "Order"} · Rs ${Number(order.total || 0).toLocaleString("en-IN")}`,
        category: "order" as const,
        createdAt: order.updatedAt || order.createdAt,
        href: "/store",
        unread: !readIds.has(id),
      };
    });

  return [...appointmentItems, ...orderItems, ...reminderItems].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

export async function getUnreadNotificationCount() {
  const items = await loadNotificationItems();
  return items.filter((item) => item.unread).length;
}

export async function markNotificationsRead(ids: string[]) {
  const readIds = await getReadIds();
  ids.forEach((id) => readIds.add(id));
  await saveReadIds(readIds);
}
