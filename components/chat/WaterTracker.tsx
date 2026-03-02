import { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TOTAL = 8;
const ML_PER = 250;

interface Props {
  target?: number;
}

export function WaterTracker({ target = TOTAL }: Props) {
  const [count, setCount] = useState(0);

  // One Animated.Value per glass — created once
  const anims = useRef(
    Array.from({ length: TOTAL }, () => new Animated.Value(0))
  ).current;

  const animateTo = (newCount: number) => {
    Animated.parallel(
      anims.map((a, i) =>
        Animated.timing(a, {
          toValue: i < newCount ? 1 : 0,
          duration: 280,
          delay: Math.abs(i - count) * 35,
          useNativeDriver: false,
        })
      )
    ).start();
  };

  const tapGlass = (i: number) => {
    // tap filled glass → unfill from there; tap empty → fill up to it
    const next = i < count ? i : i + 1;
    setCount(next);
    animateTo(next);
  };

  const pct = Math.round((count / target) * 100);
  const ml = count * ML_PER;

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 6,
        backgroundColor: "#0D1526",
        borderRadius: 16,
        padding: 16,
        gap: 14,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="water" size={22} color="#38BDF8" />
        <Text style={{ color: "#F1F5F9", fontWeight: "700", fontSize: 15 }}>
          Daily Water Tracker
        </Text>
      </View>

      {/* Count + ml */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#38BDF8", fontSize: 28, fontWeight: "800" }}>
          {count}
          <Text
            style={{ color: "#6B7280", fontSize: 14, fontWeight: "400" }}
          >
            /{target} glasses
          </Text>
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
          {ml} ml · {pct}%
        </Text>
      </View>

      {/* Glasses row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 2,
        }}
      >
        {anims.map((anim, i) => {
          const filled = i < count;
          const fillH = anim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"],
          });
          return (
            <TouchableOpacity
              key={i}
              onPress={() => tapGlass(i)}
              activeOpacity={0.75}
              style={{ alignItems: "center", gap: 3 }}
            >
              <View
                style={{
                  width: 28,
                  height: 40,
                  borderRadius: 6,
                  borderWidth: 1.5,
                  borderColor: filled ? "#38BDF8" : "#1E3A5F",
                  overflow: "hidden",
                  backgroundColor: "#070E1E",
                  justifyContent: "flex-end",
                }}
              >
                <Animated.View
                  style={{
                    height: fillH,
                    backgroundColor: "#38BDF8",
                    opacity: 0.85,
                  }}
                />
              </View>
              <Text style={{ color: "#374151", fontSize: 9 }}>{i + 1}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 5,
          backgroundColor: "#1A2744",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${Math.min(pct, 100)}%`,
            height: "100%",
            backgroundColor: pct >= 100 ? "#22C55E" : "#38BDF8",
            borderRadius: 3,
          }}
        />
      </View>

      <Text
        style={{
          textAlign: "center",
          fontSize: 12,
          color: pct >= 100 ? "#22C55E" : "#6B7280",
          fontWeight: pct >= 100 ? "600" : "400",
        }}
      >
        {pct >= 100
          ? "✅ Daily hydration goal achieved!"
          : "Tap a glass to log your intake"}
      </Text>
    </View>
  );
}
