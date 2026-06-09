import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { auth } from "../config/firebase";

const ACCESS_TOKEN_KEY = "dailybite.accessToken";
const REFRESH_TOKEN_KEY = "dailybite.refreshToken";
const DEFAULT_API_BASE_URL = "https://nutrimed-backend.vercel.app/api/v1";

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
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    Constants.expoConfig?.extra?.apiBaseUrl ||
    Constants.manifest?.extra?.apiBaseUrl ||
    Constants.manifest2?.extra?.expoClient?.extra?.apiBaseUrl;

  if (configured) {
    const withProtocol = configured.startsWith("http://") || configured.startsWith("https://")
      ? configured
      : `https://${configured}`;
    const normalized = withProtocol.replace(/\/$/, "");
    const apiUrl = normalized.endsWith("/api/v1") ? normalized : `${normalized}/api/v1`;

    if (
      Platform.OS === "android" &&
      (apiUrl.includes("://127.0.0.1") || apiUrl.includes("://localhost"))
    ) {
      return apiUrl
        .replace("://127.0.0.1", "://10.0.2.2")
        .replace("://localhost", "://10.0.2.2");
    }

    return apiUrl;
  }

  return DEFAULT_API_BASE_URL;
}

const API_BASE_URL = getApiBaseUrl();

export function getConfiguredApiBaseUrl() {
  return API_BASE_URL;
}

function formatLocalDate(date) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return date;

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function serializeDateParam(value) {
  return value instanceof Date ? formatLocalDate(value) : value;
}

function serializeDateTime(value) {
  return value instanceof Date ? value.toISOString() : value;
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

export async function clearBackendSession() {
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

export async function ensureBackendSession() {
  return getBackendAccessToken();
}

async function getFreshBackendAccessToken() {
  await clearBackendSession();
  return getBackendAccessToken();
}

async function authenticatedRequest(path, options = {}) {
  const accessToken = await getBackendAccessToken();
  if (!accessToken) {
    throw new Error("Please sign in again before syncing your diary.");
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
      date: serializeDateParam(date),
    }),
  });
}

export async function getDailyNutritionReport(date = new Date()) {
  const reportDate = serializeDateParam(date);
  const params = new URLSearchParams({ date: reportDate });

  return authenticatedRequest(`/report/daily?${params.toString()}`);
}

export async function getDailySummary(date = new Date(), { persist = true } = {}) {
  const reportDate = serializeDateParam(date);
  const params = new URLSearchParams({ date: reportDate, persist: String(persist) });

  return authenticatedRequest(`/summaries/daily?${params.toString()}`);
}

export async function getDiaryAnalytics({ range = "week", startDate, endDate } = {}) {
  const params = new URLSearchParams({ range });
  if (startDate) params.set("startDate", serializeDateParam(startDate));
  if (endDate) params.set("endDate", serializeDateParam(endDate));

  return authenticatedRequest(`/summaries/analytics?${params.toString()}`);
}

export async function listGoals() {
  return authenticatedRequest("/goals");
}

export async function updateGoal(type, payload) {
  return authenticatedRequest(`/goals/${type}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function recalculateCalorieGoal(payload = {}) {
  return authenticatedRequest("/goals/calorie/recalculate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function addWaterLog({ amountMl, amount, loggedAt = new Date() }) {
  return authenticatedRequest("/water", {
    method: "POST",
    body: JSON.stringify({
      amountMl: amountMl ?? amount,
      loggedAt: serializeDateTime(loggedAt),
    }),
  });
}

export async function listWaterLogs({ date = new Date(), startDate, endDate, limit = 100 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (startDate) params.set("startDate", serializeDateParam(startDate));
  if (endDate) params.set("endDate", serializeDateParam(endDate));
  if (!startDate && date) params.set("date", serializeDateParam(date));

  return authenticatedRequest(`/water?${params.toString()}`);
}

export async function updateWaterLog(logId, payload) {
  return authenticatedRequest(`/water/${logId}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...payload,
      ...(payload?.loggedAt !== undefined ? { loggedAt: serializeDateTime(payload.loggedAt) } : {}),
      ...(payload?.date !== undefined ? { date: serializeDateParam(payload.date) } : {}),
    }),
  });
}

export async function deleteWaterLog(logId) {
  return authenticatedRequest(`/water/${logId}`, { method: "DELETE" });
}

