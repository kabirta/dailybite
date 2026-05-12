import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBottomNav } from "../components/AppBottomNav";
import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  nextAvailable: string;
  rating: string;
  experience: string;
  fee: string;
};

const SPECIALTIES = ["General", "Nutrition", "Diabetes", "Cardiology"] as const;

const DOCTORS: Doctor[] = [
  {
    id: "dr-meera",
    name: "Dr. Meera Shah",
    specialty: "General",
    nextAvailable: "Today",
    rating: "4.9",
    experience: "12 yrs",
    fee: "Rs 499",
  },
  {
    id: "dr-arjun",
    name: "Dr. Arjun Rao",
    specialty: "Nutrition",
    nextAvailable: "Tomorrow",
    rating: "4.8",
    experience: "9 yrs",
    fee: "Rs 399",
  },
  {
    id: "dr-nisha",
    name: "Dr. Nisha Menon",
    specialty: "Diabetes",
    nextAvailable: "Fri",
    rating: "4.9",
    experience: "15 yrs",
    fee: "Rs 599",
  },
  {
    id: "dr-kabir",
    name: "Dr. Kabir Sethi",
    specialty: "Cardiology",
    nextAvailable: "Sat",
    rating: "4.7",
    experience: "11 yrs",
    fee: "Rs 699",
  },
];

const TIME_SLOTS = ["09:30 AM", "11:00 AM", "02:30 PM", "05:00 PM"];

export default function DoctorAppointmentScreen() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<(typeof SPECIALTIES)[number]>("General");
  const [selectedDoctorId, setSelectedDoctorId] = useState(DOCTORS[0].id);
  const [selectedMode, setSelectedMode] = useState<"Video" | "Clinic">("Video");
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [reason, setReason] = useState("");

  const filteredDoctors = useMemo(
    () => DOCTORS.filter((doctor) => doctor.specialty === selectedSpecialty),
    [selectedSpecialty]
  );

  const selectedDoctor =
    filteredDoctors.find((doctor) => doctor.id === selectedDoctorId) ?? filteredDoctors[0];

  const selectSpecialty = (specialty: (typeof SPECIALTIES)[number]) => {
    const nextDoctor = DOCTORS.find((doctor) => doctor.specialty === specialty);
    setSelectedSpecialty(specialty);
    if (nextDoctor) {
      setSelectedDoctorId(nextDoctor.id);
    }
  };

  const bookAppointment = () => {
    Alert.alert(
      "Appointment Ready",
      `${selectedDoctor.name} is selected for ${selectedMode} consultation at ${selectedSlot}.`
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }} edges={["top"]}>
      <ScreenBackground>
        <Header />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 118 }}
        >
          <View style={{ paddingTop: 16, paddingBottom: 18 }}>
            <Text
              style={{
                color: SCREEN_COLORS.primary,
                fontSize: 12,
                fontWeight: "800",
                letterSpacing: 0.8,
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              Doctor Appointment
            </Text>
            <Text
              style={{
                color: SCREEN_COLORS.text,
                fontSize: 28,
                fontWeight: "800",
                lineHeight: 34,
              }}
            >
              Book a consultation
            </Text>
            <Text
              style={{
                color: SCREEN_COLORS.textMuted,
                fontSize: 14,
                lineHeight: 20,
                marginTop: 8,
              }}
            >
              Choose a specialist, appointment type, and time slot for quick health support.
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            {(["Video", "Clinic"] as const).map((mode) => {
              const isActive = mode === selectedMode;
              return (
                <TouchableOpacity
                  key={mode}
                  activeOpacity={0.82}
                  onPress={() => setSelectedMode(mode)}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isActive ? SCREEN_COLORS.primary : SCREEN_COLORS.card,
                    borderWidth: 1,
                    borderColor: isActive ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? "#ffffff" : SCREEN_COLORS.text,
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    {mode}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
          >
            {SPECIALTIES.map((specialty) => {
              const isActive = specialty === selectedSpecialty;
              return (
                <TouchableOpacity
                  key={specialty}
                  activeOpacity={0.82}
                  onPress={() => selectSpecialty(specialty)}
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: isActive ? SCREEN_COLORS.primary : SCREEN_COLORS.card,
                    borderWidth: 1,
                    borderColor: isActive ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? "#ffffff" : SCREEN_COLORS.text,
                      fontSize: 13,
                      fontWeight: "700",
                    }}
                  >
                    {specialty}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={{ marginTop: 16, gap: 12 }}>
            {filteredDoctors.map((doctor) => {
              const isSelected = doctor.id === selectedDoctor.id;
              return (
                <TouchableOpacity
                  key={doctor.id}
                  activeOpacity={0.84}
                  onPress={() => setSelectedDoctorId(doctor.id)}
                  style={{
                    backgroundColor: SCREEN_COLORS.card,
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: isSelected ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                    padding: 16,
                    flexDirection: "row",
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      backgroundColor: SCREEN_COLORS.iconBg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="person" size={28} color={SCREEN_COLORS.primary} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "800" }}>
                      {doctor.name}
                    </Text>
                    <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 13, marginTop: 3 }}>
                      {doctor.specialty} specialist
                    </Text>
                    <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                      <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12 }}>
                        Star {doctor.rating}
                      </Text>
                      <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12 }}>
                        {doctor.experience}
                      </Text>
                      <Text style={{ color: SCREEN_COLORS.primary, fontSize: 12, fontWeight: "800" }}>
                        {doctor.fee}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: SCREEN_COLORS.primary, fontSize: 12, fontWeight: "800" }}>
                    {doctor.nextAvailable}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View
            style={{
              backgroundColor: SCREEN_COLORS.card,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: SCREEN_COLORS.border,
              padding: 16,
              marginTop: 16,
            }}
          >
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "800" }}>
              Select Time
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
              {TIME_SLOTS.map((slot) => {
                const isActive = slot === selectedSlot;
                return (
                  <TouchableOpacity
                    key={slot}
                    activeOpacity={0.82}
                    onPress={() => setSelectedSlot(slot)}
                    style={{
                      minWidth: "47%",
                      borderRadius: 14,
                      paddingVertical: 12,
                      alignItems: "center",
                      backgroundColor: isActive ? SCREEN_COLORS.primary : SCREEN_COLORS.cardSoft,
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? "#ffffff" : SCREEN_COLORS.text,
                        fontSize: 13,
                        fontWeight: "700",
                      }}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View
            style={{
              backgroundColor: SCREEN_COLORS.card,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: SCREEN_COLORS.border,
              padding: 16,
              marginTop: 16,
            }}
          >
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "800" }}>
              Reason for visit
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Symptoms, follow-up, nutrition advice..."
              placeholderTextColor={SCREEN_COLORS.textMuted}
              multiline
              style={{
                minHeight: 88,
                color: SCREEN_COLORS.text,
                fontSize: 14,
                lineHeight: 20,
                textAlignVertical: "top",
                marginTop: 12,
                borderRadius: 14,
                backgroundColor: SCREEN_COLORS.cardSoft,
                padding: 12,
              }}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            onPress={bookAppointment}
            style={{
              height: 56,
              borderRadius: 16,
              backgroundColor: SCREEN_COLORS.primary,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              marginTop: 18,
            }}
          >
            <Ionicons name="calendar" size={18} color="#ffffff" />
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "800" }}>
              Book Appointment
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <AppBottomNav />
      </ScreenBackground>
    </SafeAreaView>
  );
}
