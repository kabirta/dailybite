import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBottomNav } from "../components/AppBottomNav";

const REPORT_TABS = [
  { key: "calories", label: "CALORIES" },
  { key: "macros", label: "MACROS" },
  { key: "nutrients", label: "NUTRIENTS" },
] as const;

type ReportTabKey = (typeof REPORT_TABS)[number]["key"];

const WEEK_DAYS = ["Mo 2", "Tu 3", "We 4", "Th 5", "Fr 6", "Sa 7", "Su 8"];

const MEAL_ROWS = [
  { label: "Breakfast", color: "#FFC107" },
  { label: "Lunch", color: "#14B8F5" },
  { label: "Dinner", color: "#FF9A70" },
  { label: "Snacks/Other", color: "#A86BE1" },
];

const MACRO_ROWS = [
  { label: "Carbohydrate", color: "#4DA8D8", goal: "50%" },
  { label: "Fat", color: "#D3A017", goal: "30%" },
  { label: "Protein", color: "#C9757E", goal: "20%" },
];

const NUTRIENT_ROWS = [
  { label: "Calories (kcal)", total: "-", goal: "21000", delta: "-" },
  { label: "Protein (g)", total: "-", goal: "1050", delta: "-" },
  { label: "Carbohydrate (g)", total: "-", goal: "2625", delta: "-" },
  { label: "Fiber (g)", total: "-", goal: "-", delta: "-" },
  { label: "Sugar (g)", total: "-", goal: "-", delta: "-" },
  { label: "Fat (g)", total: "-", goal: "700", delta: "-" },
  { label: "Saturated Fat (g)", total: "-", goal: "-", delta: "-" },
  { label: "Polyunsaturated Fat (g)", total: "-", goal: "-", delta: "-" },
  { label: "Monounsaturated Fat (g)", total: "-", goal: "-", delta: "-" },
  { label: "Cholesterol (mg)", total: "-", goal: "-", delta: "-" },
  { label: "Sodium (mg)", total: "-", goal: "-", delta: "-" },
  { label: "Potassium (mg)", total: "-", goal: "-", delta: "-" },
];

function ChartGrid() {
  return (
    <View style={{ height: 170, marginBottom: 10 }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {WEEK_DAYS.map((day, index) => (
          <View
            key={day}
            style={{
              flex: 1,
              borderLeftWidth: index === 0 ? 0 : 1,
              borderLeftColor: "#383D48",
            }}
          />
        ))}
      </View>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 43,
          borderTopWidth: 1,
          borderTopColor: "#383D48",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 86,
          borderTopWidth: 1,
          borderTopColor: "#383D48",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 129,
          borderTopWidth: 1,
          borderTopColor: "#383D48",
        }}
      />
    </View>
  );
}

function DayLabels() {
  return (
    <View style={{ flexDirection: "row", marginBottom: 10 }}>
      {WEEK_DAYS.map((day) => (
        <Text
          key={day}
          style={{ flex: 1, textAlign: "center", color: "#B9BEC8", fontSize: 12 }}
        >
          {day}
        </Text>
      ))}
    </View>
  );
}

function ReportsHeader() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 62,
            height: 62,
            borderRadius: 31,
            backgroundColor: "#2A3142",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#EFE6CE",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="nutrition-outline" size={30} color="#8D7A5D" />
          </View>
        </View>

        <View
          style={{
            width: 62,
            height: 62,
            borderRadius: 31,
            backgroundColor: "#2A3142",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="notifications-outline" size={30} color="#E5E7EB" />
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: "#E5E7EB", fontSize: 37, marginRight: 10 }}>Goals</Text>
        <View
          style={{
            width: 62,
            height: 62,
            borderRadius: 31,
            backgroundColor: "#2A3142",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="locate-outline" size={30} color="#E5E7EB" />
        </View>
      </View>
    </View>
  );
}

