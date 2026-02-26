import "../styles/global.css";

import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  useEffect(() => {
    const requestNotificationsPermission = async () => {
      if (Platform.OS === "web") {
        return;
      }

      try {
        const { status } = await Notifications.getPermissionsAsync();

        if (status !== "granted") {
          await Notifications.requestPermissionsAsync();
        }

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }
      } catch (error) {
        console.warn("Could not request notification permission:", error);
      }
    };

    void requestNotificationsPermission();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
  );
}