export async function addWeightLog({ weight, loggedAt = new Date() }) {
  return authenticatedRequest("/weight", {
    method: "POST",
    body: JSON.stringify({
      weight,
      loggedAt: serializeDateTime(loggedAt),
    }),
  });
}

export async function getWeightHistory({ startDate, endDate, limit = 200 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (startDate) params.set("startDate", serializeDateParam(startDate));
  if (endDate) params.set("endDate", serializeDateParam(endDate));

  return authenticatedRequest(`/weight/history?${params.toString()}`);
}

export async function updateWeightLog(logId, payload) {
  return authenticatedRequest(`/weight/${logId}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...payload,
      ...(payload?.loggedAt !== undefined ? { loggedAt: serializeDateTime(payload.loggedAt) } : {}),
      ...(payload?.date !== undefined ? { date: serializeDateParam(payload.date) } : {}),
    }),
  });
}

export async function deleteWeightLog(logId) {
  return authenticatedRequest(`/weight/${logId}`, { method: "DELETE" });
}

export async function addExerciseLog(payload) {
  return authenticatedRequest("/exercise", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      ...(payload?.loggedAt !== undefined ? { loggedAt: serializeDateTime(payload.loggedAt) } : {}),
    }),
  });
}

export async function listExerciseLogs({ date = new Date(), startDate, endDate, limit = 100 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (startDate) params.set("startDate", serializeDateParam(startDate));
  if (endDate) params.set("endDate", serializeDateParam(endDate));
  if (!startDate && date) params.set("date", serializeDateParam(date));

  return authenticatedRequest(`/exercise?${params.toString()}`);
}

export async function updateExerciseLog(logId, payload) {
  return authenticatedRequest(`/exercise/${logId}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...payload,
      ...(payload?.loggedAt !== undefined ? { loggedAt: serializeDateTime(payload.loggedAt) } : {}),
    }),
  });
}

export async function deleteExerciseLog(logId) {
  return authenticatedRequest(`/exercise/${logId}`, { method: "DELETE" });
}

export async function addSleepLog(payload) {
  return authenticatedRequest("/sleep", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      ...(payload?.sleepStart !== undefined ? { sleepStart: serializeDateTime(payload.sleepStart) } : {}),
      ...(payload?.sleepEnd !== undefined ? { sleepEnd: serializeDateTime(payload.sleepEnd) } : {}),
    }),
  });
}

export async function listSleepLogs({ date = new Date(), startDate, endDate, limit = 100 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (startDate) params.set("startDate", serializeDateParam(startDate));
  if (endDate) params.set("endDate", serializeDateParam(endDate));
  if (!startDate && date) params.set("date", serializeDateParam(date));

  return authenticatedRequest(`/sleep?${params.toString()}`);
}

export async function updateSleepLog(logId, payload) {
  return authenticatedRequest(`/sleep/${logId}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...payload,
      ...(payload?.sleepStart !== undefined ? { sleepStart: serializeDateTime(payload.sleepStart) } : {}),
      ...(payload?.sleepEnd !== undefined ? { sleepEnd: serializeDateTime(payload.sleepEnd) } : {}),
    }),
  });
}

export async function deleteSleepLog(logId) {
  return authenticatedRequest(`/sleep/${logId}`, { method: "DELETE" });
}

export async function updateMealEntry(entryId, payload) {
  return authenticatedRequest(`/meal-entries/${entryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteMealEntry(entryId) {
  return authenticatedRequest(`/meal-entries/${entryId}`, { method: "DELETE" });
}

export async function listReminders() {
  return authenticatedRequest("/reminders");
}

export async function createReminder(payload) {
  return authenticatedRequest("/reminders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateReminder(reminderId, payload) {
  return authenticatedRequest(`/reminders/${reminderId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function toggleReminder(reminderId, isActive) {
  return authenticatedRequest(`/reminders/${reminderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
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

export async function listStoreProducts({ query = "", category = "" } = {}) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (category.trim()) params.set("category", category.trim());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return apiRequest(`/store/products${queryString}`);
}

export async function createStoreOrder({ items, shippingAddress = {}, notes = "" }) {
  return authenticatedRequest("/store/orders", {
    method: "POST",
    body: JSON.stringify({ items, shippingAddress, notes }),
  });
}

export async function listMyStoreOrders() {
  return authenticatedRequest("/store/orders");
}

export async function verifyStorePayment({
  orderId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  return authenticatedRequest("/store/payments/verify", {
    method: "POST",
    body: JSON.stringify({
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }),
  });
}
