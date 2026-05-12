import { useEffect, useMemo, useState } from "react";

import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { type Auth, onAuthStateChanged, type User } from "firebase/auth";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Header } from "../components/Header";
import {
  SCREEN_COLORS,
  ScreenBackground,
} from "../components/ScreenBackground";
import { auth as rawAuth } from "../src/config/firebase";
import { signOutUser } from "../src/services/authService";

const AVATAR_STORAGE_KEY = "@healthbangla_avatar_uri";
const CARD = SCREEN_COLORS.card;
const CARD_ALT = SCREEN_COLORS.card;
const BG = SCREEN_COLORS.background;
const TEXT = SCREEN_COLORS.text;
const MUTED = SCREEN_COLORS.textMuted;
const BORDER = SCREEN_COLORS.border;
const ACCENT = SCREEN_COLORS.primary;
const auth = rawAuth as Auth;

const PROFILE_PLACEHOLDERS = {
  streak: 7,
  foodsLogged: 42,
  daysActive: 14,
  age: "Not set",
  height: "Not set",
  weight: "Not set",
  goal: "Stay Healthy",
  calorieGoal: 3000,
  waterGoal: 8,
  caloriesConsumed: 0,
  waterConsumed: 0,
  exerciseMin: 0,
};

type SettingRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  description?: string;
  value?: string;
  tint: string;
  rightNode?: React.ReactNode;
  danger?: boolean;
  onPress?: () => void;
};

function getDisplayName(user: User | null) {
  const name = user?.displayName?.trim();

  if (name) {
    return name;
  }

  if (user?.email) {
    return user.email.split("@")[0];
  }

  return "Profile";
}

function getEmail(user: User | null) {
  return user?.email ?? "No email linked";
}

