import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

import { SCREEN_COLORS } from "./ScreenBackground";
import { getUnreadNotificationCount } from "../src/services/notificationCenter";

interface HeaderProps {
  notificationCount?: number;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  onCalendarPress?: () => void;
}

export function Header({
  notificationCount,
  onAvatarPress,
  onNotificationPress,
  onSearchPress,
  onCalendarPress,
}: HeaderProps) {
  const router = useRouter();
  const [loadedNotificationCount, setLoadedNotificationCount] = useState(0);
  const resolvedNotificationCount = notificationCount ?? loadedNotificationCount;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (notificationCount !== undefined) {
        return () => {
          isActive = false;
        };
      }

      getUnreadNotificationCount()
        .then((count) => {
          if (isActive) setLoadedNotificationCount(count);
        })
        .catch(() => {
          if (isActive) setLoadedNotificationCount(0);
        });

      return () => {
        isActive = false;
      };
    }, [notificationCount])
  );

  const handleAvatarPress = () => {
    onAvatarPress?.();
    router.push("/profile");
  };

  const handleCalendarPress = () => {
    if (onCalendarPress) {
      onCalendarPress();
      return;
    }

    router.push("/calendar");
  };

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
      return;
    }

    router.push("/search");
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
      return;
    }

    router.push("/notifications");
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      {/* Avatar */}
      <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.7}>
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
          <Text style={{ fontSize: 22 }}>🧑</Text>
        </View>
      </TouchableOpacity>

      {/* Right Action Icons */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        {/* Bell with badge */}
        <TouchableOpacity onPress={handleNotificationPress} activeOpacity={0.7}>
          <View>
          <Ionicons name="notifications-outline" size={26} color={SCREEN_COLORS.primaryDark} />
            {resolvedNotificationCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -5,
                  minWidth: 17,
                  height: 17,
                  borderRadius: 8.5,
                  backgroundColor: "#F97316",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 2,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}
                >
                  {resolvedNotificationCount > 99 ? "99+" : resolvedNotificationCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSearchPress} activeOpacity={0.7}>
          <Ionicons name="search-outline" size={26} color={SCREEN_COLORS.primaryDark} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCalendarPress} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={26} color={SCREEN_COLORS.primaryDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
