import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomTabItem {
  key: "community" | "diary" | "reports" | "store" | "premium";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  href?: "/chat" | "/diary" | "/reports" | "/store" | "/premium";
}

const BOTTOM_TABS: BottomTabItem[] = [
  {
    key: "community",
    label: "AI Assistant",
    icon: "chatbubbles-outline",
    activeIcon: "chatbubbles",
    href: "/chat",
  },
  {
    key: "diary",
    label: "Diary",
    icon: "restaurant-outline",
    activeIcon: "restaurant",
    href: "/diary",
  },
  {
    key: "reports",
    label: "Reports",
    icon: "bar-chart-outline",
    activeIcon: "bar-chart",
    href: "/reports",
  },
  {
    key: "store",
    label: "Store",
    icon: "storefront-outline",
    activeIcon: "storefront",
    href: "/store",
  },
  {
    key: "premium",
    label: "Premium",
    icon: "person-circle-outline",
    activeIcon: "person-circle",
    href: "/premium",
  },
];

function getActiveTabKey(pathname: string): BottomTabItem["key"] {
  if (pathname === "/chat") return "community";
  if (pathname === "/premium") return "premium";
  if (pathname === "/store") return "store";
  if (pathname === "/reports") return "reports";
  return "diary";
}

export function AppBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const activeTabKey = getActiveTabKey(pathname);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        backgroundColor: "#101A31",
        borderTopWidth: 1,
        borderTopColor: "#1E2A44",
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingHorizontal: 6,
      }}
    >
      {BOTTOM_TABS.map((tab) => {
        const isActive = tab.key === activeTabKey;
        const iconName = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;
        const color = isActive ? "#22C55E" : "#A3ADC2";

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            onPress={() => {
              if (!tab.href || pathname === tab.href) {
                return;
              }

              router.push(tab.href);
            }}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 2,
            }}
          >
            <Ionicons name={iconName} size={22} color={color} />
            <Text
              style={{
                color,
                fontSize: 12,
                marginTop: 2,
                fontWeight: isActive ? "600" : "500",
              }}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
