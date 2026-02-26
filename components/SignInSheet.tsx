import { Animated, Pressable, Text, View } from "react-native";

type SignInSheetProps = {
  sheetAnimation: Animated.Value;
  onClose: () => void;
  onEmailLogin: () => void;
  onGoogleLogin: () => void;
};

export default function SignInSheet({
  sheetAnimation,
  onClose,
  onEmailLogin,
  onGoogleLogin,
}: SignInSheetProps) {
  const sheetTranslateY = sheetAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [520, 0],
  });

  const backdropOpacity = sheetAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.42],
  });

  return (
    <View className="absolute inset-0 justify-end">
      <Animated.View className="absolute inset-0" style={{ opacity: backdropOpacity }}>
        <Pressable className="flex-1 bg-black" onPress={onClose} />
      </Animated.View>

      <Animated.View
        className="rounded-t-[34px] bg-[#1A243D] px-6 pb-9 pt-6"
        style={{ transform: [{ translateY: sheetTranslateY }] }}
      >
        <View className="items-end">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full bg-white/70 active:opacity-85"
            onPress={onClose}
          >
            <Text className="text-2xl font-semibold text-[#1A243D]">X</Text>
          </Pressable>
        </View>

        <Text className="mt-2 text-center text-5xl font-semibold text-white">Sign in</Text>

        <Pressable
          className="mt-10 h-16 items-center justify-center rounded-2xl bg-[#2ED972] active:opacity-90"
          onPress={onEmailLogin}
        >
          <Text className="text-[13px] font-bold tracking-wide text-[#03162F]">
            EMAIL OR MEMBER NAME
          </Text>
        </Pressable>

        <Text className="mt-7 text-center text-5xl font-semibold text-white/80">or</Text>

        <Pressable
          className="mt-7 h-16 flex-row items-center rounded-2xl bg-[#4E88E9] px-4 active:opacity-90"
          onPress={onGoogleLogin}
        >
          <View className="h-11 w-11 items-center justify-center rounded-lg bg-white">
            <Text className="text-3xl font-extrabold text-[#4285F4]">G</Text>
          </View>
          <Text className="ml-8 text-[13px] font-bold tracking-wide text-[#06162D]">
            CONTINUE WITH GOOGLE
          </Text>
        </Pressable>

        <View className="mt-9 flex-row items-center justify-center">
          <Text className="text-[16px] text-white/90">Not a member? </Text>
          <Pressable>
            <Text className="text-[16px] font-bold text-[#2ED972]">Create Account</Text>
          </Pressable>
        </View>

        <Text className="mt-7 text-center text-[14px] leading-6 text-white/70">
          Facebook sign-in is no longer available. If you previously used Facebook to sign in,
          tap here to reset your password.
        </Text>
      </Animated.View>
    </View>
  );
}
