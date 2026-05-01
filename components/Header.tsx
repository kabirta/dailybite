import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { SCREEN_COLORS } from "./ScreenBackground";

interface HeaderProps {
  notificationCount?: number;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  onCalendarPress?: () => void;
}

export function Header({
  notificationCount = 0,
  onAvatarPress,
  onNotificationPress,
  onSearchPress,
  onCalendarPress,
}: HeaderProps) {
  const router = useRouter();

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
        <TouchableOpacity onPress={onNotificationPress} activeOpacity={0.7}>
          <View>
          <Ionicons name="notifications-outline" size={26} color={SCREEN_COLORS.primaryDark} />
            {notificationCount > 0 && (
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
                  {notificationCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSearchPress} activeOpacity={0.7}>
          <Ionicons name="search-outline" size={26} color={SCREEN_COLORS.primaryDark} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCalendarPress} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={26} color={SCREEN_COLORS.primaryDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
