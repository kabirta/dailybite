import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCU8LYQDcc-gmeLkSPerpf_8Q3q2Ffvut4",
  authDomain: "nutrimed-ai.firebaseapp.com",
  projectId: "nutrimed-ai",
  storageBucket: "nutrimed-ai.firebasestorage.app",
  messagingSenderId: "106585820976",
  appId: "1:106585820976:android:4b5df91c3b597fe190c2f5",
};

const googleAuthConfig = {
  androidClientId:
    "106585820976-dj2lq434gcu31ep98pbjikgm6snpn7v7.apps.googleusercontent.com",
  webClientId:
    "106585820976-ea3n8s7ojl5ntpn76dn9r50tkf2ldflr.apps.googleusercontent.com",
  androidPackageName: "com.nutrimed.ai",
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error(
    "Firebase configuration could not be loaded from google-services.json."
  );
}

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(firebaseApp);
}

export { auth, firebaseApp, firebaseConfig, googleAuthConfig };
