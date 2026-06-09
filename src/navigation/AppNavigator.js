import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../config/firebase";
import { clearBackendSession, ensureBackendSession } from "../services/backendApi";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      void (async () => {
        if (firebaseUser) {
          try {
            await ensureBackendSession();
            setUser(firebaseUser);
          } catch (error) {
            console.warn("Could not create backend session:", error);
            setUser(null);
          } finally {
            setLoading(false);
          }
          return;
        }

        await clearBackendSession();
        setUser(null);
        setLoading(false);
      })();
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Home">
            {(props) => <HomeScreen {...props} user={user} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} loading={loading} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
});
