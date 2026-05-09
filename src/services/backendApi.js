import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "dailybite.accessToken";
const REFRESH_TOKEN_KEY = "dailybite.refreshToken";

function getApiBaseUrl() {
  const configured =
    process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl;

  if (configured) {
    if (
      Platform.OS === "android" &&
      (configured.includes("://127.0.0.1") || configured.includes("://localhost"))
    ) {
      return configured
        .replace("://127.0.0.1", "://10.0.2.2")
        .replace("://localhost", "://10.0.2.2")
        .replace(/\/$/, "");
    }

    return configured.replace(/\/$/, "");
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/api/v1";
  }

  return "http://localhost:5000/api/v1";
}

const API_BASE_URL = getApiBaseUrl();

export function getConfiguredApiBaseUrl() {
  return API_BASE_URL;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const details = payload.errors?.map((item) => `${item.field}: ${item.message}`).join(", ");
    throw new Error(details || payload.message || "Backend request failed");
  }

  return payload.data;
}

export async function loginWithFirebaseUser(firebaseUser, onboarding) {
  const idToken = await firebaseUser.getIdToken();

  const data = await apiRequest("/auth/firebase", {
    method: "POST",
    body: JSON.stringify({ idToken, onboarding }),
  });

  if (data?.accessToken) {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  }

  if (data?.refreshToken) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  }

  return data;
}

export async function saveHealthAssessment(accessToken, answers) {
  return apiRequest("/health-assessment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(answers),
  });
}

export async function searchFoods(query = "") {
  const params = new URLSearchParams({ limit: "30" });
  if (query.trim()) {
    params.set("q", query.trim());
  }

  return apiRequest(`/foods?${params.toString()}`);
}

export async function listRecipes(query = "") {
  const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set("q", query.trim());
  }
  const queryString = params.toString() ? `?${params.toString()}` : "";

  if (!accessToken) {
    return apiRequest(`/recipes/public${queryString}`);
  }

  return apiRequest(`/recipes${queryString}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