function WeekPicker() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2B2D33",
        borderWidth: 1,
        borderColor: "#3D4048",
        marginBottom: 16,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          width: 56,
          height: 54,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="caret-back" size={24} color="#D1D5DB" />
      </TouchableOpacity>

      <View
        style={{
          flex: 1,
          height: 54,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: "#3D4048",
          paddingHorizontal: 14,
        }}
      >
        <Text style={{ color: "#E5E7EB", fontSize: 24, fontWeight: "500" }}>
          This Week
        </Text>
        <Ionicons name="chevron-down" size={24} color="#D1D5DB" />
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          width: 56,
          height: 54,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="caret-forward" size={24} color="#D1D5DB" />
      </TouchableOpacity>
    </View>
  );
}

function CaloriesPanel() {
  return (
    <View>
      <View
        style={{
          backgroundColor: "#22262F",
          borderWidth: 1,
          borderColor: "#353A45",
          borderRadius: 4,
          marginBottom: 14,
        }}
      >
        <View style={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 }}>
          <Text style={{ color: "#E5E7EB", fontSize: 18, fontWeight: "600" }}>
            Calories
          </Text>
          <Text
            style={{ color: "#F3F4F6", fontSize: 54, fontWeight: "500", lineHeight: 62 }}
          >
            0
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#B9BEC8", fontSize: 15, fontWeight: "600" }}>
              Daily Average: 0
            </Text>
            <Text style={{ color: "#B9BEC8", fontSize: 15, fontWeight: "600" }}>
              Goal: 3000kcal
            </Text>
          </View>

          <View
            style={{
              borderTopWidth: 2,
              borderTopColor: "#D8DADE",
              borderStyle: "dashed",
              marginBottom: 10,
            }}
          />

          <ChartGrid />
          <DayLabels />
        </View>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#3A3F4B",
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Text
              style={{
                width: 92,
                textAlign: "right",
                color: "#B9BEC8",
                fontSize: 15,
                fontWeight: "600",
              }}
            >
              Cals{"\n"}(kcal)
            </Text>
          </View>
        </View>

        {MEAL_ROWS.map((meal) => (
          <View
            key={meal.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: "#3A3F4B",
              paddingHorizontal: 14,
              paddingVertical: 14,
            }}
          >
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              <View
                style={{ width: 12, height: 12, backgroundColor: meal.color, marginRight: 10 }}
              />
              <Text style={{ color: "#66D46E", fontSize: 16 }}>{meal.label}</Text>
            </View>
            <Text style={{ width: 82, textAlign: "right", color: "#E5E7EB", fontSize: 16 }}>
              (0%)
            </Text>
            <Text style={{ width: 42, textAlign: "right", color: "#66D46E", fontSize: 20 }}>
              -
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          backgroundColor: "#22262F",
          borderWidth: 1,
          borderColor: "#353A45",
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            color: "#E5E7EB",
            fontSize: 39,
            fontWeight: "500",
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: 10,
          }}
        >
          Foods Eaten
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#3A3F4B",
            paddingHorizontal: 14,
            paddingBottom: 10,
          }}
        >
          <Text style={{ flex: 1, color: "#D1D5DB", fontSize: 21, fontWeight: "600" }}>
            Foods
          </Text>
          <Text
            style={{ width: 105, textAlign: "center", color: "#D1D5DB", fontSize: 21, fontWeight: "600" }}
          >
            Times{"\n"}Eaten
          </Text>
          <Text
            style={{ width: 82, textAlign: "right", color: "#D1D5DB", fontSize: 21, fontWeight: "600" }}
          >
            Cals{"\n"}(kcal)
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 14,
          }}
        >
          <Text style={{ flex: 1, color: "#F3F4F6", fontSize: 22, fontWeight: "700" }}>
            Total
          </Text>
          <Text style={{ width: 105, textAlign: "center", color: "#F3F4F6", fontSize: 25, fontWeight: "700" }}>
            -
          </Text>
          <Text style={{ width: 82, textAlign: "right", color: "#F3F4F6", fontSize: 25, fontWeight: "700" }}>
            -
          </Text>
        </View>
      </View>
    </View>
  );
}

