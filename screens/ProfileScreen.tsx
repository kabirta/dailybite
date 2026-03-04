import { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AVATAR_STORAGE_KEY = "@healthbangla_avatar_uri";

// ─── Mock data ────────────────────────────────────────────────────────────────

const USER = {
  name: "Alex Johnson",
  email: "alex@example.com",
  joinedDate: "March 2025",
  streak: 7,
  foodsLogged: 42,
  daysActive: 14,
  age: 25,
  height: "175 cm",
  weight: "72 kg",
  goal: "Lose Weight",
  calorieGoal: 3000,
  waterGoal: 8,
  caloriesConsumed: 0,
  waterConsumed: 0,
  exerciseMin: 0,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatChip({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: string | number;
  label: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: "#0D1526",
        borderRadius: 14,
        paddingVertical: 14,
        gap: 4,
      }}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={{ color: "#F1F5F9", fontWeight: "800", fontSize: 18 }}>
        {value}
      </Text>
      <Text style={{ color: "#6B7280", fontSize: 11 }}>{label}</Text>
    </View>
  );
}

function InfoCell({
  label,
  value,
  emoji,
}: {
  label: string;
  value: string;
  emoji: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0D1526",
        borderRadius: 14,
        padding: 14,
        gap: 6,
      }}
    >
      <Text
        style={{
          color: "#6B7280",
          fontSize: 10,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
        <Text style={{ color: "#F1F5F9", fontWeight: "700", fontSize: 15 }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ProgressBar({
  value,
  total,
  color,
}: {
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <View
      style={{
        height: 5,
        backgroundColor: "#1A2744",
        borderRadius: 3,
        overflow: "hidden",
        marginTop: 7,
      }}
    >
      <View
        style={{
          width: `${pct}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: 3,
        }}
      />
    </View>
  );
}

type SettingRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
  rightNode?: React.ReactNode;
  showChevron?: boolean;
  danger?: boolean;
  onPress?: () => void;
};

function SettingRow({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  rightNode,
  showChevron = true,
  danger = false,
  onPress,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#080D1A",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 35,
          height: 35,
          borderRadius: 9,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <Text
        style={{
          flex: 1,
          color: danger ? "#EF4444" : "#F1F5F9",
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>

      {rightNode ?? (
        <>
          {value ? (
            <Text style={{ color: "#6B7280", fontSize: 13 }}>{value}</Text>
          ) : null}
          {showChevron && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={danger ? "#EF4444" : "#374151"}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text
      style={{
        color: "#9CA3AF",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        marginHorizontal: 16,
        marginBottom: 10,
        marginTop: 22,
      }}
    >
      {text}
    </Text>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // ── Load persisted avatar on mount ──────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(AVATAR_STORAGE_KEY).then((uri) => {
      if (uri) setAvatarUri(uri);
    });
  }, []);

  // ── Save avatar URI and update state ─────────────────────────────────────
  const saveAvatar = async (uri: string) => {
    setAvatarUri(uri);
    await AsyncStorage.setItem(AVATAR_STORAGE_KEY, uri);
  };

  // ── Launch camera ─────────────────────────────────────────────────────────
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera access is needed to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await saveAvatar(result.assets[0].uri);
    }
  };

  // ── Launch gallery ────────────────────────────────────────────────────────
  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Photo library access is needed to choose a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await saveAvatar(result.assets[0].uri);
    }
  };

  // ── Action sheet (iOS native / Alert on Android) ─────────────────────────
  const handleAvatarPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library", "Remove Photo"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
          title: "Change Profile Photo",
        },
        (index) => {
          if (index === 1) openCamera();
          else if (index === 2) openGallery();
          else if (index === 3) {
            setAvatarUri(null);
            AsyncStorage.removeItem(AVATAR_STORAGE_KEY);
          }
        }
      );
    } else {
      Alert.alert("Change Profile Photo", undefined, [
        { text: "Take Photo", onPress: openCamera },
        { text: "Choose from Library", onPress: openGallery },
        ...(avatarUri
          ? [{
              text: "Remove Photo",
              style: "destructive" as const,
              onPress: () => {
                setAvatarUri(null);
                AsyncStorage.removeItem(AVATAR_STORAGE_KEY);
              },
            }]
          : []),
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#030A23" }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Top bar ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 13,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#E2E8F0" />
          </TouchableOpacity>
          <Text
            style={{ color: "#F1F5F9", fontWeight: "700", fontSize: 17 }}
          >
            Profile
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={23} color="#E2E8F0" />
          </TouchableOpacity>
        </View>

        {/* ── Avatar hero ── */}
        <View
          style={{
            alignItems: "center",
            paddingTop: 16,
            paddingBottom: 24,
          }}
        >
          {/* Avatar + camera badge */}
          <TouchableOpacity
            onPress={handleAvatarPress}
            activeOpacity={0.85}
            style={{ marginBottom: 14 }}
          >
            <View
              style={{
                width: 92,
                height: 92,
                borderRadius: 46,
                backgroundColor: "#1E2A45",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2.5,
                borderColor: "#22C55E",
                overflow: "hidden",
              }}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 92, height: 92, borderRadius: 46 }}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ fontSize: 48 }}>🧑</Text>
              )}
            </View>

            {/* Camera badge */}
            <View
              style={{
                position: "absolute",
                bottom: 1,
                right: 1,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: "#22C55E",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#030A23",
              }}
            >
              <Ionicons name="camera" size={13} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text
            style={{ color: "#F1F5F9", fontWeight: "800", fontSize: 21 }}
          >
            {USER.name}
          </Text>
          <Text
            style={{ color: "#6B7280", fontSize: 13, marginTop: 3 }}
          >
            {USER.email}
          </Text>

          {/* Plan badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              marginTop: 11,
              backgroundColor: "rgba(234,179,8,0.10)",
              borderRadius: 20,
              paddingHorizontal: 13,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: "rgba(234,179,8,0.28)",
            }}
          >
            <Ionicons name="star" size={12} color="#EAB308" />
            <Text
              style={{ color: "#EAB308", fontSize: 12, fontWeight: "600" }}
            >
              Free Plan · Member since {USER.joinedDate}
            </Text>
          </View>
        </View>

        {/* ── Stats row ── */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 16,
            gap: 8,
          }}
        >
          <StatChip emoji="🔥" value={USER.streak} label="Day Streak" />
          <StatChip emoji="📊" value={USER.foodsLogged} label="Foods Logged" />
          <StatChip emoji="📅" value={USER.daysActive} label="Days Active" />
        </View>

        {/* ── Body info ── */}
        <SectionLabel text="Body Info" />
        <View
          style={{ flexDirection: "row", marginHorizontal: 16, gap: 8, marginBottom: 8 }}
        >
          <InfoCell label="Age" value={`${USER.age} yrs`} emoji="🎂" />
          <InfoCell label="Height" value={USER.height} emoji="📏" />
        </View>
        <View style={{ flexDirection: "row", marginHorizontal: 16, gap: 8 }}>
          <InfoCell label="Weight" value={USER.weight} emoji="⚖️" />
          <InfoCell label="Goal" value={USER.goal} emoji="🎯" />
        </View>

        {/* ── Today's progress ── */}
        <SectionLabel text="Today's Progress" />
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: "#0D1526",
            borderRadius: 16,
            padding: 16,
            gap: 16,
          }}
        >
          {/* Calories */}
          <View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{ color: "#F1F5F9", fontSize: 13, fontWeight: "500" }}
              >
                🔥 Calories
              </Text>
              <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                {USER.caloriesConsumed} / {USER.calorieGoal} kcal
              </Text>
            </View>
            <ProgressBar
              value={USER.caloriesConsumed}
              total={USER.calorieGoal}
              color="#F97316"
            />
          </View>

          {/* Water */}
          <View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{ color: "#F1F5F9", fontSize: 13, fontWeight: "500" }}
              >
                💧 Water
              </Text>
              <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                {USER.waterConsumed} / {USER.waterGoal} glasses
              </Text>
            </View>
            <ProgressBar
              value={USER.waterConsumed}
              total={USER.waterGoal}
              color="#38BDF8"
            />
          </View>

          {/* Exercise */}
          <View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{ color: "#F1F5F9", fontSize: 13, fontWeight: "500" }}
              >
                🏃 Exercise
              </Text>
              <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                {USER.exerciseMin} / 30 min
              </Text>
            </View>
            <ProgressBar
              value={USER.exerciseMin}
              total={30}
              color="#22C55E"
            />
          </View>
        </View>

        {/* ── Preferences ── */}
        <SectionLabel text="Preferences" />
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: "#0D1526",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <SettingRow
            icon="scale-outline"
            iconColor="#3B82F6"
            iconBg="rgba(59,130,246,0.14)"
            label="Units"
            value="Metric"
          />
          <SettingRow
            icon="restaurant-outline"
            iconColor="#22C55E"
            iconBg="rgba(34,197,94,0.14)"
            label="Diet Type"
            value="Balanced"
          />
          <SettingRow
            icon="fitness-outline"
            iconColor="#F97316"
            iconBg="rgba(249,115,22,0.14)"
            label="Activity Level"
            value="Moderate"
          />
          {/* Notification toggle row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 13,
              paddingHorizontal: 16,
              gap: 12,
            }}
          >
            <View
              style={{
                width: 35,
                height: 35,
                borderRadius: 9,
                backgroundColor: "rgba(168,85,247,0.14)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="notifications-outline" size={18} color="#A855F7" />
            </View>
            <Text
              style={{ flex: 1, color: "#F1F5F9", fontSize: 14, fontWeight: "500" }}
            >
              Notifications
            </Text>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{ false: "#1E2A45", true: "rgba(34,197,94,0.4)" }}
              thumbColor={notificationsOn ? "#22C55E" : "#4B5563"}
            />
          </View>
        </View>

        {/* ── Account ── */}
        <SectionLabel text="Account" />
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: "#0D1526",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <SettingRow
            icon="person-outline"
            iconColor="#38BDF8"
            iconBg="rgba(56,189,248,0.14)"
            label="Edit Profile"
          />
          <SettingRow
            icon="star-outline"
            iconColor="#EAB308"
            iconBg="rgba(234,179,8,0.14)"
            label="Upgrade to Premium"
            value="Free"
          />
          <SettingRow
            icon="shield-checkmark-outline"
            iconColor="#22C55E"
            iconBg="rgba(34,197,94,0.14)"
            label="Privacy Policy"
          />
          <SettingRow
            icon="help-circle-outline"
            iconColor="#9CA3AF"
            iconBg="rgba(156,163,175,0.14)"
            label="Help & Support"
            showChevron
          />
        </View>

        {/* ── Sign out ── */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            backgroundColor: "#0D1526",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <SettingRow
            icon="log-out-outline"
            iconColor="#EF4444"
            iconBg="rgba(239,68,68,0.14)"
            label="Sign Out"
            danger
            showChevron={false}
            onPress={() => {}}
          />
        </View>

        {/* App version */}
        <Text
          style={{
            color: "#1F2937",
            fontSize: 11,
            textAlign: "center",
            marginTop: 24,
          }}
        >
          HealthBangla v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
