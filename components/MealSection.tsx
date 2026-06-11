import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SCREEN_COLORS } from "./ScreenBackground";
import { useLanguage } from "../src/i18n/LanguageContext";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export interface MealSectionProps {
  title: string;
  iconName: IoniconsName;
  iconColor?: string;
  caloriesLogged?: number;
  foods?: Array<{
    id?: string;
    food?: {
      name?: string;
      servingSize?: number;
      servingUnit?: string;
    };
    quantity?: number;
    consumedServing?: {
      size?: number;
      unit?: string;
    };
    calculatedNutrition?: {
      calories?: number;
    };
  }>;
  onPress?: () => void;
  onAdd?: () => void;
  onEditEntry?: (entry: NonNullable<MealSectionProps["foods"]>[number]) => void;
  onDeleteEntry?: (entry: NonNullable<MealSectionProps["foods"]>[number]) => void;
}

export function MealSection({
  title,
  iconName,
  iconColor = "#F59E0B",
  caloriesLogged,
  foods = [],
  onPress,
  onAdd,
  onEditEntry,
  onDeleteEntry,
}: MealSectionProps) {
  const { t } = useLanguage();
  const hasFoods = foods.length > 0;

  return (
    <View
      style={{
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
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Ionicons name={iconName} size={22} color={iconColor} />
          <View>
            <Text
              style={{ color: SCREEN_COLORS.text, fontWeight: "600", fontSize: 15 }}
            >
              {t(title)}
            </Text>
            {caloriesLogged !== undefined && (
              <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 11, marginTop: 1 }}>
                {caloriesLogged} cal
              </Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          {caloriesLogged !== undefined && (
            <Text style={{ color: SCREEN_COLORS.text, fontSize: 16, fontWeight: "700" }}>
              {caloriesLogged}
            </Text>
          )}
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
        </View>
      </TouchableOpacity>

      {hasFoods && (
        <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: SCREEN_COLORS.border }}>
          <Text style={{ color: SCREEN_COLORS.textMuted, fontSize: 13, marginTop: 12, marginBottom: 8 }}>
            {foods.length} {foods.length === 1 ? t("item") : t("items")}
          </Text>
          {foods.map((entry) => {
            const servingSize = entry.consumedServing?.size ?? entry.food?.servingSize ?? 1;
            const servingUnit = entry.consumedServing?.unit ?? entry.food?.servingUnit ?? "serving";

            return (
              <View
                key={String(entry.id ?? `${entry.food?.name}-${entry.quantity}`)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 9,
                }}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: SCREEN_COLORS.text, fontSize: 14, fontWeight: "500" }}>
                    {entry.food?.name ?? t("Food")}
                  </Text>
                  <Text style={{ color: SCREEN_COLORS.primary, fontSize: 12, marginTop: 2 }}>
                    {entry.quantity ?? 1} x {servingSize} {servingUnit}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ color: SCREEN_COLORS.text, fontSize: 14, fontWeight: "700" }}>
                    {Math.round(entry.calculatedNutrition?.calories ?? 0)}
                  </Text>
                  {onEditEntry ? (
                    <TouchableOpacity
                      onPress={() => onEditEntry(entry)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="create-outline" size={18} color={SCREEN_COLORS.primary} />
                    </TouchableOpacity>
                  ) : null}
                  {onDeleteEntry ? (
                    <TouchableOpacity
                      onPress={() => onDeleteEntry(entry)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={SCREEN_COLORS.textMuted} />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
