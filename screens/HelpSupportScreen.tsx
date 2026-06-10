import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  SCREEN_COLORS,
  ScreenBackground,
} from "../components/ScreenBackground";

const SUPPORT_EMAIL = "support@nutrimedai.app";

const QUICK_HELP = [
  {
    icon: "restaurant-outline",
    title: "Meal logging",
    text: "Add meals, review calories, and keep your diary updated through the day.",
    tint: "#127dff",
  },
  {
    icon: "bar-chart-outline",
    title: "Reports",
    text: "Track trends for calories, water, activity, and weekly progress.",
    tint: "#22C55E",
  },
  {
    icon: "sparkles-outline",
    title: "AI guidance",
    text: "Ask the assistant for nutrition tips, meal ideas, and wellness guidance.",
    tint: "#A78BFA",
  },
] as const;

const FAQS = [
  {
    question: "How do I update my profile details?",
    answer:
      "Open Profile, review your body snapshot, and update connected onboarding or saved profile fields as they become available.",
  },
  {
    question: "Why are my calories or targets different?",
    answer:
      "Daily targets are estimates based on your profile, goals, and activity. Keep your meal diary and profile information current for better guidance.",
  },
  {
    question: "Can I use NutriMed AI by CMC for medical advice?",
    answer:
      "NutriMed AI by CMC can support healthy habits, but it does not replace a doctor, dietitian, or emergency care.",
  },
] as const;

function TopBar() {
  const router = useRouter();

  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.iconButton,
          pressed ? styles.iconButtonPressed : null,
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={SCREEN_COLORS.primaryDark}
        />
      </Pressable>
      <Text style={styles.topBarTitle}>Help and Support</Text>
      <View style={styles.iconButtonGhost} />
    </View>
  );
}

function HelpCard({
  icon,
  title,
  text,
  tint,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  text: string;
  tint: string;
}) {
  return (
    <View style={styles.helpCard}>
      <View style={[styles.helpIconWrap, { backgroundColor: `${tint}18` }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <View style={styles.helpCopy}>
        <Text style={styles.helpTitle}>{title}</Text>
        <Text style={styles.helpText}>{text}</Text>
      </View>
    </View>
  );
}

function FaqRow({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <View style={styles.faqRow}>
      <View style={styles.faqQuestionRow}>
        <Ionicons name="help-circle-outline" size={18} color="#127dff" />
        <Text style={styles.faqQuestion}>{question}</Text>
      </View>
      <Text style={styles.faqAnswer}>{answer}</Text>
    </View>
  );
}

export default function HelpSupportScreen() {
  const router = useRouter();

  const openSupportEmail = () => {
    void Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=NutriMed%20AI%20by%20CMC%20support%20request`,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScreenBackground>
        <TopBar />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="headset-outline"
                size={30}
                color={SCREEN_COLORS.primary}
              />
            </View>
            <Text style={styles.heroTitle}>How can we help?</Text>
            <Text style={styles.heroText}>
              Find answers for your diary, goals, reports, AI chat, and account.
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryAction}
              onPress={() => router.push("/chat")}
            >
              <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Ask AI Assistant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.secondaryAction}
              onPress={openSupportEmail}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={SCREEN_COLORS.primary}
              />
              <Text style={styles.secondaryActionText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Popular Topics</Text>
          <View style={styles.stack}>
            {QUICK_HELP.map((item) => (
              <HelpCard key={item.title} {...item} />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Quick Fixes</Text>
          <View style={styles.fixCard}>
            <View style={styles.fixRow}>
              <Ionicons name="refresh-outline" size={18} color="#22C55E" />
              <Text style={styles.fixText}>
                Pull down or reopen a screen if new logs do not appear.
              </Text>
            </View>
            <View style={styles.fixRow}>
              <Ionicons name="wifi-outline" size={18} color="#38BDF8" />
              <Text style={styles.fixText}>
                Check your internet connection before using AI chat or sign-in.
              </Text>
            </View>
            <View style={styles.fixRow}>
              <Ionicons name="person-circle-outline" size={18} color="#A78BFA" />
              <Text style={styles.fixText}>
                Sign out and sign in again if account information looks stale.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>FAQs</Text>
          <View style={styles.faqCard}>
            {FAQS.map((faq) => (
              <FaqRow key={faq.question} {...faq} />
            ))}
          </View>

          <View style={styles.footerCard}>
            <Text style={styles.footerTitle}>Need more help?</Text>
            <Text style={styles.footerText}>
              Email {SUPPORT_EMAIL}. Include your device, sign-in method, and
              what you were trying to do.
            </Text>
          </View>
        </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_COLORS.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    height: 42,
    width: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: SCREEN_COLORS.iconBg,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
  },
  iconButtonPressed: {
    opacity: 0.82,
  },
  iconButtonGhost: {
    height: 42,
    width: 42,
  },
  topBarTitle: {
    color: SCREEN_COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  heroCard: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
    backgroundColor: SCREEN_COLORS.card,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 14,
  },
  heroIcon: {
    height: 64,
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    backgroundColor: "rgba(18,125,255,0.12)",
    marginBottom: 14,
  },
  heroTitle: {
    color: SCREEN_COLORS.text,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  heroText: {
    color: SCREEN_COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 300,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  primaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: SCREEN_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  secondaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: SCREEN_COLORS.card,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
  },
  secondaryActionText: {
    color: SCREEN_COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  sectionTitle: {
    color: SCREEN_COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
  },
  stack: {
    gap: 10,
    marginBottom: 22,
  },
  helpCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
    backgroundColor: SCREEN_COLORS.card,
    padding: 14,
  },
  helpIconWrap: {
    height: 42,
    width: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  helpCopy: {
    flex: 1,
  },
  helpTitle: {
    color: SCREEN_COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  helpText: {
    color: SCREEN_COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  fixCard: {
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
    backgroundColor: SCREEN_COLORS.card,
    padding: 14,
    marginBottom: 22,
  },
  fixRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  fixText: {
    flex: 1,
    color: SCREEN_COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  faqCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
    backgroundColor: SCREEN_COLORS.card,
    overflow: "hidden",
    marginBottom: 18,
  },
  faqRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: SCREEN_COLORS.border,
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  faqQuestion: {
    flex: 1,
    color: SCREEN_COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  faqAnswer: {
    color: SCREEN_COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  footerCard: {
    borderRadius: 18,
    backgroundColor: SCREEN_COLORS.cardSoft,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
    padding: 16,
  },
  footerTitle: {
    color: SCREEN_COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  footerText: {
    color: SCREEN_COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
});
