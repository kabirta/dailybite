import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Animated, Easing, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { signInWithGoogle } from "../src/services/authService";
import AppLogo from "./AppLogo";
import PrivacyPolicyScreen from "./PrivacyPolicyScreen";
import SignInSheet from "./SignInSheet";
import WelcomeActions from "./WelcomeActions";

function getGoogleSignInErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof error.message === "string" &&
    (error.message.includes("DEVELOPER_ERROR") ||
      error.message.includes("code 10") ||
      error.message.includes("Developer console is not set up correctly"))
  ) {
    return "Google Sign-In is blocked by an Android OAuth configuration mismatch. Add this build's SHA-1 fingerprint to the Firebase Android app for com.nutrimed.ai, enable Google in Firebase Authentication, then download and replace google-services.json.";
  }

  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    error.code === "auth/account-exists-with-different-credential"
  ) {
    return "This email is already linked to another sign-in method.";
  }

  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof error.message === "string" &&
    (error.message.includes("RNGoogleSignin") ||
      error.message.includes("TurboModuleRegistry"))
  ) {
    return "Native Google Sign-In is not available in this build yet. Rebuild the app and open the rebuilt app instead of Expo Go.";
  }

  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong while signing in with Google.";
}

export default function WelcomeScreen() {
  const router = useRouter();

  const [isSignInSheetVisible, setIsSignInSheetVisible] = useState(false);
  const [isPrivacyVisible, setIsPrivacyVisible] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const sheetAnimation = useRef(new Animated.Value(0)).current;
  const privacyAnimation = useRef(new Animated.Value(0)).current;

  const openSignInSheet = () => {
    setIsSignInSheetVisible(true);
    Animated.spring(sheetAnimation, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 170,
      mass: 0.8,
    }).start();
  };

  const closeSignInSheet = (onClosed?: () => void) => {
    Animated.timing(sheetAnimation, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsSignInSheetVisible(false);
        onClosed?.();
      }
    });
  };

  const openPrivacyPolicy = () => {
    setIsPrivacyVisible(true);
    Animated.timing(privacyAnimation, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closePrivacyPolicy = (onClosed?: () => void) => {
    Animated.timing(privacyAnimation, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsPrivacyVisible(false);
        onClosed?.();
      }
    });
  };

  const handleGoogleLogin = async () => {
    if (isGoogleSigningIn) {
      return;
    }

    try {
      setIsGoogleSigningIn(true);
      const result = await signInWithGoogle();

      if (!result) {
        return;
      }

      closeSignInSheet(() => router.replace("/diary"));
    } catch (error) {
      Alert.alert("Google Sign-In Failed", getGoogleSignInErrorMessage(error));
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#030A23]">
      <View className="flex-1 px-7 pb-8 pt-4">
        <View className="flex-1 items-center justify-center">
          <AppLogo />
        </View>

        <View className="pb-3">
          <WelcomeActions onNewUser={openPrivacyPolicy} onSignIn={openSignInSheet} />
        </View>
      </View>

      {isSignInSheetVisible && !isPrivacyVisible ? (
        <SignInSheet
          sheetAnimation={sheetAnimation}
          onClose={() => closeSignInSheet()}
          onEmailLogin={() => closeSignInSheet(() => router.push("/login"))}
          onGoogleLogin={handleGoogleLogin}
          isGoogleLoading={isGoogleSigningIn}
        />
      ) : null}

      {isPrivacyVisible ? (
        <PrivacyPolicyScreen
          privacyAnimation={privacyAnimation}
          onClose={() => closePrivacyPolicy()}
          onAccept={() => closePrivacyPolicy(() => router.push("/onboarding"))}
        />
      ) : null}
    </SafeAreaView>
  );
}
