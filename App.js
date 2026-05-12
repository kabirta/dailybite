import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppNavigator from "./AppNavigator";
import { NutritionProvider } from "./src/context/NutritionContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <NutritionProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </NutritionProvider>
    </SafeAreaProvider>
  );
}
