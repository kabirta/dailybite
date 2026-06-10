import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { AppBottomNav } from "../components/AppBottomNav";
import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";
import {
  bookAppointment,
  getAvailability,
  getDoctorSpecialties,
  getDoctors,
} from "../src/services/doctorApi";

type ConsultationMode = "video" | "clinic";

type Doctor = {
  _id: string;
  name: string;
  specialty: string;
  qualifications?: string;
  experienceYears?: number;
  consultationFee?: number;
  rating?: number;
  modes: ConsultationMode[];
  profileImage?: string;
  clinicAddress?: string;
  bio?: string;
};

type AvailabilitySlot = {
  _id: string;
  date: string;
  slotTime: string;
  mode: ConsultationMode;
  status: "available" | "booked" | "blocked";
};

type Appointment = {
  _id: string;
  doctor?: Doctor;
  date: string;
  slotTime: string;
  mode: ConsultationMode;
  status: string;
};

const todayIso = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const addDaysIso = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateLabel = (iso: string) => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

export default function DoctorAppointmentScreen() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedMode, setSelectedMode] = useState<ConsultationMode>("video");
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<Appointment | null>(null);

  const dateOptions = useMemo(() => Array.from({ length: 7 }, (_, index) => addDaysIso(index)), []);
  const filteredDoctors = doctors;
  const selectedDoctor = filteredDoctors.find((doctor) => doctor._id === selectedDoctorId) ?? filteredDoctors[0];
  const selectedSlot = slots.find((slot) => slot._id === selectedAvailabilityId);

  const loadDoctors = useCallback(
    async ({ refreshing = false } = {}) => {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError("");

      try {
        const [doctorPayload, specialtyPayload] = await Promise.all([
          getDoctors({ specialty: selectedSpecialty, mode: selectedMode, limit: 50 }),
          getDoctorSpecialties(),
        ]);
        const nextDoctors: Doctor[] = Array.isArray(doctorPayload?.doctors) ? doctorPayload.doctors : [];
        const nextSpecialties: string[] = Array.isArray(specialtyPayload) ? specialtyPayload : [];

        setDoctors(nextDoctors);
        setSpecialties(nextSpecialties);

        if (!selectedSpecialty && nextSpecialties.length) {
          setSelectedSpecialty(nextSpecialties[0]);
        }

        if (!nextDoctors.some((doctor) => doctor._id === selectedDoctorId)) {
          setSelectedDoctorId(nextDoctors[0]?._id ?? "");
        }
      } catch (loadError) {
        console.warn("[DoctorAppointment] Failed to load doctors", loadError);
        setError(loadError instanceof Error ? loadError.message : "Could not load doctors.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedDoctorId, selectedMode, selectedSpecialty]
  );

  const loadSlots = useCallback(async () => {
    if (!selectedDoctorId) {
      setSlots([]);
      setSelectedAvailabilityId("");
      return;
    }

    setIsLoadingSlots(true);
    try {
      const data = await getAvailability({
        doctorId: selectedDoctorId,
        date: selectedDate,
        mode: selectedMode,
      });
      const nextSlots: AvailabilitySlot[] = Array.isArray(data) ? data : [];
      setSlots(nextSlots);
      setSelectedAvailabilityId(nextSlots[0]?._id ?? "");
    } catch (slotError) {
      console.warn("[DoctorAppointment] Failed to load slots", slotError);
      setSlots([]);
      setSelectedAvailabilityId("");
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDate, selectedDoctorId, selectedMode]);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const selectSpecialty = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setSelectedDoctorId("");
    setSelectedAvailabilityId("");
  };

  const selectMode = (mode: ConsultationMode) => {
    setSelectedMode(mode);
    setSelectedAvailabilityId("");
  };

  const submitBooking = async () => {
    if (!selectedDoctor || !selectedSlot || isBooking) return;

    setIsBooking(true);
    try {
      const appointment = await bookAppointment({
        doctorId: selectedDoctor._id,
        availabilityId: selectedSlot._id,
        mode: selectedMode,
        reason,
      });
      setSuccess(appointment);
      setReason("");
      await loadSlots();
    } catch (bookingError) {
      console.warn("[DoctorAppointment] Booking failed", bookingError);
      Alert.alert("Booking failed", bookingError instanceof Error ? bookingError.message : "Please try another slot.");
      await loadSlots();
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }} edges={["top"]}>
      <ScreenBackground>
        <Header />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadDoctors({ refreshing: true })} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 118 }}
        >
          <View style={{ paddingTop: 16, paddingBottom: 18 }}>
            <Text style={{ color: SCREEN_COLORS.primary, fontSize: 12, fontWeight: "800", marginBottom: 8 }}>
              DOCTOR APPOINTMENT
            </Text>
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 28, fontWeight: "800", lineHeight: 34 }}>
              Book a consultation
            </Text>
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 14, lineHeight: 20, marginTop: 8 }}>
              Choose a specialist, doctor, appointment type, and an available backend slot.
            </Text>
          </View>

          {isLoading ? (
            <View style={{ paddingVertical: 70, alignItems: "center" }}>
              <ActivityIndicator color={SCREEN_COLORS.primary} />
              <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 12 }}>Loading doctors...</Text>
            </View>
          ) : error ? (
            <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 16, padding: 18, gap: 12 }}>
              <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "800" }}>{error}</Text>
              <TouchableOpacity onPress={() => void loadDoctors()} style={{ height: 44, borderRadius: 12, backgroundColor: SCREEN_COLORS.primary, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "800" }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {success ? (
                <View style={{ backgroundColor: "#ECFDF5", borderColor: "#BBF7D0", borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 }}>
                  <Text style={{ color: "#065F46", fontSize: 16, fontWeight: "900" }}>Appointment booked</Text>
                  <Text style={{ color: "#047857", marginTop: 5, lineHeight: 19 }}>
                    {success.doctor?.name ?? selectedDoctor?.name} · {formatDateLabel(success.date)} · {success.slotTime} · {success.mode}
                  </Text>
                  <Text style={{ color: "#047857", marginTop: 4, fontSize: 12 }}>ID: {success._id}</Text>
                </View>
              ) : null}

              <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                {(["video", "clinic"] as const).map((mode) => {
                  const isActive = mode === selectedMode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      activeOpacity={0.82}
                      onPress={() => selectMode(mode)}
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
                      <Text style={{ color: isActive ? "#ffffff" : SCREEN_COLORS.text, fontSize: 14, fontWeight: "700", textTransform: "capitalize" }}>
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
                {specialties.map((specialty) => {
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
                      <Text style={{ color: isActive ? "#ffffff" : SCREEN_COLORS.text, fontSize: 13, fontWeight: "700" }}>
                        {specialty}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={{ marginTop: 16, gap: 12 }}>
                {filteredDoctors.length ? (
                  filteredDoctors.map((doctor) => {
                    const isSelected = doctor._id === selectedDoctor?._id;
                    return (
                      <TouchableOpacity
                        key={doctor._id}
                        activeOpacity={0.84}
                        onPress={() => setSelectedDoctorId(doctor._id)}
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
                        <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: SCREEN_COLORS.iconBg, alignItems: "center", justifyContent: "center" }}>
                          <Ionicons name="person" size={28} color={SCREEN_COLORS.primary} />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "800" }}>{doctor.name}</Text>
                          <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 13, marginTop: 3 }}>
                            {doctor.specialty} · {doctor.qualifications || "Specialist"}
                          </Text>
                          <View style={{ flexDirection: "row", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12 }}>Star {Number(doctor.rating || 0).toFixed(1)}</Text>
                            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12 }}>{doctor.experienceYears ?? 0} yrs</Text>
                            <Text style={{ color: SCREEN_COLORS.primary, fontSize: 12, fontWeight: "800" }}>Rs {doctor.consultationFee ?? 0}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 16, padding: 18 }}>
                    <Text style={{ color: SCREEN_COLORS.text, fontWeight: "800" }}>No doctors available</Text>
                    <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 6 }}>Ask admin to add active doctors and availability.</Text>
                  </View>
                )}
              </View>

              <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: SCREEN_COLORS.border, padding: 16, marginTop: 16 }}>
                <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "800" }}>Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginTop: 12 }}>
                  {dateOptions.map((date) => {
                    const isActive = date === selectedDate;
                    return (
                      <TouchableOpacity
                        key={date}
                        onPress={() => setSelectedDate(date)}
                        style={{
                          minWidth: 92,
                          borderRadius: 14,
                          paddingVertical: 12,
                          paddingHorizontal: 12,
                          alignItems: "center",
                          backgroundColor: isActive ? SCREEN_COLORS.primary : SCREEN_COLORS.cardSoft,
                        }}
                      >
                        <Text style={{ color: isActive ? "#fff" : SCREEN_COLORS.text, fontSize: 13, fontWeight: "800" }}>{formatDateLabel(date)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: SCREEN_COLORS.border, padding: 16, marginTop: 16 }}>
                <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "800" }}>Available Slots</Text>
                {isLoadingSlots ? (
                  <ActivityIndicator style={{ marginTop: 18 }} color={SCREEN_COLORS.primary} />
                ) : slots.length ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                    {slots.map((slot) => {
                      const isActive = slot._id === selectedAvailabilityId;
                      return (
                        <TouchableOpacity
                          key={slot._id}
                          activeOpacity={0.82}
                          onPress={() => setSelectedAvailabilityId(slot._id)}
                          style={{
                            minWidth: "47%",
                            borderRadius: 14,
                            paddingVertical: 12,
                            alignItems: "center",
                            backgroundColor: isActive ? SCREEN_COLORS.primary : SCREEN_COLORS.cardSoft,
                          }}
                        >
                          <Text style={{ color: isActive ? "#ffffff" : SCREEN_COLORS.text, fontSize: 13, fontWeight: "700" }}>{slot.slotTime}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 12 }}>No available slots for this doctor, date, and mode.</Text>
                )}
              </View>

              <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: SCREEN_COLORS.border, padding: 16, marginTop: 16 }}>
                <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "800" }}>Reason for visit</Text>
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
                disabled={!selectedDoctor || !selectedSlot || isBooking}
                onPress={() => void submitBooking()}
                style={{
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: SCREEN_COLORS.primary,
                  opacity: !selectedDoctor || !selectedSlot || isBooking ? 0.55 : 1,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                  marginTop: 18,
                }}
              >
                {isBooking ? <ActivityIndicator color="#ffffff" /> : <Ionicons name="calendar" size={18} color="#ffffff" />}
                <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "800" }}>Book Appointment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.86}
                onPress={() => router.push("/my-appointments")}
                style={{
                  height: 48,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: SCREEN_COLORS.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
                <Text style={{ color: SCREEN_COLORS.primary, fontSize: 15, fontWeight: "800" }}>My Appointments</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        <AppBottomNav />
      </ScreenBackground>
    </SafeAreaView>
  );
}
