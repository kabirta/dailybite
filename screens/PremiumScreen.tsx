import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBottomNav } from "../components/AppBottomNav";

const FEATURES = [
  "Personalized AI coach",
  "1-on-1 nutritionist chat",
  "Advanced reports",
];

const PLANS = [
  { amount: "Rs 299", period: "/month" },
  
];

export default function PremiumScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }} edges={["top"]}>
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 16,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: "100%",
              maxWidth: 420,
              borderRadius: 36,
              backgroundColor: "#EFF1F3",
              paddingHorizontal: 18,
              paddingVertical: 22,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#1F2937",
                fontSize: 32,
                fontWeight: "700",
                marginBottom: 20,
              }}
            >
              Upgrade to Premium
            </Text>

            <View style={{ marginBottom: 20 }}>
              {FEATURES.map((feature) => (
                <View
                  key={feature}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 13,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={26}
                    color="#25B367"
                  />
                  <Text
                    style={{
                      marginLeft: 12,
                      color: "#1F2937",
                      fontSize: 26,
                      fontWeight: "500",
                      flexShrink: 1,
                    }}
                  >
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={{
                backgroundColor: "#E6E8EB",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 18,
              }}
            >
              {PLANS.map((plan, index) => (
                <View key={plan.amount} style={{ marginBottom: index === PLANS.length - 1 ? 0 : 24 }}>
                  <Text
                    style={{
                      color: "#111827",
                      fontSize: 48,
                      fontWeight: "700",
                    }}
                  >
                    {plan.amount}
                    <Text
                      style={{
                        fontSize: 30,
                        fontWeight: "500",
                        color: "#111827",
                      }}
                    >
                      {plan.period}
                    </Text>
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                marginTop: 24,
                height: 56,
                borderRadius: 14,
                backgroundColor: "#F1A143",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#FFF7EB", fontSize: 33, fontWeight: "700" }}>
                Subscribe
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <AppBottomNav />
      </View>
    </SafeAreaView>
  );
}
