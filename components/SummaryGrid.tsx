import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SCREEN_COLORS } from "./ScreenBackground";
import { useLanguage } from "../src/i18n/LanguageContext";

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
  filledColor = SCREEN_COLORS.primary,
  emptyColor = "#d8ecff",
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
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  macroTargets?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SummaryGrid({
  remaining = 3000,
  consumed = 0,
  goal = 3000,
  macros,
  macroTargets,
  isCollapsed = false,
  onToggleCollapse,
}: SummaryGridProps) {
  const { t } = useLanguage();
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
            color: SCREEN_COLORS.textMuted,
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {isCollapsed ? t("Expand") : t("Collapse")}
        </Text>
        <Ionicons
          name={isCollapsed ? "chevron-down" : "chevron-up"}
          size={13}
          color={SCREEN_COLORS.textMuted}
        />
      </TouchableOpacity>

      <View
        style={{
          backgroundColor: SCREEN_COLORS.card,
          borderWidth: 1,
          borderColor: SCREEN_COLORS.border,
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ gap: 10 }}>
          <View>
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginBottom: 1 }}>
              {t("Calories Remaining")}
            </Text>
            <Text
              style={{ color: SCREEN_COLORS.text, fontWeight: "600", fontSize: 16 }}
            >
              {remaining.toLocaleString()}
            </Text>
          </View>
          <View>
            <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12, marginBottom: 1 }}>
              {t("Calories Consumed")}
            </Text>
            <Text
              style={{ color: SCREEN_COLORS.text, fontWeight: "600", fontSize: 16 }}
            >
              {consumed}
            </Text>
          </View>
        </View>

        <PixelGrid filledCells={filledCells} />
      </View>

      {!isCollapsed && macroTargets && (
        <View
          style={{
            backgroundColor: SCREEN_COLORS.card,
            borderWidth: 1,
            borderColor: SCREEN_COLORS.border,
            borderRadius: 16,
            padding: 14,
            marginTop: 8,
            gap: 10,
          }}
        >
          {[
            { key: "protein", label: "Protein", color: "#C9757E" },
            { key: "carbs", label: "Carbs", color: "#4DA8D8" },
            { key: "fat", label: "Fat", color: "#D3A017" },
          ].map((item) => {
            const total = Math.round(macros?.[item.key as keyof typeof macros] ?? 0);
            const target = Math.round(macroTargets?.[item.key as keyof typeof macroTargets] ?? 0);
            const progress = Math.min(total / Math.max(target, 1), 1);

            return (
              <View key={item.key} style={{ gap: 5 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ color: SCREEN_COLORS.text, fontSize: 12, fontWeight: "600" }}>
                    {t(item.label)}
                  </Text>
                  <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 12 }}>
                    {total}g / {target || "-"}g
                  </Text>
                </View>
                <View style={{ height: 6, borderRadius: 999, backgroundColor: "#d8ecff", overflow: "hidden" }}>
                  <View
                    style={{
                      width: `${progress * 100}%`,
                      height: "100%",
                      borderRadius: 999,
                      backgroundColor: item.color,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
