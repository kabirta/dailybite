import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RegionOption = "India" | "Other";
type GoalDirection = "lose_weight" | "maintain_weight" | "work_that_out";
type MainGoalOption =
  | "understand_food"
  | "manage_condition"
  | "improve_health"
  | "improve_emotional_wellbeing"
  | "other";
type SexOption = "female" | "male";
type ActivityLevel = "low" | "moderate" | "high" | "very_high";

type StepId =
  | "region"
  | "first_name"
  | "welcome"
  | "direction"
  | "goals_intro"
  | "main_goal"
  | "challenge"
  | "rdi_intro"
  | "height"
  | "weight"
  | "dob"
  | "sex"
  | "activity";

type OnboardingAnswers = {
  region: RegionOption | null;
  firstName: string;
  direction: GoalDirection | null;
  mainGoal: MainGoalOption | null;
  challenges: string[];
  height: string;
  heightUnit: "cm" | "ft/in";
  weight: string;
  weightUnit: "kg" | "lb";
  dateOfBirth: string;
  sex: SexOption | null;
  activityLevel: ActivityLevel | null;
};

const FLOW_STEPS: StepId[] = [
  "region",
  "first_name",
  "welcome",
  "direction",
  "goals_intro",
  "main_goal",
  "challenge",
  "rdi_intro",
  "height",
  "weight",
  "dob",
  "sex",
  "activity",
];

const CHALLENGE_OPTIONS = [
  "Lack of support",
  "Staying motivated",
  "Lack of knowledge",
  "Planning meals",
  "Partner or family diets",
  "Busy schedule",
  "Emotional eating",
];

const PROGRESS_SEGMENTS = 8;

