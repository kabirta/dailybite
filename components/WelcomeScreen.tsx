import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppLogo from "./AppLogo";
import PrivacyPolicyScreen from "./PrivacyPolicyScreen";
import SignInSheet from "./SignInSheet";
import WelcomeActions from "./WelcomeActions";

export default function WelcomeScreen() {
  const router = useRouter();

  const [isSignInSheetVisible, setIsSignInSheetVisible] = useState(false);
  const [isPrivacyVisible, setIsPrivacyVisible] = useState(false);

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
          onGoogleLogin={() => closeSignInSheet(() => router.push("/login"))}
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
