import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";

export default function LoginScreen() {
  const router = useRouter();
  const { provider } = useLocalSearchParams<{ provider?: string }>();
  const isGoogleSignIn = provider === "google";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }}>
      <ScreenBackground>
      <View className="flex-1 items-center justify-center px-7">
        <Text className="text-center text-[48px] font-extrabold leading-[58px] text-[#072d66]">
          {isGoogleSignIn ? "Google Sign-In" : "Login Screen"}
        </Text>
        <Text className="mt-4 text-center text-[26px] leading-9 text-[#5f7492]">
          {isGoogleSignIn
            ? "Your Google sign-in flow can continue from here."
            : "Your onboarding answers are ready. Connect your auth flow here."}
        </Text>

        <Pressable
          className="mt-10 h-16 w-full items-center justify-center rounded-2xl bg-[#127dff]"
          onPress={() => router.replace("/")}
        >
          <Text className="text-[26px] font-bold text-white">Back to Welcome</Text>
        </Pressable>
      </View>
      </ScreenBackground>
    </SafeAreaView>
  );
}
