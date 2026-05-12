import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  View,
} from 'react-native';

import { SCREEN_COLORS } from './ScreenBackground';

type SignInSheetProps = {
  sheetAnimation: Animated.Value;
  onClose: () => void;
  onEmailLogin: () => void;
  onGoogleLogin: () => void;
  isGoogleLoading?: boolean;
};

export default function SignInSheet({
  sheetAnimation,
  onClose,
  onEmailLogin,
  onGoogleLogin,
  isGoogleLoading = false,
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
        className="rounded-t-[34px] px-6 pb-9 pt-6"
        style={{
          backgroundColor: SCREEN_COLORS.card,
          borderTopColor: SCREEN_COLORS.border,
          borderTopWidth: 1,
          transform: [{ translateY: sheetTranslateY }],
        }}
      >
        <View className="items-end">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full active:opacity-85"
            style={{ backgroundColor: SCREEN_COLORS.iconBg }}
            onPress={onClose}
          >
            <Text className="text-2xl font-semibold text-[#072d66]">X</Text>
          </Pressable>
        </View>

        <Text className="mb-20 mt-2 text-center text-4xl font-semibold text-[#072d66]">Sign in</Text>

        <Pressable
          className="h-16 flex-row items-center rounded-2xl px-4 -translate-y-8 active:opacity-90"
          style={{ backgroundColor: SCREEN_COLORS.iconBg }}
          disabled={isGoogleLoading}
          onPress={onGoogleLogin}
        >
          {isGoogleLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#06162D" />
            </View>
          ) : (
            <>
              <View className="h-11 w-11 items-center justify-center rounded-lg bg-white">
                <Text className="text-3xl font-extrabold text-[#4285F4]">G</Text>
              </View>
              <Text className="ml-8 text-[13px] font-bold tracking-wide text-[#072d66]">
                SIGN IN WITH GOOGLE
              </Text>
            </>
          )}
        </Pressable>

      </Animated.View>
    </View>
  );
}