function MacrosPanel() {
  return (
    <View>
      <View
        style={{
          backgroundColor: "#22262F",
          borderWidth: 1,
          borderColor: "#353A45",
          borderRadius: 4,
          marginBottom: 14,
        }}
      >
        <View style={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 }}>
          <Text style={{ color: "#E5E7EB", fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
            Macronutrients
          </Text>

          <ChartGrid />
          <DayLabels />
        </View>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#3A3F4B",
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Text
              style={{
                width: 82,
                textAlign: "right",
                color: "#B9BEC8",
                fontSize: 15,
                fontWeight: "600",
                marginRight: 24,
              }}
            >
              Total
            </Text>
            <Text
              style={{
                width: 72,
                textAlign: "right",
                color: "#B9BEC8",
                fontSize: 15,
                fontWeight: "600",
              }}
            >
              Goal
            </Text>
          </View>
        </View>

        {MACRO_ROWS.map((macro) => (
          <View
            key={macro.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: "#3A3F4B",
              paddingHorizontal: 14,
              paddingVertical: 14,
            }}
          >
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              <View
                style={{ width: 12, height: 12, backgroundColor: macro.color, marginRight: 10 }}
              />
              <Text style={{ color: "#66D46E", fontSize: 16 }}>{macro.label}</Text>
            </View>
            <Text
              style={{
                width: 82,
                textAlign: "right",
                color: "#E5E7EB",
                fontSize: 16,
                marginRight: 24,
              }}
            >
              0%
            </Text>
            <Text style={{ width: 72, textAlign: "right", color: "#E5E7EB", fontSize: 16 }}>
              {macro.goal}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          backgroundColor: "#22262F",
          borderWidth: 1,
          borderColor: "#353A45",
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            color: "#E5E7EB",
            fontSize: 39,
            fontWeight: "500",
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: 10,
          }}
        >
          Foods Eaten
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#3A3F4B",
            paddingHorizontal: 14,
            paddingBottom: 10,
          }}
        >
          <Text style={{ flex: 1, color: "#D1D5DB", fontSize: 21, fontWeight: "600" }}>
            Foods
          </Text>
          <Text
            style={{ width: 80, textAlign: "right", color: "#D1D5DB", fontSize: 21, fontWeight: "600" }}
          >
            Carbs{"\n"}(g)
          </Text>
          <Text
            style={{ width: 72, textAlign: "right", color: "#D1D5DB", fontSize: 21, fontWeight: "600" }}
          >
            Fat{"\n"}(g)
          </Text>
          <Text
            style={{ width: 72, textAlign: "right", color: "#D1D5DB", fontSize: 21, fontWeight: "600" }}
          >
            Prot{"\n"}(g)
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 14,
          }}
        >
          <Text style={{ flex: 1, color: "#F3F4F6", fontSize: 22, fontWeight: "700" }}>
            Total
          </Text>
          <Text style={{ width: 80, textAlign: "right", color: "#F3F4F6", fontSize: 25, fontWeight: "700" }}>
            -
          </Text>
          <Text style={{ width: 72, textAlign: "right", color: "#F3F4F6", fontSize: 25, fontWeight: "700" }}>
            -
          </Text>
          <Text style={{ width: 72, textAlign: "right", color: "#F3F4F6", fontSize: 25, fontWeight: "700" }}>
            -
          </Text>
        </View>
      </View>
    </View>
  );
}

