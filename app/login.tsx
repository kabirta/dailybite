import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";
import { hasCompletedOnboarding, loginWithFirebaseUser } from "../src/services/backendApi";
import { signInWithGoogle } from "../src/services/authService";

function getGoogleSignInErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "auth/account-exists-with-different-credential"
  ) {
    return "This email is already linked to another sign-in method.";
  }

  if (error instanceof Error) {
    if (
      error.message.includes("RNGoogleSignin") ||
      error.message.includes("TurboModuleRegistry")
    ) {
      return "Native Google Sign-In is not available in this build. Rebuild the app, or use the browser sign-in fallback.";
    }

    return error.message;
  }

  return "Something went wrong while signing in with Google.";
}

function isOnboardingRequiredError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("onboarding required") || message.includes("sign up questions");
}

export default function LoginScreen() {
  const router = useRouter();
  const { provider } = useLocalSearchParams<{ provider?: string }>();
  const isGoogleSignIn = provider === "google";
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) {
      return;
    }

    try {
      setIsSigningIn(true);
      const result = await signInWithGoogle();

      if (!result) {
        return;
      }

      const session = await loginWithFirebaseUser(result.user);
      router.replace(hasCompletedOnboarding(session) ? "/diary" : "/onboarding");
    } catch (error) {
      if (isOnboardingRequiredError(error)) {
        Alert.alert(
          "Sign up required",
          "New users must complete the sign up questions before entering the app.",
          [{ text: "Start sign up", onPress: () => router.replace("/onboarding") }]
        );
        return;
      }

      Alert.alert("Google Sign-In Failed", getGoogleSignInErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }}>
      <ScreenBackground>
      <View className="flex-1 items-center justify-center px-7">
        <Text className="text-center text-[48px] font-extrabold leading-[58px] text-[#072d66]">
          {isGoogleSignIn ? "Google Sign-In" : "Welcome back"}
        </Text>
        <Text className="mt-4 text-center text-[26px] leading-9 text-[#5f7492]">
          {isGoogleSignIn
            ? "Continue with Google to finish signing in."
            : "Sign in to sync your diary, reports, and goals."}
        </Text>

        <Pressable
          className="mt-10 h-16 w-full flex-row items-center justify-center rounded-2xl bg-[#127dff] active:opacity-90"
          disabled={isSigningIn}
          onPress={handleGoogleSignIn}
        >
          {isSigningIn ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-[22px] font-bold text-white">Sign in with Google</Text>
          )}
        </Pressable>

        <Pressable
          className="mt-5 h-14 w-full items-center justify-center rounded-2xl"
          disabled={isSigningIn}
          onPress={() => router.replace("/")}
        >
          <Text className="text-[20px] font-bold text-[#127dff]">Back to Welcome</Text>
        </Pressable>
      </View>
      </ScreenBackground>
    </SafeAreaView>
  );
}
