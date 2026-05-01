import { useRouter } from "expo-router";
import { useMemo, useState, type ReactNode } from "react";
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
const SURFACE = {
  background: "#EAF6FF",
  card: "rgba(255,255,255,0.82)",
  cardStrong: "#F8FCFF",
  primary: "#2797FF",
  primaryDark: "#12314F",
  secondary: "#67809B",
  muted: "#88A6C4",
  border: "#D7E8F7",
  borderSoft: "#CFE3F5",
  selection: "#E7F4FF",
  selectionSoft: "#F3F9FF",
  progressInactive: "rgba(87, 127, 166, 0.18)",
  footer: "rgba(234, 246, 255, 0.88)",
};
const CARD_SHADOW = {
  shadowColor: "#70B9FF",
  shadowOpacity: 0.14,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 16 },
  elevation: 8,
};
const OPTION_SHADOW = {
  shadowColor: "#8ABAE7",
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 3,
};

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

function SelectionIndicator({
  selected,
  shape = "circle",
}: {
  selected: boolean;
  shape?: "circle" | "square";
}) {
  return (
    <View
      className="mt-1 h-7 w-7 items-center justify-center border"
      style={{
        borderRadius: shape === "square" ? 8 : 999,
        borderColor: selected ? SURFACE.primary : "#BDD8EE",
        backgroundColor: selected ? SURFACE.primary : "#FFFFFF",
      }}
    >
      {selected ? (
        <View
          className={shape === "square" ? "h-3 w-3 rounded-sm bg-white" : "h-3 w-3 rounded-full bg-white"}
        />
      ) : null}
    </View>
  );
}

function OptionCard({
  label,
  description,
  selected,
  onPress,
  indicator = "circle",
}: {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  indicator?: "circle" | "square";
}) {
  return (
    <Pressable
      className="mb-3 rounded-[28px] border px-5 py-5"
      style={{
        ...OPTION_SHADOW,
        borderColor: selected ? SURFACE.primary : SURFACE.border,
        backgroundColor: selected ? SURFACE.selection : SURFACE.cardStrong,
      }}
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between">
        <View className="mr-4 flex-1">
          <Text className="text-[24px] font-semibold leading-8" style={{ color: SURFACE.primaryDark }}>
            {label}
          </Text>
          {description ? (
            <Text className="mt-2 text-[16px] leading-7" style={{ color: SURFACE.secondary }}>
              {description}
            </Text>
          ) : null}
        </View>
        <SelectionIndicator selected={selected} shape={indicator} />
      </View>
    </Pressable>
  );
}

function InfoCard({
  children,
  title = "Why we ask",
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <View
      className="rounded-[24px] border px-5 py-5"
      style={{
        borderColor: SURFACE.borderSoft,
        backgroundColor: "#EEF7FF",
      }}
    >
      <Text className="text-[15px] font-semibold" style={{ color: SURFACE.muted, letterSpacing: 1.8 }}>
        {title.toUpperCase()}
      </Text>
      <Text className="mt-2 text-[17px] leading-7" style={{ color: SURFACE.secondary }}>
        {children}
      </Text>
    </View>
  );
}

function HeroBadge({ label, tint }: { label: string; tint: string }) {
  return (
    <View
      className="mb-6 h-[92px] w-[92px] items-center justify-center self-center rounded-[28px]"
      style={{ backgroundColor: tint }}
    >
      <Text className="text-[24px] font-extrabold tracking-[2px] text-white">{label}</Text>
    </View>
  );
}

function StepCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  centered = false,
  badge,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  centered?: boolean;
  badge?: ReactNode;
}) {
  return (
    <View className={centered ? "flex-1 justify-center py-6" : "py-4"}>
      <View
        className="rounded-[32px] border border-white/80 bg-white/80 px-6 py-7"
        style={CARD_SHADOW}
      >
        <Text className="text-[16px] font-semibold" style={{ color: SURFACE.muted, letterSpacing: 2.4 }}>
          {eyebrow}
        </Text>
        {badge}
        <Text className="text-[35px] font-extrabold leading-[48px]" style={{ color: SURFACE.primaryDark }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-3 text-[15px] leading-8" style={{ color: SURFACE.secondary }}>
            {subtitle}
          </Text>
        ) : null}
        {children ? <View className="mt-8">{children}</View> : null}
      </View>
      {footer ? <View className="mt-6">{footer}</View> : null}
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
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
  const trimmedName = answers.firstName.trim();
  const currentName = trimmedName ? trimmedName.split(/\s+/)[0] : "friend";
  const parsedDate = useMemo(() => parseIsoDate(answers.dateOfBirth), [answers.dateOfBirth]);
  const age = useMemo(() => (parsedDate ? calculateAge(parsedDate) : null), [parsedDate]);
  const isLastStep = stepIndex === FLOW_STEPS.length - 1;

  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
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
      case "first_name":
        return (
          <StepCard
            eyebrow="PROFILE"
            title="Your full name"
            subtitle="Private and only visible to you."
            centered
            footer={
              <Pressable
                className="items-center self-center rounded-full bg-white/70 px-5 py-3"
                onPress={skipFirstName}
              >
                <Text className="text-[18px] font-semibold" style={{ color: "#4E7CAB" }}>
                  Skip for now
                </Text>
              </Pressable>
            }
          >
            <View
              className="rounded-[28px] border px-5 py-4"
              style={{
                borderColor: SURFACE.border,
                backgroundColor: SURFACE.cardStrong,
              }}
            >
              <Text className="text-[15px] font-semibold" style={{ color: SURFACE.muted, letterSpacing: 1.8 }}>
                NAME
              </Text>
              <TextInput
                className="mt-3 h-14 text-[25px] font-semibold"
                style={{ color: SURFACE.primaryDark }}
                placeholder="Enter full name"
                placeholderTextColor="#9FB6CC"
                value={answers.firstName}
                onChangeText={(value) => setAnswers((prev) => ({ ...prev, firstName: value }))}
                maxLength={40}
                returnKeyType="done"
                autoCapitalize="words"
                autoCorrect={false}
                textContentType="name"
                selectionColor={SURFACE.primary}
              />
            </View>
          </StepCard>
        );

      case "welcome":
        return (
          <StepCard
            eyebrow="WELCOME"
            title={`Nice to meet you, ${currentName}`}
            subtitle="We'll ask a few quick questions to personalize NutriMed for you."
            centered
            badge={<HeroBadge label="HI" tint="#65B6FF" />}
          >
            <InfoCard title="Quick setup">
              Your answers help us tailor goals, daily targets, and the guidance you see in the
              app.
            </InfoCard>
          </StepCard>
        );

      case "direction":
        return (
          <StepCard
            eyebrow="GOAL"
            title="What brings you here?"
            subtitle="Pick the option that feels closest right now."
          >
            <OptionCard
              label="Lose weight"
              selected={answers.direction === "lose_weight"}
              onPress={() => setAnswers((prev) => ({ ...prev, direction: "lose_weight" }))}
            />
            <OptionCard
              label="Maintain my weight"
              selected={answers.direction === "maintain_weight"}
              onPress={() => setAnswers((prev) => ({ ...prev, direction: "maintain_weight" }))}
            />
            <OptionCard
              label="Work that out"
              selected={answers.direction === "work_that_out"}
              onPress={() => setAnswers((prev) => ({ ...prev, direction: "work_that_out" }))}
            />
          </StepCard>
        );

      case "goals_intro":
        return (
          <StepCard
            eyebrow="GOALS"
            title={`Let's understand your goals, ${currentName}`}
            subtitle="A few quick answers help us tailor the tips and content you see every day."
            centered
            badge={<HeroBadge label="GOAL" tint="#89AEE0" />}
          >
            <InfoCard title="Up next">
              We'll ask about your main goal and what usually gets in the way so the plan feels
              more personal.
            </InfoCard>
          </StepCard>
        );

      case "main_goal":
        return (
          <StepCard
            eyebrow="HEALTH"
            title="Your main health goal"
            subtitle="Choose the outcome that matters most to you right now."
          >
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

            <View className="mt-2">
              <InfoCard title="Why this matters">
                This helps us understand why you're here so the experience feels more relevant
                from the start.
              </InfoCard>
            </View>
          </StepCard>
        );

      case "challenge":
        return (
          <StepCard
            eyebrow="CHALLENGES"
            title="What gets in the way?"
            subtitle="Choose up to 3 that feel most true for you today."
          >
            {CHALLENGE_OPTIONS.map((option) => {
              const selected = answers.challenges.includes(option);

              return (
                <OptionCard
                  key={option}
                  label={option}
                  selected={selected}
                  indicator="square"
                  onPress={() => toggleChallenge(option)}
                />
              );
            })}

            <View className="mt-2">
              <InfoCard title="Selection tip">
                Pick the most important three so we can focus on the patterns that matter most.
              </InfoCard>
            </View>
          </StepCard>
        );

      case "rdi_intro":
        return (
          <StepCard
            eyebrow="RDI"
            title="Let's calculate your RDI"
            subtitle="Recommended Daily Intake is your personal daily calorie target."
            centered
            badge={<HeroBadge label="RDI" tint="#5AAFC1" />}
          >
            <InfoCard title="We'll use">
              Your height, weight, date of birth, sex, and activity level to estimate a helpful
              starting target.
            </InfoCard>
          </StepCard>
        );

      case "height":
        return (
          <StepCard
            eyebrow="PROFILE"
            title="Your height"
            subtitle="Use the unit that feels easiest for you."
          >
            <View className="flex-row gap-3">
              <View
                className="flex-1 rounded-[28px] border px-5 py-4"
                style={{
                  borderColor: SURFACE.border,
                  backgroundColor: SURFACE.cardStrong,
                }}
              >
                <Text
                  className="text-[15px] font-semibold"
                  style={{ color: SURFACE.muted, letterSpacing: 1.8 }}
                >
                  HEIGHT
                </Text>
                <TextInput
                  className="mt-3 h-14 text-[25px] font-semibold"
                  style={{ color: SURFACE.primaryDark }}
                  
                  placeholderTextColor="#9FB6CC"
                  keyboardType="decimal-pad"
                  value={answers.height}
                  onChangeText={(value) => setAnswers((prev) => ({ ...prev, height: value }))}
                  selectionColor={SURFACE.primary}
                />
              </View>

              <Pressable
                className="min-w-[110px] items-center justify-center rounded-[24px] border px-4"
                style={{
                  borderColor: SURFACE.border,
                  backgroundColor: SURFACE.selectionSoft,
                }}
                onPress={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    heightUnit: prev.heightUnit === "cm" ? "ft/in" : "cm",
                  }))
                }
              >
                <Text className="text-[22px] font-semibold" style={{ color: SURFACE.primaryDark }}>
                  {answers.heightUnit}
                </Text>
              </Pressable>
            </View>
            <View className="mt-4">
              <InfoCard>Your height plays a role in how much energy your body uses each day.</InfoCard>
            </View>
          </StepCard>
        );

      case "weight":
        return (
          <StepCard
            eyebrow="PROFILE"
            title="Your current weight"
            subtitle="We'll use this as part of your calorie estimate."
          >
            <View className="flex-row gap-3">
              <View
                className="flex-1 rounded-[28px] border px-5 py-4"
                style={{
                  borderColor: SURFACE.border,
                  backgroundColor: SURFACE.cardStrong,
                }}
              >
                <Text className="text-[15px] font-semibold" style={{ color: SURFACE.muted, letterSpacing: 1.8 }}>
                  WEIGHT
                </Text>
                <TextInput
                  className="mt-3 h-14 text-[25px] font-semibold"
                  style={{ color: SURFACE.primaryDark }}
                 
                  placeholderTextColor="#9FB6CC"
                  keyboardType="decimal-pad"
                  value={answers.weight}
                  onChangeText={(value) => setAnswers((prev) => ({ ...prev, weight: value }))}
                  selectionColor={SURFACE.primary}
                />
              </View>

              <Pressable
                className="min-w-[110px] items-center justify-center rounded-[24px] border px-4"
                style={{
                  borderColor: SURFACE.border,
                  backgroundColor: SURFACE.selectionSoft,
                }}
                onPress={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    weightUnit: prev.weightUnit === "kg" ? "lb" : "kg",
                  }))
                }
              >
                <Text className="text-[22px] font-semibold" style={{ color: SURFACE.primaryDark }}>
                  {answers.weightUnit}
                </Text>
              </Pressable>
            </View>

            <View className="mt-4">
              <InfoCard>
                This helps us calculate a calorie target for weight goals based on where you're
                starting from.
              </InfoCard>
            </View>
          </StepCard>
        );

      case "dob":
        return (
          <StepCard
            eyebrow="PROFILE"
            title="Your date of birth"
            subtitle="Use the format YYYY-MM-DD."
          >
            <View
              className="rounded-[28px] border px-5 py-4"
              style={{
                borderColor: SURFACE.border,
                backgroundColor: SURFACE.cardStrong,
              }}
            >
              <Text className="text-[15px] font-semibold" style={{ color: SURFACE.muted, letterSpacing: 1.8 }}>
                DATE OF BIRTH
              </Text>
              <TextInput
                className="mt-3 h-14 text-[25px] font-semibold"
                style={{ color: SURFACE.primaryDark }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9FB6CC"
                keyboardType="numbers-and-punctuation"
                value={answers.dateOfBirth}
                onChangeText={(value) =>
                  setAnswers((prev) => ({ ...prev, dateOfBirth: value.trim() }))
                }
                maxLength={10}
                selectionColor={SURFACE.primary}
              />
            </View>

            <View className="mt-4">
              {age !== null ? (
                <InfoCard title="Age detected">You are {age} years old.</InfoCard>
              ) : (
                <InfoCard title="Format example">
                  Enter your birth date as year-month-day, like 1998-04-21.
                </InfoCard>
              )}
            </View>
          </StepCard>
        );

      case "sex":
        return (
          <StepCard
            eyebrow="PROFILE"
            title="Your sex"
            subtitle="This helps make your starting calorie estimate more accurate."
          >
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

            <Pressable className="mt-3 items-center self-center rounded-full bg-white/70 px-4 py-3">
              <Text className="text-[16px] font-medium" style={{ color: "#4E7CAB" }}>
                Info for gender-diverse individuals
              </Text>
            </Pressable>
          </StepCard>
        );

      case "activity":
        return (
          <StepCard
            eyebrow="LIFESTYLE"
            title="Your activity level"
            subtitle="Choose the option that best matches an average day."
          >
            <InfoCard title="Tip">
              If you're unsure, choose the lower option to avoid overestimating calorie needs.
            </InfoCard>

            <View className="mt-5">
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
          </StepCard>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE.background }}>
      <View
        pointerEvents="none"
        className="absolute"
        style={{
          top: -110,
          right: -40,
          height: 300,
          width: 300,
          borderRadius: 150,
          backgroundColor: "rgba(151, 211, 255, 0.72)",
        }}
      />
      <View
        pointerEvents="none"
        className="absolute"
        style={{
          top: 180,
          left: -120,
          height: 320,
          width: 320,
          borderRadius: 160,
          backgroundColor: "rgba(255, 255, 255, 0.92)",
        }}
      />
      <View
        pointerEvents="none"
        className="absolute"
        style={{
          right: -90,
          bottom: 90,
          height: 280,
          width: 280,
          borderRadius: 140,
          backgroundColor: "rgba(119, 190, 255, 0.4)",
        }}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="px-5 pb-3 pt-2">
          <View className="flex-row items-center gap-3">
            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
              onPress={goBack}
            >
              <Text className="text-[26px] font-semibold" style={{ color: "#45729E" }}>
                {"<"}
              </Text>
            </Pressable>

            <View className="flex-1 flex-row items-center gap-1.5">
              {Array.from({ length: PROGRESS_SEGMENTS }, (_, index) => {
                const isActive = index < activeSegments;
                return (
                  <View
                    key={index}
                    className="h-2 flex-1 rounded-full"
                    style={{
                      backgroundColor: isActive ? "#4AA8FF" : SURFACE.progressInactive,
                    }}
                  />
                );
              })}
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{
            paddingBottom: 40,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        <View
          className="border-t px-6 pb-6 pt-4"
          style={{
            borderTopColor: "rgba(121, 170, 214, 0.22)",
            backgroundColor: SURFACE.footer,
          }}
        >
          <Pressable
            className="h-16 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: isCurrentStepValid ? SURFACE.primary : "#C7DCEE",
            }}
            disabled={!isCurrentStepValid}
            onPress={goNext}
          >
            <Text
              className="text-[28px] font-bold"
              style={{
                color: isCurrentStepValid ? "#FFFFFF" : "#6B88A5",
              }}
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