function NutrientsPanel() {
  return (
    <View
      style={{
        backgroundColor: "#22262F",
        borderWidth: 1,
        borderColor: "#353A45",
        borderRadius: 4,
      }}
    >
      <Text
        style={{
          color: "#E5E7EB",
          fontSize: 43,
          fontWeight: "500",
          paddingHorizontal: 14,
          paddingTop: 14,
          paddingBottom: 10,
        }}
      >
        Nutrients
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#3A3F4B",
          paddingHorizontal: 14,
          paddingBottom: 10,
        }}
      >
        <Text style={{ flex: 1, color: "#D1D5DB", fontSize: 21, fontWeight: "600" }}>
          Nutrient
        </Text>
        <Text
          style={{ width: 70, textAlign: "right", color: "#D1D5DB", fontSize: 21, fontWeight: "600" }}
        >
          Total
        </Text>
        <Text
          style={{ width: 80, textAlign: "right", color: "#D1D5DB", fontSize: 21, fontWeight: "600" }}
        >
          Goal
        </Text>
        <Text
          style={{ width: 70, textAlign: "right", color: "#D1D5DB", fontSize: 21, fontWeight: "600" }}
        >
          [
          <Text style={{ color: "#EF4444" }}>+</Text>
          /
          <Text style={{ color: "#60A5FA" }}>-</Text>
          ]
        </Text>
      </View>

      {NUTRIENT_ROWS.map((nutrient) => (
        <View
          key={nutrient.label}
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#3A3F4B",
            paddingHorizontal: 14,
            paddingVertical: 14,
          }}
        >
          <Text
            style={{
              flex: 1,
              color: "#66D46E",
              fontSize: 16,
              lineHeight: 23,
              marginRight: 10,
            }}
          >
            {nutrient.label}
          </Text>
          <Text style={{ width: 70, textAlign: "right", color: "#E5E7EB", fontSize: 17 }}>
            {nutrient.total}
          </Text>
          <Text style={{ width: 80, textAlign: "right", color: "#E5E7EB", fontSize: 17 }}>
            {nutrient.goal}
          </Text>
          <Text style={{ width: 70, textAlign: "right", color: "#E5E7EB", fontSize: 17 }}>
            {nutrient.delta}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<ReportTabKey>("nutrients");
  const pagerRef = useRef<ScrollView>(null);
  const { width: screenWidth } = useWindowDimensions();
  const pageWidth = Math.max(screenWidth - 24, 1);

  useEffect(() => {
    const activeTabIndex = REPORT_TABS.findIndex((tab) => tab.key === activeTab);
    pagerRef.current?.scrollTo({ x: activeTabIndex * pageWidth, animated: false });
  }, [activeTab, pageWidth]);

  const onTabPress = (tabKey: ReportTabKey) => {
    const tabIndex = REPORT_TABS.findIndex((tab) => tab.key === tabKey);
    setActiveTab(tabKey);
    pagerRef.current?.scrollTo({ x: tabIndex * pageWidth, animated: true });
  };

  const onPagerScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const tabIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    const nextTab = REPORT_TABS[tabIndex];

    if (nextTab && nextTab.key !== activeTab) {
      setActiveTab(nextTab.key);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0F19" }} edges={["top"]}>
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 116 }}
        >
          <ReportsHeader />
          <WeekPicker />

          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "#3F444F",
              marginHorizontal: -12,
              paddingHorizontal: 12,
              marginBottom: 12,
            }}
          >
            {REPORT_TABS.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.85}
                  onPress={() => onTabPress(tab.key)}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    borderBottomWidth: 4,
                    borderBottomColor: isActive ? "#EAF11C" : "transparent",
                    paddingVertical: 12,
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? "#EAF11C" : "#E5E7EB",
                      fontSize: 17,
                      fontWeight: "700",
                    }}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onPagerScrollEnd}
            scrollEventThrottle={16}
          >
            <View style={{ width: pageWidth }}>
              <CaloriesPanel />
            </View>

            <View style={{ width: pageWidth }}>
              <MacrosPanel />
            </View>

            <View style={{ width: pageWidth }}>
              <NutrientsPanel />
            </View>
          </ScrollView>
        </ScrollView>

        <AppBottomNav />
      </View>
    </SafeAreaView>
  );
}
