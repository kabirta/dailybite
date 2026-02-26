import { Pressable, Text } from "react-native";

type WelcomeActionsProps = {
  onNewUser: () => void;
  onSignIn: () => void;
};

export default function WelcomeActions({ onNewUser, onSignIn }: WelcomeActionsProps) {
  return (
    <>
      <Pressable
        className="h-20 items-center justify-center rounded-3xl bg-[#2ED972] active:opacity-90"
        onPress={onNewUser}
      >
        <Text className="text-[18px] font-semibold text-[#021329]">I am a new user</Text>
      </Pressable>

      <Pressable
        className="mt-5 h-20 items-center justify-center rounded-3xl border-[3px] border-[#2ED972] bg-transparent active:opacity-90"
        onPress={onSignIn}
      >
        <Text className="px-2 text-center text-[16px] font-semibold text-[#2ED972]">
          I already have an account
        </Text>
      </Pressable>

      <Text className="mt-8 text-center text-[18px] leading-7 text-white/85">
        By continuing you agree to the
      </Text>
      <Text className="text-center text-[18px] leading-7 text-white/85 underline">
        Terms and Conditions and Privacy Policy
      </Text>
    </>
  );
}
