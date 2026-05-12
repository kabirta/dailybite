import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";

const googleServices = require("../../google-services.json");

const projectInfo = googleServices.project_info ?? {};
const clientConfig = googleServices.client?.[0] ?? {};
const oauthClients = clientConfig.oauth_client ?? [];

const firebaseConfig = {
  apiKey: clientConfig.api_key?.[0]?.current_key ?? "",
  authDomain: `${projectInfo.project_id}.firebaseapp.com`,
  projectId: projectInfo.project_id ?? "",
  storageBucket: projectInfo.storage_bucket ?? "",
  messagingSenderId: projectInfo.project_number ?? "",
  appId: clientConfig.client_info?.mobilesdk_app_id ?? "",
};

const googleAuthConfig = {
  androidClientId:
    oauthClients.find((client) => client.client_type === 1)?.client_id ?? "",
  webClientId:
    oauthClients.find((client) => client.client_type === 3)?.client_id ?? "",
  androidPackageName:
    clientConfig.client_info?.android_client_info?.package_name ?? "",
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
