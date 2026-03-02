import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GRID_ROWS = 8;
const GRID_COLS = 8;
const TOTAL_CELLS = GRID_ROWS * GRID_COLS;

interface PixelGridProps {
  filledCells?: number;
  filledColor?: string;
  emptyColor?: string;
  cellSize?: number;
  cellGap?: number;
}

export function PixelGrid({
  filledCells = 0,
  filledColor = "#22C55E",
  emptyColor = "#1A2744",
  cellSize = 6,
  cellGap = 1,
}: PixelGridProps) {
  return (
    <View style={{ gap: cellGap }}>
      {Array.from({ length: GRID_ROWS }).map((_, row) => (
        <View key={row} style={{ flexDirection: "row", gap: cellGap }}>
          {Array.from({ length: GRID_COLS }).map((_, col) => {
            const index = row * GRID_COLS + col;
            const isFilled = index < filledCells;
            return (
              <View
                key={col}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 1,
                  backgroundColor: isFilled ? filledColor : emptyColor,
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

interface SummaryGridProps {
  remaining?: number;
  consumed?: number;
  goal?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SummaryGrid({
  remaining = 3000,
  consumed = 0,
  goal = 3000,
  isCollapsed = false,
  onToggleCollapse,
}: SummaryGridProps) {
  const filledCells = Math.round(
    Math.min((consumed / Math.max(goal, 1)) * TOTAL_CELLS, TOTAL_CELLS)
  );

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
      {/* Collapse toggle */}
      <TouchableOpacity
        onPress={onToggleCollapse}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: 8,
          gap: 4,
        }}
      >
        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {isCollapsed ? "Expand" : "Collapse"}
        </Text>
        <Ionicons
          name={isCollapsed ? "chevron-down" : "chevron-up"}
          size={13}
          color="#9CA3AF"
        />
      </TouchableOpacity>

      {/* Summary card */}
      <View
        style={{
          backgroundColor: "#0D1526",
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ gap: 10 }}>
          <View>
            <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 1 }}>
              Calories Remaining
            </Text>
            <Text
              style={{ color: "#F1F5F9", fontWeight: "600", fontSize: 16 }}
            >
              {remaining.toLocaleString()}
            </Text>
          </View>
          <View>
            <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 1 }}>
              Calories Consumed
            </Text>
            <Text
              style={{ color: "#F1F5F9", fontWeight: "600", fontSize: 16 }}
            >
              {consumed}
            </Text>
          </View>
        </View>

        <PixelGrid filledCells={filledCells} />
      </View>
    </View>
  );
}
