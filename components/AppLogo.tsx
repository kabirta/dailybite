import { Text, View } from "react-native";

export default function AppLogo() {
  return (
    <View className="items-center">
      <View className="h-44 w-44 items-center justify-center rounded-full border-[7px] border-white">
        <View className="absolute top-[34px] h-[52px] w-[52px] rounded-full bg-white" />
        <View
          className="absolute top-[78px] h-[64px] w-[56px] bg-white"
          style={{
            transform: [{ perspective: 1 }, { rotateX: "180deg" }],
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        />
      </View>
      <Text className="mt-7 text-5xl font-light tracking-wide text-white">NutriMed AI</Text>
      <Text className="mt-2 text-xl tracking-[1px] text-white/80">by CMC</Text>
    </View>
  );
}
