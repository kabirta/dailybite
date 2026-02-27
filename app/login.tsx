import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#030A23]">
      <View className="flex-1 items-center justify-center px-7">
        <Text className="text-center text-[48px] font-extrabold leading-[58px] text-white">
          Login Screen
        </Text>
        <Text className="mt-4 text-center text-[26px] leading-9 text-white/85">
          Your onboarding answers are ready. Connect your auth flow here.
        </Text>

        <Pressable
          className="mt-10 h-16 w-full items-center justify-center rounded-2xl bg-[#2ED972]"
          onPress={() => router.replace("/")}
        >
          <Text className="text-[26px] font-bold text-[#052540]">Back to Welcome</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
