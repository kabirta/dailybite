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

import { signInWithGoogle } from "../services/authService";

function getErrorMessage(error) {
  if (error?.code === "auth/account-exists-with-different-credential") {
    return "This email is already linked to another sign-in method.";
  }

  if (
    error?.message?.includes("RNGoogleSignin") ||
    error?.message?.includes("TurboModuleRegistry")
  ) {
    return "Native Google Sign-In is not available in this build yet. Rebuild the Android app and open the rebuilt app instead of Expo Go.";
  }

  return error?.message || "Something went wrong while signing in.";
}

export default function LoginScreen({ loading }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      const result = await signInWithGoogle();

      if (!result) {
        return;
      }
    } catch (error) {
      Alert.alert("Google Sign-In Failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = loading || isSubmitting;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>Firebase Authentication</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Continue with Google and Firebase will keep the session persisted for
          the next app launch.
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={handleGoogleSignIn}
          style={({ pressed }) => [
            styles.googleButton,
            (isBusy || pressed) && styles.googleButtonPressed,
          ]}
        >
          {isBusy ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          )}
        </Pressable>

        <Text style={styles.caption}>
          Auth state is synced with Firebase using `onAuthStateChanged`.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#020617",
  },
  kicker: {
    marginBottom: 12,
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 34,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 14,
    color: "#CBD5E1",
    fontSize: 16,
    lineHeight: 24,
  },
  googleButton: {
    marginTop: 28,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#FACC15",
    paddingHorizontal: 20,
  },
  googleButtonPressed: {
    opacity: 0.75,
  },
  googleButtonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },
  caption: {
    marginTop: 16,
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
  },
});
