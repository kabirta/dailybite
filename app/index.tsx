import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import WelcomeScreen from "../components/WelcomeScreen";
import { auth } from "../src/config/firebase";

export default function IndexScreen() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        router.replace("/diary");
        return;
      }

      setIsCheckingAuth(false);
    });

    return unsubscribe;
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
