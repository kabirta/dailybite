import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBottomNav } from "../components/AppBottomNav";
import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";

// ─── Data (unchanged) ────────────────────────────────────────────────────────

const FEATURES = [
  "Personalized AI coach",
  "1-on-1 nutritionist chat",
  "Advanced reports",
];

const PLANS = [{ amount: "Rs 299", period: "/month" }];

// ─── Feature metadata ─────────────────────────────────────────────────────────

const FEATURE_META: Record<
  string,
  {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    color: string;
    bg: string;
    desc: string;
  }
> = {
  "Personalized AI coach": {
    icon: "hardware-chip-outline",
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.12)",
    desc: "Get real-time guidance tailored to your body and goals",
  },
  "1-on-1 nutritionist chat": {
    icon: "chatbubbles-outline",
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.12)",
    desc: "Chat directly with a certified nutritionist anytime",
  },
  "Advanced reports": {
    icon: "bar-chart-outline",
    color: "#4ADE80",
    bg: "rgba(74,222,128,0.12)",
    desc: "Deep insights into macros, trends, and weekly progress",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureRow({ label }: { label: string }) {
  const meta = FEATURE_META[label];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SCREEN_COLORS.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: SCREEN_COLORS.border,
        gap: 14,
      }}
    >
      {/* Icon badge */}
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: meta.bg,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Ionicons name={meta.icon} size={22} color={meta.color} />
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: SCREEN_COLORS.text, fontSize: 14, fontWeight: "700" }}>
          {label}
        </Text>
        <Text
          style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginTop: 2, lineHeight: 17 }}
        >
          {meta.desc}
        </Text>
      </View>

      <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PremiumScreen() {
  const [selected, setSelected] = useState(0);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }}
      edges={["top"]}
    >
      <ScreenBackground>
        <Header />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
        >
          {/* ── Hero ── */}
          <View style={{ alignItems: "center", paddingTop: 28, paddingBottom: 24 }}>
            {/* Crown glow ring */}
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: "rgba(234,179,8,0.10)",
                borderWidth: 1.5,
                borderColor: "rgba(234,179,8,0.28)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 42 }}>👑</Text>
            </View>

            {/* Premium badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "rgba(234,179,8,0.12)",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderWidth: 1,
                borderColor: "rgba(234,179,8,0.30)",
                marginBottom: 14,
              }}
            >
              <Ionicons name="star" size={12} color="#EAB308" />
              <Text
                style={{ color: "#EAB308", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 }}
              >
                HEALTHBANGLA PREMIUM
              </Text>
            </View>

            <Text
              style={{
                color: SCREEN_COLORS.text,
                fontSize: 28,
                fontWeight: "800",
                textAlign: "center",
                lineHeight: 34,
                marginBottom: 8,
              }}
            >
              Upgrade to{"\n"}Premium
            </Text>
            <Text
              style={{
                color: SCREEN_COLORS.textMuted,
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
                maxWidth: 280,
              }}
            >
              Unlock the full power of your health journey with expert tools and AI coaching.
            </Text>
          </View>

          {/* ── Features ── */}
          <View style={{ marginBottom: 24 }}>
            {FEATURES.map((f) => (
              <FeatureRow key={f} label={f} />
            ))}
          </View>

          {/* ── Pricing card ── */}
          {PLANS.map((plan, index) => (
            <TouchableOpacity
              key={plan.amount}
              activeOpacity={0.85}
              onPress={() => setSelected(index)}
              style={{
                backgroundColor: SCREEN_COLORS.card,
                borderRadius: 18,
                borderWidth: 2,
                borderColor: selected === index ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                padding: 18,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Left */}
              <View style={{ gap: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text
                    style={{ color: SCREEN_COLORS.text, fontSize: 26, fontWeight: "800" }}
                  >
                    {plan.amount}
                  </Text>
                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 15, fontWeight: "500" }}>
                    {plan.period}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "rgba(234,179,8,0.12)",
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{ color: "#EAB308", fontSize: 11, fontWeight: "700" }}
                  >
                    Most Popular
                  </Text>
                </View>
              </View>

              {/* Radio */}
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: selected === index ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selected === index && (
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: SCREEN_COLORS.primary,
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* ── What's included strip ── */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              backgroundColor: SCREEN_COLORS.card,
              borderRadius: 14,
              paddingVertical: 14,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: SCREEN_COLORS.border,
            }}
          >
            {[
              { emoji: "🚫", label: "No ads" },
              { emoji: "🔒", label: "Secure" },
              { emoji: "↩️", label: "Cancel anytime" },
            ].map((item) => (
              <View key={item.label} style={{ alignItems: "center", gap: 5 }}>
                <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 11, fontWeight: "600" }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Subscribe CTA ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              height: 56,
              borderRadius: 16,
              backgroundColor: SCREEN_COLORS.primary,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Ionicons name="star" size={18} color="#ffffff" />
            <Text
              style={{ color: "#ffffff", fontSize: 17, fontWeight: "800" }}
            >
              Subscribe Now
            </Text>
          </TouchableOpacity>

          {/* ── Restore + Terms ── */}
          <TouchableOpacity style={{ alignItems: "center", marginBottom: 6 }}>
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 13 }}>
              Restore Purchase
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              color: SCREEN_COLORS.textMuted,
              fontSize: 11,
              textAlign: "center",
              lineHeight: 16,
            }}
          >
            By subscribing you agree to our{" "}
            <Text style={{ color: SCREEN_COLORS.primary }}>Terms of Service</Text> and{" "}
            <Text style={{ color: SCREEN_COLORS.primary }}>Privacy Policy</Text>.{"\n"}
            Subscription auto-renews unless cancelled.
          </Text>
        </ScrollView>

        <AppBottomNav />
      </ScreenBackground>
    </SafeAreaView>
  );
}
