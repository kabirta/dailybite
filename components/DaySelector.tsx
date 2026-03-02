import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

interface DaySelectorProps {
  currentDayIndex?: number;
  streakCount?: number;
  onDayPress?: (index: number) => void;
  onInfoPress?: () => void;
}

export function DaySelector({
  currentDayIndex = 0,
  streakCount = 0,
  onDayPress,
  onInfoPress,
}: DaySelectorProps) {
  return (
    <View className="px-4 pb-3">
      <Text className="text-white font-semibold text-xl mb-4">Today</Text>

      {/* Day circles */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        {DAYS.map((day, index) => {
          const isActive = index === currentDayIndex;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => onDayPress?.(index)}
              activeOpacity={0.7}
              style={{ alignItems: "center", gap: 5 }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: isActive ? "#22C55E" : "transparent",
                  borderWidth: isActive ? 0 : 1.5,
                  borderColor: "#2A3A5C",
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  color: isActive ? "#4ADE80" : "#6B7280",
                  fontWeight: isActive ? "600" : "400",
                }}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Streak row */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: "#6B7280", fontSize: 12 }}>{streakCount} </Text>
        <Ionicons name="flame" size={13} color="#6B7280" />
        <Text style={{ color: "#6B7280", fontSize: 12, marginLeft: 4 }}>
          Log food to start a streak
        </Text>
        <TouchableOpacity
          onPress={onInfoPress}
          style={{ marginLeft: "auto" }}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={19} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
