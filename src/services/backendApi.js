import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { auth } from "../config/firebase";

const ACCESS_TOKEN_KEY = "dailybite.accessToken";
const REFRESH_TOKEN_KEY = "dailybite.refreshToken";

class BackendError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "BackendError";
    this.status = status;
    this.payload = payload;
  }
}

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
    throw new BackendError(details || payload.message || "Backend request failed", response.status, payload);
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

async function clearBackendTokens() {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

async function getBackendAccessToken() {
  const storedToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  if (storedToken) {
    return storedToken;
  }

  if (!auth.currentUser) {
    return null;
  }

  const session = await loginWithFirebaseUser(auth.currentUser);
  return session?.accessToken ?? null;
}

async function getFreshBackendAccessToken() {
  await clearBackendTokens();
  return getBackendAccessToken();
}

async function authenticatedRequest(path, options = {}) {
  const accessToken = await getBackendAccessToken();
  if (!accessToken) {
    throw new Error("Please sign in before adding food.");
  }

  try {
    return await apiRequest(path, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    if (!(error instanceof BackendError) || error.status !== 401) {
      throw error;
    }

    const freshToken = await getFreshBackendAccessToken();
    if (!freshToken) {
      throw new Error("Please sign in again.");
    }

    return apiRequest(path, {
      ...options,
      headers: {
        Authorization: `Bearer ${freshToken}`,
        ...(options.headers || {}),
      },
    });
  }
}

export async function searchFoodsAdvanced({ query = "", category = "", barcode = "", page = 1, limit = 30 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (query.trim()) params.set("q", query.trim());
  if (category.trim()) params.set("category", category.trim());
  if (barcode.trim()) params.set("barcode", barcode.trim());

  return apiRequest(`/foods?${params.toString()}`);
}

export async function getRecentFoods(limit = 20) {
  const accessToken = await getBackendAccessToken();
  if (!accessToken) return [];

  return authenticatedRequest(`/foods/recent/list?limit=${limit}`);
}

export async function getPopularFoods(limit = 20) {
  return apiRequest(`/foods/popular/list?limit=${limit}`);
}

export async function addFoodToMeal({ foodId, mealType, quantity = 1, date = new Date() }) {
  return authenticatedRequest("/meal-entries", {
    method: "POST",
    body: JSON.stringify({
      foodId,
      mealType,
      quantity,
      date: date instanceof Date ? date.toISOString() : date,
    }),
  });
}

export async function getDailyNutritionReport(date = new Date()) {
  const reportDate = date instanceof Date ? date.toISOString() : date;
  const params = new URLSearchParams({ date: reportDate });

  return authenticatedRequest(`/report/daily?${params.toString()}`);
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
