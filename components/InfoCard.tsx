import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface InfoCardProps {
  title: string;
  subtitle: string;
  iconName: IoniconsName;
  iconColor?: string;
  onClose?: () => void;
  onPress?: () => void;
}

export function InfoCard({
  title,
  subtitle,
  iconName,
  iconColor = "#EF4444",
  onClose,
  onPress,
}: InfoCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0D1526",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginHorizontal: 16,
        marginBottom: 8,
      }}
    >
      {/* Icon */}
      <Ionicons name={iconName} size={22} color={iconColor} />

      {/* Text */}
      <View style={{ flex: 1, marginHorizontal: 12, gap: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ color: "#F1F5F9", fontWeight: "600", fontSize: 15 }}>
            {title}
          </Text>
          {/* Info badge */}
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: "#EAB308",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}
            >
              i
            </Text>
          </View>
        </View>
        <Text style={{ color: "#6B7280", fontSize: 12 }}>{subtitle}</Text>
      </View>

      {/* Close button */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={18} color="#6B7280" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