function getJoinedDate(user: User | null) {
  const createdAt = user?.metadata?.creationTime;

  if (!createdAt) {
    return "Recently";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "?";
}

function getProviderLabel(user: User | null) {
  const providerId = user?.providerData?.[0]?.providerId ?? "";

  if (providerId.includes("google")) {
    return "Google";
  }

  if (providerId.includes("password")) {
    return "Email";
  }

  return "Firebase";
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function MetricCard({
  icon,
  value,
  label,
  tint,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string | number;
  label: string;
  tint: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIconWrap, { backgroundColor: `${tint}20` }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function PreferenceTile({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View style={styles.preferenceTile}>
      <View
        style={[styles.preferenceTileIcon, { backgroundColor: `${tint}20` }]}
      >
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.preferenceTileLabel}>{label}</Text>
      <Text style={styles.preferenceTileValue}>{value}</Text>
    </View>
  );
}

function DetailCard({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tint: string;
}) {
  return (
    <View style={styles.detailCard}>
      <View style={[styles.detailIconWrap, { backgroundColor: `${tint}20` }]}>
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ProgressCard({
  label,
  value,
  total,
  unit,
  icon,
  tint,
}: {
  label: string;
  value: number;
  total: number;
  unit: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tint: string;
}) {
  const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressTopRow}>
        <View style={styles.progressLabelRow}>
          <View
            style={[styles.progressIconWrap, { backgroundColor: `${tint}20` }]}
          >
            <Ionicons name={icon} size={16} color={tint} />
          </View>
          <Text style={styles.progressLabel}>{label}</Text>
        </View>
        <Text style={styles.progressNumbers}>
          {value} / {total} {unit}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: tint,
            },
          ]}
        />
      </View>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  description,
  value,
  tint,
  rightNode,
  danger = false,
  onPress,
}: SettingRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        pressed && onPress ? styles.settingRowPressed : null,
      ]}
    >
      <View style={[styles.settingIconWrap, { backgroundColor: `${tint}20` }]}>
        <Ionicons name={icon} size={18} color={danger ? "#F87171" : tint} />
      </View>

      <View style={styles.settingCopy}>
        <Text
          style={[
            styles.settingLabel,
            danger ? styles.settingDangerLabel : null,
          ]}
        >
          {label}
        </Text>
        {description ? (
          <Text style={styles.settingDescription}>{description}</Text>
        ) : null}
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
      </View>

      {rightNode ?? (
        <Ionicons name="chevron-forward" size={16} color="#3F516E" />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = getDisplayName(currentUser);
  const email = getEmail(currentUser);
  const joinedDate = getJoinedDate(currentUser);
  const resolvedAvatarUri = avatarUri ?? currentUser?.photoURL ?? null;
  const providerLabel = getProviderLabel(currentUser);

  const profileData = useMemo(
    () => ({
      name: displayName,
      email,
      joinedDate,
      ...PROFILE_PLACEHOLDERS,
    }),
    [displayName, email, joinedDate],
  );

  useEffect(() => {
    AsyncStorage.getItem(AVATAR_STORAGE_KEY).then((uri) => {
      if (uri) {
        setAvatarUri(uri);
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);

      if (!firebaseUser) {
        router.replace("/");
      }
    });

    return unsubscribe;
  }, [router]);

  const saveAvatar = async (uri: string) => {
    setAvatarUri(uri);
    await AsyncStorage.setItem(AVATAR_STORAGE_KEY, uri);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Camera access is needed to take a photo.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await saveAvatar(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Photo library access is needed to choose a photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await saveAvatar(result.assets[0].uri);
    }
  };

  const clearCustomAvatar = async () => {
    setAvatarUri(null);
    await AsyncStorage.removeItem(AVATAR_STORAGE_KEY);
  };

  const handleAvatarPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "Cancel",
            "Take Photo",
            "Choose from Library",
            "Remove Photo",
          ],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
          title: "Update profile photo",
        },
        (index) => {
          if (index === 1) {
            void openCamera();
          } else if (index === 2) {
            void openGallery();
          } else if (index === 3) {
            void clearCustomAvatar();
          }
        },
      );
      return;
    }

    Alert.alert("Update profile photo", undefined, [
      { text: "Take Photo", onPress: () => void openCamera() },
      { text: "Choose from Library", onPress: () => void openGallery() },
      ...(avatarUri
        ? [
          {
            text: "Remove Photo",
            style: "destructive" as const,
            onPress: () => void clearCustomAvatar(),
          },
        ]
        : []),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);
      await signOutUser();
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Sign Out Failed",
        error instanceof Error
          ? error.message
          : "Unable to sign out right now.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScreenBackground>
        <Header />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.heroShell}>
            <View style={styles.heroGlow} />
            {false ? (
              <View style={styles.topBar}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.back()}
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.iconButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color={SCREEN_COLORS.primaryDark}
                  />
                </Pressable>

                <Text style={styles.topBarTitle}>Profile</Text>

                <Pressable style={styles.iconButton}>
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={SCREEN_COLORS.primaryDark}
                  />
                </Pressable>
              </View>
            ) : null}

            <View style={styles.heroCard}>
              <View style={styles.heroPatternOne} />
              <View style={styles.heroPatternTwo} />

              <Pressable
                accessibilityRole="button"
                onPress={handleAvatarPress}
                style={({ pressed }) => [
                  styles.avatarButton,
                  pressed ? { opacity: 0.92 } : null,
                ]}
              >
                <View style={styles.avatarRing}>
                  <View style={styles.avatarCore}>
                    {resolvedAvatarUri ? (
                      <Image
                        source={{ uri: resolvedAvatarUri }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarInitials}>
                        {getInitials(displayName)}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.avatarBadge}>
                  <Ionicons name="camera" size={14} color="#031322" />
                </View>
              </Pressable>

              <Text style={styles.heroName}>{profileData.name}</Text>
              <Text style={styles.heroEmail}>{profileData.email}</Text>

              <View style={styles.heroMetaRow}>
                <View style={styles.pill}>
                  <Ionicons name="flash" size={12} color={ACCENT} />
                  <Text style={styles.pillText}>Firebase auth</Text>
                </View>
                <View style={styles.pill}>
                  <Ionicons name="time-outline" size={12} color="#F8C44F" />
                  <Text style={styles.pillText}>
                    Member since {profileData.joinedDate}
                  </Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <MetricCard
                  icon="flame-outline"
                  value={profileData.streak}
                  label="Streak"
                  tint="#F97316"
                />
                <MetricCard
                  icon="restaurant-outline"
                  value={profileData.foodsLogged}
                  label="Meals logged"
                  tint="#38BDF8"
                />
                <MetricCard
                  icon="calendar-outline"
                  value={profileData.daysActive}
                  label="Active days"
                  tint={ACCENT}
                />
              </View>
            </View>
          </View>

          <SectionTitle
            title="Body Snapshot"
            subtitle="These can be connected to onboarding or saved profile fields next."
          />
          <View style={styles.grid}>
            <DetailCard
              label="Age"
              value={profileData.age}
              icon="time-outline"
              tint="#F97316"
            />
            <DetailCard
              label="Height"
              value={profileData.height}
              icon="resize-outline"
              tint="#38BDF8"
            />
            <DetailCard
              label="Weight"
              value={profileData.weight}
              icon="barbell-outline"
              tint="#A78BFA"
            />
            <DetailCard
              label="Goal"
              value={profileData.goal}
              icon="flag-outline"
              tint={ACCENT}
            />
          </View>

          <SectionTitle
            title="Today's Progress"
            subtitle="A quick glance at today's baseline stats."
          />
          <View style={styles.progressStack}>
            <ProgressCard
              label="Calories"
              value={profileData.caloriesConsumed}
              total={profileData.calorieGoal}
              unit="kcal"
              icon="flame-outline"
              tint="#F97316"
            />
            <ProgressCard
              label="Water"
              value={profileData.waterConsumed}
              total={profileData.waterGoal}
              unit="glasses"
              icon="water-outline"
              tint="#38BDF8"
            />
            <ProgressCard
              label="Exercise"
              value={profileData.exerciseMin}
              total={30}
              unit="min"
              icon="walk-outline"
              tint={ACCENT}
            />
          </View>

          <SectionTitle
            title="Preferences"
            subtitle="Core settings that shape your nutrition experience."
          />
          <View style={styles.preferenceGrid}>
            <PreferenceTile
              icon="scale-outline"
              label="Units"
              value="Metric"
              tint="#4F8CF7"
            />
            <PreferenceTile
              icon="restaurant-outline"
              label="Diet Type"
              value="Balanced"
              tint={ACCENT}
            />
            <PreferenceTile
              icon="fitness-outline"
              label="Activity"
              value="Moderate"
              tint="#F97316"
            />
          </View>
          <View style={styles.notificationCard}>
            <View style={styles.notificationOrb}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#A78BFA"
              />
            </View>
            <View style={styles.notificationCopy}>
              <Text style={styles.notificationEyebrow}>Smart reminders</Text>
              <Text style={styles.notificationTitle}>Notifications</Text>
              <Text style={styles.notificationText}>
                Meal reminders and progress nudges throughout the day.
              </Text>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{ false: "#22304D", true: "rgba(46,217,114,0.34)" }}
              thumbColor={notificationsOn ? ACCENT : "#51627F"}
            />
          </View>

          <SectionTitle
            title="Account"
            subtitle="Your signed-in identity and support tools."
          />
          <View style={styles.accountHeroCard}>
            <View style={styles.accountHeroTop}>
              <View style={styles.accountHeroBadge}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={ACCENT}
                />
              </View>
              <View style={styles.accountHeroCopy}>
                <Text style={styles.accountHeroTitle}>{displayName}</Text>
                <Text style={styles.accountHeroEmail}>{email}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={18} color={ACCENT} />
            </View>
            <View style={styles.accountMetaRow}>
              <View style={styles.accountMetaPill}>
                <Text style={styles.accountMetaLabel}>Provider</Text>
                <Text style={styles.accountMetaValue}>{providerLabel}</Text>
              </View>
              <View style={styles.accountMetaPill}>
                <Text style={styles.accountMetaLabel}>Plan</Text>
                <Text style={styles.accountMetaValue}>Free</Text>
              </View>
              <View style={styles.accountMetaPill}>
                <Text style={styles.accountMetaLabel}>Joined</Text>
                <Text style={styles.accountMetaValue}>{joinedDate}</Text>
              </View>
            </View>
          </View>
          <View style={styles.groupCard}>
            <TouchableOpacity
              style={styles.premiumButton}
              activeOpacity={0.85}
              onPress={() => router.push("/premium-plan")}
            >
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumSubtitle}>
                Unlock advanced insights and tailored plans
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#334155" }]} // darker blue/gray
              activeOpacity={0.85}
              onPress={() => router.push("/help-support")}
            >
              <Text style={styles.actionTitle}>Help and Support</Text>
              <Text style={styles.actionSubtitle}>
                FAQs, troubleshooting, and contact options
              </Text>
            </TouchableOpacity>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed || isSigningOut ? styles.signOutButtonPressed : null,
            ]}
          >
            {isSigningOut ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                <TouchableOpacity
                  style={styles.signOutButton}
                  activeOpacity={0.8}
                  onPress={handleSignOut} // your logout function
                >
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>

          <Text style={styles.versionText}>HealthBangla v1.0.0</Text>
        </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroShell: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  heroGlow: {
    position: "absolute",
    right: 0,
    top: 48,
    height: 220,
    width: 220,
    borderRadius: 110,
    backgroundColor: "rgba(223,243,255,0.55)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  topBarTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  iconButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: SCREEN_COLORS.iconBg,
    borderWidth: 1,
    borderColor: BORDER,
  },
  iconButtonPressed: {
    opacity: 0.85,
  },
  heroCard: {
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: CARD_ALT,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: BORDER,
  },
  heroPatternOne: {
    position: "absolute",
    top: -60,
    right: -20,
    height: 180,
    width: 180,
    borderRadius: 90,
    backgroundColor: "rgba(56,189,248,0.12)",
  },
  heroPatternTwo: {
    position: "absolute",
    bottom: -80,
    left: -40,
    height: 180,
    width: 180,
    borderRadius: 90,
    backgroundColor: "rgba(46,217,114,0.09)",
  },
  avatarButton: {
    alignSelf: "center",
    marginBottom: 18,
  },
  avatarRing: {
    height: 108,
    width: 108,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 54,
    backgroundColor: SCREEN_COLORS.iconBg,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
  },
  avatarCore: {
    height: 94,
    width: 94,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 47,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  avatarImage: {
    height: 94,
    width: 94,
  },
  avatarInitials: {
    color: SCREEN_COLORS.primaryDark,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  avatarBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: ACCENT,
    borderWidth: 2,
    borderColor: CARD_ALT,
  },
  heroName: {
    color: TEXT,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  heroEmail: {
    marginTop: 6,
    color: MUTED,
    fontSize: 14,
    textAlign: "center",
  },
  heroMetaRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: SCREEN_COLORS.cardSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  pillText: {
    color: SCREEN_COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  metricsRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: SCREEN_COLORS.cardSoft,
    paddingHorizontal: 10,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  metricIconWrap: {
    marginBottom: 10,
    height: 34,
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
  },
  metricValue: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
  },
  metricLabel: {
    marginTop: 4,
    color: MUTED,
    fontSize: 11,
    textAlign: "center",
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: "700",
  },
  sectionSubtitle: {
    marginTop: 4,
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
  },
  preferenceGrid: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
  },
  preferenceTile: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: CARD,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  preferenceTileIcon: {
    height: 38,
    width: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginBottom: 14,
  },
  preferenceTileLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  preferenceTileValue: {
    marginTop: 8,
    color: TEXT,
    fontSize: 18,
    fontWeight: "700",
  },
  detailCard: {
    width: "47%",
    minHeight: 108,
    justifyContent: "space-between",
    borderRadius: 20,
    backgroundColor: CARD,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  detailIconWrap: {
    height: 34,
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    marginBottom: 10,
  },
  detailLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  detailValue: {
    marginTop: 6,
    color: TEXT,
    fontSize: 17,
    fontWeight: "700",
  },
  progressStack: {
    gap: 10,
    paddingHorizontal: 16,
  },
  notificationCard: {
    marginTop: 10,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 22,
    backgroundColor: CARD,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  notificationOrb: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(168,85,247,0.12)",
  },
  notificationCopy: {
    flex: 1,
  },
  notificationEyebrow: {
    color: "#A78BFA",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  notificationTitle: {
    marginTop: 3,
    color: TEXT,
    fontSize: 16,
    fontWeight: "700",
  },
  notificationText: {
    marginTop: 4,
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
  },
  accountHeroCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 24,
    backgroundColor: CARD,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  accountHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accountHeroBadge: {
    height: 42,
    width: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(46,217,114,0.12)",
  },
  accountHeroCopy: {
    flex: 1,
  },
  accountHeroTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: "700",
  },
  accountHeroEmail: {
    marginTop: 3,
    color: MUTED,
    fontSize: 13,
  },
  accountMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  accountMetaPill: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: SCREEN_COLORS.cardSoft,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: SCREEN_COLORS.border,
  },
  accountMetaLabel: {
    color: SCREEN_COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  accountMetaValue: {
    marginTop: 6,
    color: TEXT,
    fontSize: 14,
    fontWeight: "700",
  },
  progressCard: {
    borderRadius: 20,
    backgroundColor: CARD,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  progressTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  progressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressIconWrap: {
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  progressLabel: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "700",
  },
  progressNumbers: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "500",
  },
  progressTrack: {
    marginTop: 14,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#d8ecff",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  groupCard: {
    marginHorizontal: 16,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: SCREEN_COLORS.border,
  },
  settingRowPressed: {
    opacity: 0.88,
  },
  settingIconWrap: {
    height: 38,
    width: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  settingCopy: {
    flex: 1,
  },
  settingLabel: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "600",
  },
  settingDangerLabel: {
    color: "#F87171",
  },
  settingValue: {
    marginTop: 3,
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
  },
  settingDescription: {
    marginTop: 3,
    color: SCREEN_COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 18,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 18,
    backgroundColor: "#D94A4A",
  },
  signOutButtonPressed: {
    opacity: 0.9,
  },
  signOutText: {
    color: "",
    fontSize: 16,
    fontWeight: "700",
  },
  versionText: {
    marginTop: 18,
    color: SCREEN_COLORS.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
  premiumButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,

    // spacing inside card
    margin: 10,

    // center content
    alignItems: "center",
    justifyContent: "center",

    // shadow
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },

  premiumTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  premiumSubtitle: {
    color: "#DCE6FF",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",

    // shadow
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  actionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  actionSubtitle: {
    color: "#CBD5F5",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});