function isPositiveNumber(value: string) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) && parsed > 0;
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() + 1 !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function calculateAge(date: Date) {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDifference = today.getMonth() - date.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < date.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function OptionCard({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="mb-4 rounded-2xl border px-5 py-5"
      style={{
        borderColor: selected ? "#2ED972" : "rgba(255,255,255,0.24)",
        backgroundColor: selected ? "#0C6E39" : "#05070F",
      }}
      onPress={onPress}
    >
      <Text className="text-[37px] font-semibold text-white">{label}</Text>
      {description ? (
        <Text className="mt-1 text-[26px] leading-9 text-white/85">{description}</Text>
      ) : null}
    </Pressable>
  );
}

function InfoCard({ children }: { children: string }) {
  return (
    <View className="mt-5 rounded-2xl border border-white/10 bg-[#4C5569] px-5 py-5">
      <Text className="text-[26px] leading-9 text-white/90">{children}</Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    region: null,
    firstName: "",
    direction: null,
    mainGoal: null,
    challenges: [],
    height: "",
    heightUnit: "ft/in",
    weight: "",
    weightUnit: "kg",
    dateOfBirth: "",
    sex: null,
    activityLevel: null,
  });

  const currentStep = FLOW_STEPS[stepIndex];
  const currentName = answers.firstName.trim() || "friend";
  const parsedDate = useMemo(() => parseIsoDate(answers.dateOfBirth), [answers.dateOfBirth]);
  const age = useMemo(() => (parsedDate ? calculateAge(parsedDate) : null), [parsedDate]);
  const isLastStep = stepIndex === FLOW_STEPS.length - 1;

  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case "region":
        return answers.region !== null;
      case "first_name":
        return answers.firstName.trim().length > 0;
      case "direction":
        return answers.direction !== null;
      case "main_goal":
        return answers.mainGoal !== null;
      case "challenge":
        return answers.challenges.length > 0;
      case "height":
        return isPositiveNumber(answers.height);
      case "weight":
        return isPositiveNumber(answers.weight);
      case "dob":
        return age !== null && age >= 13 && age <= 120;
      case "sex":
        return answers.sex !== null;
      case "activity":
        return answers.activityLevel !== null;
      default:
        return true;
    }
  }, [age, answers, currentStep]);

  const activeSegments = Math.max(
    1,
    Math.ceil(((stepIndex + 1) / FLOW_STEPS.length) * PROGRESS_SEGMENTS),
  );

  const ctaLabel = (() => {
    switch (currentStep) {
      case "welcome":
        return "Get Started";
      case "rdi_intro":
        return "Set Up My RDI";
      case "activity":
        return "Calculate my RDI";
      default:
        return "Next";
    }
  })();

  const goBack = () => {
    if (stepIndex === 0) {
      router.back();
      return;
    }

    setStepIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (!isCurrentStepValid) {
      return;
    }

    if (isLastStep) {
      router.replace("/login");
      return;
    }

    setStepIndex((prev) => prev + 1);
  };

  const skipFirstName = () => {
    if (currentStep !== "first_name") {
      return;
    }

    setStepIndex((prev) => prev + 1);
  };

  const toggleChallenge = (label: string) => {
    setAnswers((prev) => {
      const isSelected = prev.challenges.includes(label);

      if (isSelected) {
        return {
          ...prev,
          challenges: prev.challenges.filter((item) => item !== label),
        };
      }

      if (prev.challenges.length >= 3) {
        return prev;
      }

      return {
        ...prev,
        challenges: [...prev.challenges, label],
      };
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case "region":
        return (
          <>
            <Text className="text-[56px] font-extrabold leading-[66px] text-white">
              What is your region?
            </Text>
            <Text className="mt-4 text-[28px] leading-10 text-white/90">
              We&apos;ll use this to show the most relevant food search results for your region.
            </Text>

            <View className="mt-12">
              <OptionCard
                label="India"
                selected={answers.region === "India"}
                onPress={() => setAnswers((prev) => ({ ...prev, region: "India" }))}
              />
              <OptionCard
                label="Other"
                selected={answers.region === "Other"}
                onPress={() => setAnswers((prev) => ({ ...prev, region: "Other" }))}
              />
            </View>
          </>
        );

      case "first_name":
        return (
          <>
            <Text className="text-[56px] font-extrabold leading-[66px] text-white">
              Hi! What&apos;s your first name?
            </Text>
            <Text className="mt-4 text-[28px] leading-10 text-white/90">
              We&apos;ll use it to personalize the NutriMed app to you.
            </Text>

            <TextInput
              className="mt-12 h-20 rounded-2xl border border-white/20 bg-[#05070F] px-5 text-[30px] text-white"
              placeholder="Enter first name"
              placeholderTextColor="rgba(255,255,255,0.55)"
              value={answers.firstName}
              onChangeText={(value) => setAnswers((prev) => ({ ...prev, firstName: value }))}
              maxLength={40}
              returnKeyType="done"
            />

            <Text className="mt-4 text-[22px] text-white/60">
              Your first name is private and only visible to you.
            </Text>

            <Pressable className="mt-12 items-center" onPress={skipFirstName}>
              <Text className="text-[35px] font-semibold text-[#2ED972]">Skip</Text>
            </Pressable>
          </>
        );

      case "welcome":
        return (
          <>
            <View className="mt-4 h-[180px] w-[180px] items-center justify-center self-center rounded-[44px] bg-[#0D7C42]">
              <Text className="text-[48px] font-extrabold text-white">HI</Text>
            </View>

            <Text className="mt-8 text-[56px] font-extrabold leading-[66px] text-white">
              Nice to meet you, {currentName}
            </Text>
            <Text className="mt-2 text-[56px] font-extrabold leading-[66px] text-[#2ED972]">
              Welcome to NutriMed!
            </Text>

            <Text className="mt-7 text-[31px] leading-[42px] text-white/90">
              To get started, we&apos;ll ask a few quick questions.
            </Text>

            <InfoCard>
              Your answers help us understand your goals so we can personalize the app for you.
            </InfoCard>
          </>
        );

      case "direction":
        return (
          <>
            <Text className="text-[56px] font-extrabold leading-[66px] text-white">
              I&apos;m here to:
            </Text>

            <View className="mt-12">
              <OptionCard
                label="Lose weight"
                selected={answers.direction === "lose_weight"}
                onPress={() => setAnswers((prev) => ({ ...prev, direction: "lose_weight" }))}
              />
              <OptionCard
                label="Maintain my weight"
                selected={answers.direction === "maintain_weight"}
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, direction: "maintain_weight" }))
                }
              />
              <OptionCard
                label="Work that out"
                selected={answers.direction === "work_that_out"}
                onPress={() => setAnswers((prev) => ({ ...prev, direction: "work_that_out" }))}
              />
            </View>
          </>
        );

      case "goals_intro":
        return (
          <>
            <View className="mt-4 h-[180px] w-[180px] items-center justify-center self-center rounded-[44px] bg-[#45516B]">
              <Text className="text-[44px] font-extrabold text-white">GOAL</Text>
            </View>

            <Text className="mt-8 text-[56px] font-extrabold leading-[66px] text-white">
              Ok {currentName}, let&apos;s start with your goals
            </Text>

            <Text className="mt-6 text-[30px] leading-[42px] text-white/90">
              Most people have more than one reason for wanting to make a change, and more than
              one challenge that&apos;s made it hard in the past.
            </Text>
            <Text className="mt-5 text-[30px] leading-[42px] text-white/90">
              We want to understand your broader goals and what&apos;s getting in the way.
            </Text>

            <InfoCard>
              Your answers will help us tailor the content and tips you see in the app.
            </InfoCard>
          </>
        );

      case "main_goal":
        return (
          <>
            <Text className="text-[56px] font-extrabold leading-[66px] text-white">
              What is your main health goal?
            </Text>

            <View className="mt-8">
              <OptionCard
                label="Understand my food intake"
                selected={answers.mainGoal === "understand_food"}
                onPress={() => setAnswers((prev) => ({ ...prev, mainGoal: "understand_food" }))}
              />
              <OptionCard
                label="Manage a medical condition"
                selected={answers.mainGoal === "manage_condition"}
                onPress={() => setAnswers((prev) => ({ ...prev, mainGoal: "manage_condition" }))}
              />
              <OptionCard
                label="Improve my overall health"
                selected={answers.mainGoal === "improve_health"}
                onPress={() => setAnswers((prev) => ({ ...prev, mainGoal: "improve_health" }))}
              />
              <OptionCard
                label="Improve my emotional wellbeing"
                selected={answers.mainGoal === "improve_emotional_wellbeing"}
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, mainGoal: "improve_emotional_wellbeing" }))
                }
              />
              <OptionCard
                label="Other"
                selected={answers.mainGoal === "other"}
                onPress={() => setAnswers((prev) => ({ ...prev, mainGoal: "other" }))}
              />
            </View>

            <InfoCard>
              This helps us understand why you&apos;re here, so we can support you more personally.
            </InfoCard>
          </>
        );

      case "challenge":
        return (
          <>
            <Text className="text-[56px] font-extrabold leading-[66px] text-white">
              What&apos;s made managing your weight hard in the past?
            </Text>
            <Text className="mt-5 text-[35px] font-semibold leading-[45px] text-[#FF7B39]">
              Select up to 3 that are most relevant for you.
            </Text>

            <View className="mt-8">
              {CHALLENGE_OPTIONS.map((option) => {
                const selected = answers.challenges.includes(option);

                return (
                  <Pressable
                    key={option}
                    className="mb-4 flex-row items-center justify-between rounded-2xl border px-5 py-5"
                    style={{
                      borderColor: selected ? "#2ED972" : "rgba(255,255,255,0.24)",
                      backgroundColor: selected ? "#0C6E39" : "#05070F",
                    }}
                    onPress={() => toggleChallenge(option)}
                  >
                    <Text className="mr-4 flex-1 text-[34px] font-semibold text-white">{option}</Text>
                    <View
                      className="h-8 w-8 rounded-md border"
                      style={{
                        borderColor: selected ? "#2ED972" : "rgba(255,255,255,0.62)",
                        backgroundColor: selected ? "#2ED972" : "transparent",
                      }}
                    />
                  </Pressable>
                );
              })}
            </View>
          </>
        );

      case "rdi_intro":
        return (
          <>
            <View className="mt-4 h-[180px] w-[180px] items-center justify-center self-center rounded-[44px] bg-[#204A4D]">
              <Text className="text-[44px] font-extrabold text-white">RDI</Text>
            </View>

            <Text className="mt-8 text-[56px] font-extrabold leading-[66px] text-white">
              Let&apos;s calculate your RDI
            </Text>

            <Text className="mt-6 text-[30px] leading-[42px] text-white/90">
              Your RDI (Recommended Daily Intake) is your personal daily calorie target. It tells
              you how many calories you need each day based on your goal.
            </Text>

            <View className="my-8 h-[1px] bg-white/25" />

            <Text className="text-[30px] leading-[42px] text-white/90">
              To calculate your RDI, we&apos;ll ask a few quick questions about your profile details,
              including height, weight, date of birth, sex and activity level.
            </Text>
          </>
        );

      case "height":
        return (
          <>
            <Text className="text-[56px] font-extrabold leading-[66px] text-white">
              What is your height?
            </Text>

            <View className="mt-10 flex-row gap-3">
              <TextInput
                className="h-20 flex-1 rounded-2xl border border-white/20 bg-[#05070F] px-5 text-[34px] text-white"
                placeholder={answers.heightUnit === "cm" ? "170" : "5.7"}
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="decimal-pad"
                value={answers.height}
                onChangeText={(value) => setAnswers((prev) => ({ ...prev, height: value }))}
              />

              <Pressable
                className="h-20 min-w-[130px] items-center justify-center rounded-2xl bg-[#424A5C] px-4"
                onPress={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    heightUnit: prev.heightUnit === "cm" ? "ft/in" : "cm",
                  }))
                }
              >
                <Text className="text-[31px] font-semibold text-white">{answers.heightUnit}</Text>
              </Pressable>
            </View>

            <InfoCard>Your height plays a role in how much energy your body uses each day.</InfoCard>
          </>
        );

      case "weight":
        return (
          <>
            <Text className="text-[56px] font-extrabold leading-[66px] text-white">
              What is your current weight?
            </Text>

            <View className="mt-10 flex-row gap-3">
              <TextInput
                className="h-20 flex-1 rounded-2xl border border-white/20 bg-[#05070F] px-5 text-[34px] text-white"
                placeholder="60"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="decimal-pad"
                value={answers.weight}
                onChangeText={(value) => setAnswers((prev) => ({ ...prev, weight: value }))}
              />

              <Pressable
                className="h-20 min-w-[130px] items-center justify-center rounded-2xl bg-[#424A5C] px-4"
                onPress={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    weightUnit: prev.weightUnit === "kg" ? "lb" : "kg",
                  }))
                }
              >
                <Text className="text-[31px] font-semibold text-white">{answers.weightUnit}</Text>
              </Pressable>
            </View>

            <InfoCard>
              This helps us calculate a calorie target for weight goals based on where you&apos;re
              starting from.
            </InfoCard>
          </>
        );

      case "dob":
        return (
          <>
            <Text className="text-[56px] font-extrabold leading-[66px] text-white">
              What is your date of birth?
            </Text>

            <TextInput
              className="mt-10 h-20 rounded-2xl border border-white/20 bg-[#05070F] px-5 text-[34px] text-white"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="numbers-and-punctuation"
              value={answers.dateOfBirth}
              onChangeText={(value) =>
                setAnswers((prev) => ({ ...prev, dateOfBirth: value.trim() }))
              }
              maxLength={10}
            />

            {age !== null ? (
              <Text className="mt-7 text-[39px] text-white">
                You are: <Text className="font-bold">{age} years old</Text>
              </Text>
            ) : (
              <Text className="mt-7 text-[26px] text-white/70">
                Enter your birth date in format YYYY-MM-DD.
              </Text>
            )}

            <InfoCard>Your age affects how much energy your body needs each day.</InfoCard>
          </>
        );

      case "sex":
        return (
          <>
            <Text className="text-[56px] font-extrabold leading-[66px] text-white">
              What is your sex?
            </Text>

            <View className="mt-12">
              <OptionCard
                label="Female"
                selected={answers.sex === "female"}
                onPress={() => setAnswers((prev) => ({ ...prev, sex: "female" }))}
              />
              <OptionCard
                label="Male"
                selected={answers.sex === "male"}
                onPress={() => setAnswers((prev) => ({ ...prev, sex: "male" }))}
              />
            </View>

            <Pressable className="items-center">
              <Text className="text-[30px] text-white/75 underline">Info for gender-diverse individuals</Text>
            </Pressable>

            <InfoCard>Your sex affects how much energy your body needs each day.</InfoCard>
          </>
        );

      case "activity":
        return (
          <>
            <Text className="text-[56px] font-extrabold leading-[66px] text-white">
              Which best describes your average daily activity level?
            </Text>

            <Text className="mt-4 text-[28px] leading-10 text-white/90">
              Your activity level helps us determine how many calories your body needs each day.
            </Text>

            <View className="mt-6 rounded-2xl border border-[#8EB4FF]/50 bg-[#2A4E8C] px-5 py-5">
              <Text className="text-[29px] font-semibold text-white">Tip</Text>
              <Text className="mt-2 text-[27px] leading-10 text-white/90">
                If you&apos;re unsure, choose the lower option to avoid overestimating calorie needs.
              </Text>
            </View>

            <View className="mt-7">
              <OptionCard
                label="Low"
                description="Most of the day sitting and light exercise 1-2 times per week."
                selected={answers.activityLevel === "low"}
                onPress={() => setAnswers((prev) => ({ ...prev, activityLevel: "low" }))}
              />
              <OptionCard
                label="Moderate"
                description="Lightly active during the day and moderate exercise 1-2 times per week."
                selected={answers.activityLevel === "moderate"}
                onPress={() => setAnswers((prev) => ({ ...prev, activityLevel: "moderate" }))}
              />
              <OptionCard
                label="High"
                description="On your feet for most of the day and/or high intensity exercise 3-5 times weekly."
                selected={answers.activityLevel === "high"}
                onPress={() => setAnswers((prev) => ({ ...prev, activityLevel: "high" }))}
              />
              <OptionCard
                label="Very High"
                description="Physically demanding work or intense training most days."
                selected={answers.activityLevel === "very_high"}
                onPress={() => setAnswers((prev) => ({ ...prev, activityLevel: "very_high" }))}
              />
            </View>
          </>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#030A23]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="px-5 pb-3 pt-2">
          <View className="flex-row items-center gap-3">
            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full bg-white/15"
              onPress={goBack}
            >
              <Text className="text-[26px] font-semibold text-white">{"<"}</Text>
            </Pressable>

            <View className="flex-1 flex-row items-center gap-1.5">
              {Array.from({ length: PROGRESS_SEGMENTS }, (_, index) => {
                const isActive = index < activeSegments;
                return (
                  <View
                    key={index}
                    className="h-2 flex-1 rounded-full"
                    style={{ backgroundColor: isActive ? "#2ED972" : "#5B6478" }}
                  />
                );
              })}
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        <View className="border-t border-white/10 bg-[#030A23] px-6 pb-6 pt-4">
          <Pressable
            className="h-16 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: isCurrentStepValid ? "#2ED972" : "#2D3448",
            }}
            disabled={!isCurrentStepValid}
            onPress={goNext}
          >
            <Text
              className="text-[28px] font-bold"
              style={{ color: isCurrentStepValid ? "#052540" : "rgba(255,255,255,0.55)" }}
            >
              {ctaLabel}
            </Text>
          </Pressable>

          {!isCurrentStepValid && currentStep === "dob" ? (
            <Text className="mt-3 text-center text-[20px] text-[#FF7B39]">
              Enter a valid date and age between 13 and 120.
            </Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
