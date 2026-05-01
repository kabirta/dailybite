import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SCREEN_COLORS } from "./ScreenBackground";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export interface MealSectionProps {
  title: string;
  iconName: IoniconsName;
  iconColor?: string;
  caloriesLogged?: number;
  onPress?: () => void;
  onAdd?: () => void;
}

export function MealSection({
  title,
  iconName,
  iconColor = "#F59E0B",
  caloriesLogged,
  onPress,
  onAdd,
}: MealSectionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: SCREEN_COLORS.card,
        borderWidth: 1,
        borderColor: SCREEN_COLORS.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginHorizontal: 16,
        marginBottom: 8,
      }}
    >
      {/* Left: icon + title */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Ionicons name={iconName} size={22} color={iconColor} />
        <View>
          <Text
            style={{ color: SCREEN_COLORS.text, fontWeight: "600", fontSize: 15 }}
          >
            {title}
          </Text>
          {caloriesLogged !== undefined && (
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 11, marginTop: 1 }}>
              {caloriesLogged} cal
            </Text>
          )}
        </View>
      </View>

      {/* Right: add button */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onAdd?.();
        }}
        activeOpacity={0.8}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: SCREEN_COLORS.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="add" size={22} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
