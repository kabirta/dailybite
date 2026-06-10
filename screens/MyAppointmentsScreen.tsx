import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Header } from "../components/Header";
import { ScreenBackground, SCREEN_COLORS } from "../components/ScreenBackground";
import { cancelAppointment, getMyAppointments } from "../src/services/doctorApi";

type AppointmentStatus = "upcoming" | "completed" | "cancelled";

type Appointment = {
  _id: string;
  doctor?: {
    name?: string;
    specialty?: string;
    clinicAddress?: string;
  };
  date: string;
  slotTime: string;
  mode: "video" | "clinic";
  status: string;
  meetingLink?: string;
  adminNotes?: string;
};

const TABS: AppointmentStatus[] = ["upcoming", "completed", "cancelled"];

const formatDate = (iso: string) => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

export default function MyAppointmentsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AppointmentStatus>("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancellingId, setIsCancellingId] = useState("");
  const [error, setError] = useState("");

  const loadAppointments = useCallback(
    async ({ refreshing = false } = {}) => {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError("");

      try {
        const payload = await getMyAppointments({ status: activeTab, limit: 50 });
        setAppointments(Array.isArray(payload?.appointments) ? payload.appointments : []);
      } catch (loadError) {
        console.warn("[Appointments] Failed to load", loadError);
        setError(loadError instanceof Error ? loadError.message : "Could not load appointments.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const requestCancel = (appointment: Appointment) => {
    Alert.alert("Cancel appointment?", "This will release the slot for other users.", [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel appointment",
        style: "destructive",
        onPress: async () => {
          setIsCancellingId(appointment._id);
          try {
            await cancelAppointment(appointment._id);
            await loadAppointments();
          } catch (cancelError) {
            Alert.alert("Could not cancel", cancelError instanceof Error ? cancelError.message : "Please try again.");
          } finally {
            setIsCancellingId("");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_COLORS.background }} edges={["top"]}>
      <ScreenBackground>
        <Header />
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadAppointments({ refreshing: true })} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 38 }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <Ionicons name="chevron-back" size={20} color={SCREEN_COLORS.primary} />
            <Text style={{ color: SCREEN_COLORS.primary, fontWeight: "800" }}>Back</Text>
          </TouchableOpacity>

          <Text style={{ color: SCREEN_COLORS.text, fontSize: 28, fontWeight: "900" }}>My Appointments</Text>
          <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 8, lineHeight: 20 }}>
            Your booking history is loaded from your backend account.
          </Text>

          <View style={{ flexDirection: "row", gap: 8, marginVertical: 18 }}>
            {TABS.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    height: 42,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isActive ? SCREEN_COLORS.primary : SCREEN_COLORS.card,
                    borderWidth: 1,
                    borderColor: isActive ? SCREEN_COLORS.primary : SCREEN_COLORS.border,
                  }}
                >
                  <Text style={{ color: isActive ? "#fff" : SCREEN_COLORS.text, fontWeight: "800", textTransform: "capitalize" }}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isLoading ? (
            <View style={{ paddingVertical: 80, alignItems: "center" }}>
              <ActivityIndicator color={SCREEN_COLORS.primary} />
            </View>
          ) : error ? (
            <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 16, padding: 16 }}>
              <Text style={{ color: SCREEN_COLORS.text, fontWeight: "800" }}>{error}</Text>
            </View>
          ) : appointments.length ? (
            <View style={{ gap: 12 }}>
              {appointments.map((appointment) => (
                <View key={appointment._id} style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: SCREEN_COLORS.border, padding: 16 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "900" }}>
                        {appointment.doctor?.name || "Doctor"}
                      </Text>
                      <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 3 }}>
                        {appointment.doctor?.specialty || "Specialist"} · {appointment.mode}
                      </Text>
                    </View>
                    <Text style={{ color: SCREEN_COLORS.primary, fontWeight: "900", textTransform: "capitalize" }}>
                      {appointment.status}
                    </Text>
                  </View>

                  <Text style={{ color: SCREEN_COLORS.text, marginTop: 12, fontWeight: "800" }}>
                    {formatDate(appointment.date)} at {appointment.slotTime}
                  </Text>
                  {appointment.meetingLink ? (
                    <Text style={{ color: SCREEN_COLORS.primary, marginTop: 8 }}>{appointment.meetingLink}</Text>
                  ) : null}
                  {appointment.adminNotes ? (
                    <Text style={{ color: SCREEN_COLORS.textMuted, marginTop: 8 }}>{appointment.adminNotes}</Text>
                  ) : null}

                  {activeTab === "upcoming" ? (
                    <TouchableOpacity
                      disabled={isCancellingId === appointment._id}
                      onPress={() => requestCancel(appointment)}
                      style={{
                        height: 42,
                        borderRadius: 12,
                        backgroundColor: "#FEE2E2",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 14,
                        opacity: isCancellingId === appointment._id ? 0.6 : 1,
                      }}
                    >
                      <Text style={{ color: "#B91C1C", fontWeight: "900" }}>
                        {isCancellingId === appointment._id ? "Cancelling..." : "Cancel"}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <View style={{ backgroundColor: SCREEN_COLORS.card, borderRadius: 18, padding: 18, alignItems: "center" }}>
              <Ionicons name="calendar-outline" size={30} color={SCREEN_COLORS.primary} />
              <Text style={{ color: SCREEN_COLORS.text, fontWeight: "900", marginTop: 10 }}>No appointments</Text>
              <Text style={{ color: SCREEN_COLORS.textMuted, textAlign: "center", marginTop: 6 }}>
                Appointments in this section will appear here.
              </Text>
            </View>
          )}
        </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}
