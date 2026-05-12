import { Pressable, Text } from "react-native";

type PrimaryButtonProps = {
  label: string;
  isDark: boolean;
  onPress: () => void;
};

export function PrimaryButton({ label, isDark, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      className={`w-full rounded-2xl px-5 py-4 shadow-lg ${
        isDark ? "bg-secondary" : "bg-primary"
      }`}
      onPress={onPress}
    >
      <Text className="text-center font-sans text-base font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
