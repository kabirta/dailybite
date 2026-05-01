import {
  useRef,
  useState,
} from 'react';

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Feather } from '@expo/vector-icons';

import { signInWithGoogle } from '../src/services/authService';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';
import SignInSheet from './SignInSheet';

const features = [
  { label: "Personalized Plan", icon: "feather" },
  { label: "Health \n Insights", icon: "heart" },
  { label: "Smarter\nYou", icon: "circle" },
] as const;

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View pointerEvents="none" style={styles.topShape} />
      <View pointerEvents="none" style={styles.topShapeSoft} />
      <View pointerEvents="none" style={styles.bottomShape} />
      <View pointerEvents="none" style={styles.bottomShapeSoft} />

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBlock}>
          <Text style={styles.title}>
            Your Health{"\n"}Personalized By <Text style={styles.titleAccent}>AI</Text>
          </Text>

          <Image
            accessibilityIgnoresInvertColors
            source={require("../assets/icon.png")}
            style={styles.logo}
          />
        </View>

        <View style={styles.featureRow}>
          {features.map((feature, index) => (
            <View key={feature.label} style={styles.featureGroup}>
              <View
                style={[
                  styles.featureItem,
                  feature.label.includes("Health") && styles.featureItemShiftRight,
                ]}
              >
                <View style={styles.featureIconBox}>
                  <Feather name={feature.icon} size={22} color="#2374df" />
                </View>
                <Text style={styles.featureText}>{feature.label}</Text>
              </View>
              {index < features.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.76}
            style={styles.signupButton}
            onPress={openPrivacyPolicy}
          >
            <Text style={styles.signupText}>Signup</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>have account already? </Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              onPress={openSignInSheet}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.loginLink}>Login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  topShape: {
    position: "absolute",
    top: -96,
    right: -132,
    width: 360,
    height: 520,
    borderBottomLeftRadius: 190,
    backgroundColor: "#dff3ff",
  },
  topShapeSoft: {
    position: "absolute",
    top: -54,
    right: -82,
    width: 290,
    height: 430,
    borderBottomLeftRadius: 160,
    backgroundColor: "rgba(229, 247, 255, 0.72)",
  },
  bottomShape: {
    position: "absolute",
    left: -140,
    right: -90,
    bottom: -138,
    height: 300,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 210,
    backgroundColor: "#dff3ff",
  },
  bottomShapeSoft: {
    position: "absolute",
    left: -70,
    right: -30,
    bottom: -92,
    height: 235,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 180,
    backgroundColor: "rgba(233, 248, 255, 0.78)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 44,
    paddingTop: 58,
  },
  heroBlock: {
    alignItems: "center",
  },
  title: {
    color: "#072d66",
    fontSize: 30,
    fontWeight: "500",
    lineHeight: 40,
    textAlign: "center",
  },
  titleAccent: {
    color: "#1688f2",
  },
  logo: {
    width: 180,
    height: 180,
    marginTop: 58,
    borderRadius: 42,
  },
  featureRow: {
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 78,
  },
  featureGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureItem: {
    width: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  featureItemShiftRight: {
    transform: [{ translateX: 8 }],
  },
  featureIconBox: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#cfe9ff",
  },
  featureText: {
    marginLeft: 8,
    color: "#050505",
    fontSize: 13,
    fontWeight: "500",
    
  },
  divider: {
 
    marginHorizontal: 11,
    backgroundColor: "#2374df",
    
  },
  actions: {
    alignItems: "center",
    marginTop: 92,
  },
  signupButton: {
    width: 140,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#127dff",
    borderWidth: 0,
    overflow: "hidden",
  },
  signupText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "400",
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    flexWrap: "wrap",
  },
  loginPrompt: {
    color: "#050505",
    fontSize: 22,
    fontWeight: "400",
  },
  loginLink: {
    color: "#2374df",
    fontSize: 22,
    fontWeight: "400",
  },
  pressed: {
    opacity: 0.76,
  },
});
