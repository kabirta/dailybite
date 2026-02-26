import { Animated, Pressable, ScrollView, Text, View } from "react-native";

type PrivacyPolicyScreenProps = {
  privacyAnimation: Animated.Value;
  onClose: () => void;
  onAccept: () => void;
};

export default function PrivacyPolicyScreen({
  privacyAnimation,
  onClose,
  onAccept,
}: PrivacyPolicyScreenProps) {
  const privacyTranslateY = privacyAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 0],
  });

  return (
    <Animated.View
      className="absolute inset-0 bg-[#030A23]"
      style={{ opacity: privacyAnimation, transform: [{ translateY: privacyTranslateY }] }}
    >
      <View className="flex-1 px-5 pb-6 pt-2">
        <Pressable
          className="h-12 w-12 items-center justify-center rounded-full bg-white/15 active:opacity-80"
          onPress={onClose}
        >
          <Text className="text-2xl font-semibold text-white">X</Text>
        </Pressable>

        <ScrollView
          className="mt-3 flex-1"
          contentContainerClassName="pb-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center">
            <View className="relative h-[220px] w-[220px]">
              <View className="absolute left-[50px] top-[18px] h-[52px] w-[120px] rounded-t-2xl bg-[#F4DF95]" />
              <View className="absolute left-[36px] top-[40px] h-[118px] w-[148px] rounded-2xl bg-[#EDBE4C]" />
              <View className="absolute left-[6px] top-[72px] h-[46px] w-[82px] items-center justify-center rounded-xl bg-[#D8F2D0]">
                <Text className="text-[22px] font-bold tracking-[2px] text-[#1B7A49]">*****</Text>
              </View>
              <View className="absolute right-[6px] top-[70px] h-[116px] w-[88px] items-center rounded-[28px] bg-[#0FB257] pt-4">
                <View className="h-[26px] w-[26px] rounded-full bg-[#0A6A31]" />
                <View className="mt-3 h-[42px] w-[30px] rounded-b-[6px] rounded-t-[14px] bg-[#0A6A31]" />
              </View>
            </View>
          </View>

          <Text className="mt-2 text-[22px] font-extrabold leading-8 text-white">
            Before you get started
          </Text>

          <Text className="mt-5 text-[17px] leading-8 text-white/90">
            NutriMed AI&apos;s mission is to help you reach your nutrition goals by providing tools
            and support to get there. To enable this, we have updated our privacy policy. We want
            to let you know these changes to ensure we are transparent about how we intend to use
            the data you provide to us.
          </Text>

          <Text className="mt-8 text-[20px] font-extrabold leading-8 text-white">
            How we use your data
          </Text>

          <Text className="mt-4 text-[17px] leading-8 text-white/90">
            In summary, we use your data in the following ways:
          </Text>
          <Text className="mt-4 text-[17px] leading-8 text-white/90">
            - We use your personal and health data to provide you with nutrition goals and
            personalized nutrition guidance.
          </Text>
          <Text className="mt-4 text-[17px] leading-8 text-white/90">
            - We use your in-app activity data to send educational content and practical guides to
            get more from app features.
          </Text>
          <Text className="mt-4 text-[17px] leading-8 text-white/90">
            - We use general analytics data to improve our platforms by understanding how users use
            features throughout the website and app.
          </Text>

          <Text className="mt-8 text-[17px] leading-8 text-white/90">
            By clicking Yes, I Agree below, you confirm you have read the privacy policy and agree
            to the uses of your data as outlined above. You can withdraw this permission within the
            app in communication and privacy settings at any time.
          </Text>

          <Pressable className="mt-5 items-center">
            <Text className="text-[16px] text-white/85 underline">Privacy Policy</Text>
          </Pressable>

          <Pressable
            className="mt-8 h-16 items-center justify-center rounded-2xl bg-[#2ED972] active:opacity-90"
            onPress={onAccept}
          >
            <Text className="text-[16px] font-bold text-[#052540]">Yes, I Agree</Text>
          </Pressable>

          <Pressable
            className="mt-4 h-16 items-center justify-center rounded-2xl border-[3px] border-[#2ED972] active:opacity-90"
            onPress={onClose}
          >
            <Text className="text-[16px] font-bold text-[#2ED972]">No, I Do Not Agree</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Animated.View>
  );
}
