import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { type Auth, onAuthStateChanged, type User } from "firebase/auth";

import { SCREEN_COLORS } from "./ScreenBackground";
import { auth as rawAuth } from "../src/config/firebase";
import { useLanguage } from "../src/i18n/LanguageContext";
import { getUnreadNotificationCount } from "../src/services/notificationCenter";

const auth = rawAuth as Auth;

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
  const { language, toggleLanguage } = useLanguage();
  const [loadedNotificationCount, setLoadedNotificationCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const resolvedNotificationCount = notificationCount ?? loadedNotificationCount;
  const avatarUri = currentUser?.photoURL ?? null;
  const avatarInitials = useMemo(() => {
    const source = currentUser?.displayName?.trim() || currentUser?.email?.split("@")[0] || "U";
    return (
      source
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "U"
    );
  }, [currentUser]);

  useEffect(() => onAuthStateChanged(auth, setCurrentUser), []);

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
            overflow: "hidden",
            borderWidth: 1,
            borderColor: SCREEN_COLORS.border,
          }}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={{ width: 42, height: 42 }} />
          ) : (
            <Text style={{ color: SCREEN_COLORS.primaryDark, fontSize: 15, fontWeight: "800" }}>
              {avatarInitials}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Right Action Icons */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <TouchableOpacity
          onPress={() => void toggleLanguage()}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={language === "en" ? "Switch to Bangla" : "Switch to English"}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(18,125,255,0.1)",
              borderWidth: 1,
              borderColor: "rgba(18,125,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 2,
            }}
          >
            <Ionicons name="language-outline" size={18} color={SCREEN_COLORS.primaryDark} />
            <Text style={{ color: SCREEN_COLORS.primaryDark, fontSize: 9, fontWeight: "900" }}>
              {language === "en" ? "EN" : "BN"}
            </Text>
          </View>
        </TouchableOpacity>

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
