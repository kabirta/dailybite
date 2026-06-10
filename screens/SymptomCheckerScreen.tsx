import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";
import { analyzeSymptoms } from "../src/services/backendApi";

export default function SymptomCheckerScreen() {
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("5");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    const items = symptoms.split(",").map((item) => item.trim()).filter(Boolean);
    if (!items.length) {
      Alert.alert("Symptoms", "Enter at least one symptom.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await analyzeSymptoms({
        symptoms: items,
        duration,
        severity: Number(severity),
        existingConditions: [],
        medications: [],
        allergies: [],
      });
      setResult(data);
    } catch (error) {
      Alert.alert("Symptom analysis failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }} edges={["top"]}>
      <ScreenBackground>
        <Header />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <Text style={{ color: SCREEN_COLORS.text, fontSize: 26, fontWeight: "800" }}>Symptom Analyzer</Text>
          <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 6, lineHeight: 20 }}>
            This assistant is not a replacement for professional medical advice.
          </Text>

          <View style={{ gap: 10, marginTop: 18 }}>
            <TextInput
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Symptoms, comma separated"
              placeholderTextColor={SCREEN_COLORS.textMuted}
              multiline
              style={{
                minHeight: 96,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: SCREEN_COLORS.border,
                backgroundColor: SCREEN_COLORS.card,
                padding: 12,
                color: SCREEN_COLORS.text,
              }}
            />
            <TextInput
              value={duration}
              onChangeText={setDuration}
              placeholder="Duration, e.g. 2 days"
              placeholderTextColor={SCREEN_COLORS.textMuted}
              style={{
                minHeight: 46,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: SCREEN_COLORS.border,
                backgroundColor: SCREEN_COLORS.card,
                paddingHorizontal: 12,
                color: SCREEN_COLORS.text,
              }}
            />
            <TextInput
              value={severity}
              onChangeText={setSeverity}
              placeholder="Severity 1-10"
              keyboardType="numeric"
              placeholderTextColor={SCREEN_COLORS.textMuted}
              style={{
                minHeight: 46,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: SCREEN_COLORS.border,
                backgroundColor: SCREEN_COLORS.card,
                paddingHorizontal: 12,
                color: SCREEN_COLORS.text,
              }}
            />
            <TouchableOpacity
              onPress={() => void submit()}
              disabled={isLoading}
              style={{
                height: 50,
                borderRadius: 14,
                backgroundColor: SCREEN_COLORS.primary,
                alignItems: "center",
                justifyContent: "center",
                opacity: isLoading ? 0.65 : 1,
              }}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "800" }}>Analyze</Text>}
            </TouchableOpacity>
          </View>

          {result ? (
            <View
              style={{
                marginTop: 18,
                backgroundColor: result.urgency === "emergency" ? "#FFF7ED" : SCREEN_COLORS.card,
                borderColor: result.urgency === "emergency" ? "#F97316" : SCREEN_COLORS.border,
                borderWidth: 1,
                borderRadius: 16,
                padding: 14,
                gap: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="pulse-outline" size={20} color={SCREEN_COLORS.primary} />
                <Text style={{ color: SCREEN_COLORS.text, fontWeight: "800" }}>Urgency: {result.urgency}</Text>
              </View>
              <Text style={{ color: SCREEN_COLORS.text, lineHeight: 20 }}>{result.summary}</Text>
              {(result.recommendedActions ?? []).map((item: string) => (
                <Text key={item} style={{ color: SCREEN_COLORS.textMuted, lineHeight: 19 }}>- {item}</Text>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}
