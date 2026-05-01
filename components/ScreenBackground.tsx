import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export const SCREEN_COLORS = {
  background: "#ffffff",
  blueWash: "#dff3ff",
  blueWashSoft: "rgba(233, 248, 255, 0.78)",
  primary: "#127dff",
  primaryDark: "#072d66",
  card: "#ffffff",
  cardSoft: "#f4faff",
  border: "#d7ebff",
  text: "#072d66",
  textMuted: "#5f7492",
  iconBg: "#cfe9ff",
} as const;

export function ScreenBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.topShape} />
      <View pointerEvents="none" style={styles.topShapeSoft} />
      <View pointerEvents="none" style={styles.bottomShape} />
      <View pointerEvents="none" style={styles.bottomShapeSoft} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_COLORS.background,
    overflow: "hidden",
  },
  content: {
    flex: 1,
  },
  topShape: {
    position: "absolute",
    top: -112,
    right: -132,
    width: 360,
    height: 510,
    borderBottomLeftRadius: 190,
    backgroundColor: SCREEN_COLORS.blueWash,
  },
  topShapeSoft: {
    position: "absolute",
    top: -62,
    right: -82,
    width: 290,
    height: 420,
    borderBottomLeftRadius: 160,
    backgroundColor: "rgba(229, 247, 255, 0.72)",
  },
  bottomShape: {
    position: "absolute",
    left: -150,
    right: -90,
    bottom: -152,
    height: 280,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 210,
    backgroundColor: SCREEN_COLORS.blueWash,
  },
  bottomShapeSoft: {
    position: "absolute",
    left: -70,
    right: -30,
    bottom: -110,
    height: 220,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 180,
    backgroundColor: SCREEN_COLORS.blueWashSoft,
  },
});
