import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import WelcomeScreen from "../components/WelcomeScreen";
import { auth } from "../src/config/firebase";
import { clearBackendSession, ensureBackendSession } from "../src/services/backendApi";

export default function IndexScreen() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isActive = true;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      void (async () => {
        if (firebaseUser) {
          try {
            const session = await ensureBackendSession();
            if (isActive) router.replace(session?.onboardingComplete ? "/diary" : "/onboarding");
          } catch (error) {
            console.warn("Could not create backend session:", error);
            if (isActive) setIsCheckingAuth(false);
          }
          return;
        }

        await clearBackendSession();
        if (isActive) setIsCheckingAuth(false);
      })();
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [router]);

  if (isCheckingAuth) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#127dff" />
      </View>
    );
  }

  return <WelcomeScreen />;
}
