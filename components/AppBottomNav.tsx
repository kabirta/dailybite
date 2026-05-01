import {
  usePathname,
  useRouter,
} from 'expo-router';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { SCREEN_COLORS } from './ScreenBackground';

interface BottomTabItem {
  key: "community" | "diary" | "reports" | "store" | "doctor";
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
    key: "doctor",
    label: "Doctor",
    icon: "medical-outline",
    activeIcon: "medical",
    href: "/premium",
  },
];

function getActiveTabKey(pathname: string): BottomTabItem["key"] {
  if (pathname === "/chat") return "community";
  if (pathname === "/premium") return "doctor";
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
        backgroundColor: "rgba(255,255,255,0.94)",
        borderTopWidth: 1,
        borderTopColor: SCREEN_COLORS.border,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingHorizontal: 8,
      }}
    >
      {BOTTOM_TABS.map((tab) => {
        const isActive = tab.key === activeTabKey;
        const iconName = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;
        const color = isActive ? SCREEN_COLORS.primary : SCREEN_COLORS.textMuted;

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
              borderRadius: 12,
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
