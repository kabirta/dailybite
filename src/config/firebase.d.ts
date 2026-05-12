import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";

export declare const auth: Auth;
export declare const firebaseApp: FirebaseApp;
export declare const firebaseConfig: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};
export declare const googleAuthConfig: {
  androidClientId: string;
  webClientId: string;
  androidPackageName: string;
};
