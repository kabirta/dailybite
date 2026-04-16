import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { signOutUser } from "../services/authService";

function getDisplayName(user) {
  return user?.displayName || user?.email || "Firebase User";
}

export default function HomeScreen({ user }) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOutUser();
    } catch (error) {
      Alert.alert(
        "Sign Out Failed",
        error?.message || "Unable to sign out right now."
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>Home Screen</Text>
        <Text style={styles.title}>Hi, {getDisplayName(user)}</Text>
        <Text style={styles.subtitle}>
          You are authenticated with Firebase and the app will keep listening to
          auth changes in the background.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Email</Text>
          <Text style={styles.cardValue}>{user?.email || "Not available"}</Text>
          <Text style={styles.cardLabel}>UID</Text>
          <Text style={styles.cardValue}>{user?.uid || "Not available"}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isSigningOut}
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            (isSigningOut || pressed) && styles.signOutButtonPressed,
          ]}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#F8FAFC" />
          ) : (
            <Text style={styles.signOutButtonText}>Sign out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F8FAFC",
  },
  kicker: {
    marginBottom: 12,
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#0F172A",
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 14,
    color: "#475569",
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    marginTop: 28,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    padding: 20,
    gap: 8,
  },
  cardLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  cardValue: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
  },
  signOutButton: {
    marginTop: 28,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#0F172A",
  },
  signOutButtonPressed: {
    opacity: 0.8,
  },
  signOutButtonText: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
  },
});
