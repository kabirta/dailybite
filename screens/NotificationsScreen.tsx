import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";
import {
  loadNotificationItems,
  markNotificationsRead,
  type NotificationItem,
} from "../src/services/notificationCenter";

const CATEGORY_META: Record<
  NotificationItem["category"],
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  reminder: { icon: "notifications-outline", color: "#2563EB", label: "Reminder" },
  appointment: { icon: "medical-outline", color: "#16A34A", label: "Doctor" },
  order: { icon: "bag-handle-outline", color: "#EA580C", label: "Order" },
};

const formatTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = items.filter((item) => item.unread).length;

  const load = useCallback(async ({ refreshing = false } = {}) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setItems(await loadNotificationItems());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markAllRead = async () => {
    await markNotificationsRead(items.map((item) => item.id));
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
  };

  const openItem = async (item: NotificationItem) => {
    await markNotificationsRead([item.id]);
    setItems((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id ? { ...currentItem, unread: false } : currentItem
      )
    );

    if (item.href) {
      router.push(item.href as never);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }} edges={["top"]}>
      <ScreenBackground>
        <Header notificationCount={unreadCount} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void load({ refreshing: true })} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: SCREEN_COLORS.text, fontSize: 28, fontWeight: "900" }}>Notifications</Text>
              <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 6 }}>
                Reminders, appointments, and store order updates.
              </Text>
            </View>

            <TouchableOpacity
              disabled={!unreadCount}
              onPress={() => void markAllRead()}
              style={{
                minHeight: 38,
                borderRadius: 8,
                paddingHorizontal: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: unreadCount ? SCREEN_COLORS.primary : SCREEN_COLORS.cardSoft,
              }}
            >
              <Text style={{ color: unreadCount ? "#fff" : SCREEN_COLORS.textMuted, fontWeight: "900", fontSize: 12 }}>
                Mark read
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={{ paddingVertical: 80, alignItems: "center" }}>
              <ActivityIndicator color={SCREEN_COLORS.primary} />
            </View>
          ) : items.length ? (
            <View style={{ gap: 10 }}>
              {items.map((item) => {
                const meta = CATEGORY_META[item.category];
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.84}
                    onPress={() => void openItem(item)}
                    style={{
                      backgroundColor: SCREEN_COLORS.card,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: item.unread ? meta.color : SCREEN_COLORS.border,
                      padding: 14,
                      flexDirection: "row",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        backgroundColor: SCREEN_COLORS.cardSoft,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name={meta.icon} size={21} color={meta.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={{ color: meta.color, fontSize: 11, fontWeight: "900", textTransform: "uppercase" }}>
                          {meta.label}
                        </Text>
                        {item.unread ? (
                          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#F97316" }} />
                        ) : null}
                      </View>
                      <Text style={{ color: SCREEN_COLORS.text, fontSize: 15, fontWeight: "900", marginTop: 4 }}>
                        {item.title}
                      </Text>
                      <Text style={{ color: SCREEN_COLORS.textMuted, lineHeight: 19, marginTop: 4 }}>
                        {item.body}
                      </Text>
                      {item.createdAt ? (
                        <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginTop: 7 }}>
                          {formatTime(item.createdAt)}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: SCREEN_COLORS.border, padding: 24, alignItems: "center" }}>
              <Ionicons name="notifications-off-outline" size={34} color={SCREEN_COLORS.primary} />
              <Text style={{ color: SCREEN_COLORS.text, fontWeight: "900", marginTop: 12 }}>No notifications</Text>
              <Text style={{ color: SCREEN_COLORS.textMuted, textAlign: "center", marginTop: 6 }}>
                Your reminders, appointments, and order updates will appear here.
              </Text>
            </View>
          )}
        </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}
