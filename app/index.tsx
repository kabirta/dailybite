import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-[#068A00]">
      <View className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-[#5AFF5A]/15" />
      <View className="absolute -right-20 top-24 h-80 w-80 rounded-full bg-[#8CFF8C]/10" />
      <View className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#2DCF3A]/20" />

      <ScrollView
        contentContainerClassName="min-h-full px-5 pb-8 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center pt-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <Text className="text-2xl font-bold text-white">H</Text>
          </View>
          <Text className="mt-3 text-4xl font-extrabold tracking-wide text-white">HEALTHBANGLA</Text>
          <Text className="mt-1 text-lg text-white/90">Restoring Life Naturally</Text>
        </View>

        <View className="mt-14 items-center">
          <Text className="text-center text-6xl font-light leading-[64px] text-white">Be a part of</Text>
          <Text className="mt-2 text-center text-6xl font-extrabold leading-[64px] text-white">
            HealthBangla
          </Text>
          <Text className="mt-5 text-center text-xl text-white/90">
            Login to continue to HealthBangla
          </Text>
        </View>

        <View className="mt-10 rounded-[28px] border border-white/35 bg-black/25 px-4 py-6">
          <TextInput
            className="h-16 rounded-2xl border border-white/40 bg-[#0A7F00]/80 px-5 text-2xl font-semibold text-white"
            cursorColor="#ffffff"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.78)"
            value={email}
          />

          <TextInput
            className="mt-4 h-16 rounded-2xl border border-white/40 bg-[#0A7F00]/80 px-5 text-2xl font-semibold text-white"
            cursorColor="#ffffff"
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.78)"
            secureTextEntry
            value={password}
          />

          <Pressable className="mt-7 h-16 items-center justify-center rounded-2xl bg-white active:opacity-90">
            <Text className="text-2xl font-bold text-black">Login</Text>
          </Pressable>

          <Pressable className="mt-5 items-center active:opacity-80">
            <Text className="text-xl font-semibold text-white">Forget Password?</Text>
          </Pressable>

          <Pressable className="mt-8 h-16 flex-row items-center justify-center rounded-2xl bg-[#089300] active:opacity-90">
            <View className="mr-4 h-9 w-9 items-center justify-center rounded-full bg-white">
              <Text className="text-2xl font-bold text-[#4285F4]">G</Text>
            </View>
            <Text className="text-2xl font-semibold text-white">Sign in with Google</Text>
          </Pressable>

          <Text className="my-4 text-center text-2xl font-semibold text-white/90">or</Text>

          <View className="flex-row gap-3">
            <Pressable className="h-16 w-24 flex-row items-center justify-center rounded-2xl bg-[#0A9302] active:opacity-90">
              <Text className="text-2xl font-semibold text-white">IN</Text>
              <Text className="ml-2 text-xl font-bold text-white">v</Text>
            </Pressable>
            <TextInput
              className="flex-1 h-16 rounded-2xl bg-[#0A9302] px-5 text-2xl font-semibold text-white"
              cursorColor="#ffffff"
              keyboardType="phone-pad"
              onChangeText={setMobile}
              placeholder="Enter mobile number"
              placeholderTextColor="rgba(255,255,255,0.88)"
              value={mobile}
            />
          </View>
        </View>

        <View className="mt-6 flex-row items-center justify-center">
          <Text className="text-xl text-white/90">Don&apos;t have an account? </Text>
          <Pressable className="active:opacity-80">
            <Text className="text-xl font-bold text-white">Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

