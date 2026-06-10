import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  addExerciseLog,
  addFoodToMeal,
  addSleepLog,
  addWaterLog,
  addWeightLog,
  deleteMealEntry,
  getDailySummary,
  listGoals,
  updateGoal,
  updateMealEntry,
} from "../services/backendApi";

type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "other";

type LogFoodInput = {
  foodId: string;
  mealType: MealType;
  quantity?: number;
  date?: Date;
};

type NutritionContextValue = {
  dailyReport: any;
  goals: any[];
  lastDeletedMealEntry: any;
  isLoadingReport: boolean;
  reportError: string;
  addExercise: (input: Record<string, any>, date?: Date) => Promise<any>;
  addSleep: (input: Record<string, any>, date?: Date) => Promise<any>;
  addWater: (input: { amountMl: number; loggedAt?: Date | string }, date?: Date) => Promise<any>;
  addWeight: (input: { weight: number; loggedAt?: Date | string }, date?: Date) => Promise<any>;
  editMeal: (entryId: string, input: Record<string, any>, date?: Date) => Promise<any>;
  removeMeal: (entryId: string, date?: Date) => Promise<any>;
  logFood: (input: LogFoodInput) => Promise<any>;
  logFoods: (inputs: LogFoodInput[], date?: Date) => Promise<any[]>;
  refreshGoals: () => Promise<any[]>;
  refreshDailyReport: (date?: Date) => Promise<any>;
  setGoal: (type: string, input: Record<string, any>) => Promise<any>;
  undoDeleteMeal: (date?: Date) => Promise<any>;
};

const NutritionContext = createContext<NutritionContextValue | null>(null);

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [lastDeletedMealEntry, setLastDeletedMealEntry] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState("");

  const refreshDailyReport = useCallback(async (date: Date = new Date()) => {
    setIsLoadingReport(true);
    setReportError("");
    try {
      const report = await getDailySummary(date);
      setDailyReport(report);
      return report;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load nutrition report";
      setReportError(message);
      throw error;
    } finally {
      setIsLoadingReport(false);
    }
  }, []);

  const refreshGoals = useCallback(async () => {
    const nextGoals = await listGoals();
    setGoals(Array.isArray(nextGoals) ? nextGoals : []);
    return Array.isArray(nextGoals) ? nextGoals : [];
  }, []);

  const logFood = useCallback(
    async ({ foodId, mealType, quantity = 1, date = new Date() }: LogFoodInput) => {
      const entry = await addFoodToMeal({ foodId, mealType, quantity, date });
      await refreshDailyReport(date);
      return entry;
    },
    [refreshDailyReport]
  );

  const logFoods = useCallback(
    async (inputs: LogFoodInput[], date: Date = new Date()) => {
      const uniqueInputs = inputs.filter(
        (input, index, list) => list.findIndex((item) => item.foodId === input.foodId && item.mealType === input.mealType) === index
      );

      const entries = [];
      // Save first, then refresh once. This prevents transient UI overwrites from
      // repeated report refetches while adding several selected breakfast foods.
      for (const input of uniqueInputs) {
        entries.push(
          await addFoodToMeal({
            foodId: input.foodId,
            mealType: input.mealType,
            quantity: input.quantity ?? 1,
            date: input.date ?? date,
          })
        );
      }

      await refreshDailyReport(date);
      return entries;
    },
    [refreshDailyReport]
  );

  const addWater = useCallback(
    async (input: { amountMl: number; loggedAt?: Date | string }, date: Date = new Date()) => {
      const loggedAt = input.loggedAt as any;
      const log = await addWaterLog({ amount: input.amountMl, amountMl: input.amountMl, loggedAt });
      await refreshDailyReport(date);
      return log;
    },
    [refreshDailyReport]
  );

  const addWeight = useCallback(
    async (input: { weight: number; loggedAt?: Date | string }, date: Date = new Date()) => {
      const loggedAt = input.loggedAt as any;
      const log = await addWeightLog({ weight: input.weight, loggedAt });
      await refreshDailyReport(date);
      return log;
    },
    [refreshDailyReport]
  );

  const addExercise = useCallback(
    async (input: Record<string, any>, date: Date = new Date()) => {
      const log = await addExerciseLog(input);
      await refreshDailyReport(date);
      return log;
    },
    [refreshDailyReport]
  );

  const addSleep = useCallback(
    async (input: Record<string, any>, date: Date = new Date()) => {
      const log = await addSleepLog(input);
      await refreshDailyReport(date);
      return log;
    },
    [refreshDailyReport]
  );

  const editMeal = useCallback(
    async (entryId: string, input: Record<string, any>, date: Date = new Date()) => {
      const entry = await updateMealEntry(entryId, input);
      await refreshDailyReport(date);
      return entry;
    },
    [refreshDailyReport]
  );

  const removeMeal = useCallback(
    async (entryId: string, date: Date = new Date()) => {
      const deleted = await deleteMealEntry(entryId);
      setLastDeletedMealEntry(deleted);
      await refreshDailyReport(date);
      return deleted;
    },
    [refreshDailyReport]
  );

  const undoDeleteMeal = useCallback(
    async (date: Date = new Date()) => {
      if (!lastDeletedMealEntry) {
        return null;
      }

      const restored = await addFoodToMeal({
        foodId: String(lastDeletedMealEntry.foodId),
        mealType: lastDeletedMealEntry.mealType,
        quantity: lastDeletedMealEntry.quantity,
        date: lastDeletedMealEntry.date ? new Date(lastDeletedMealEntry.date) : date,
      });
      setLastDeletedMealEntry(null);
      await refreshDailyReport(date);
      return restored;
    },
    [lastDeletedMealEntry, refreshDailyReport]
  );

  const setGoal = useCallback(
    async (type: string, input: Record<string, any>) => {
      const goal = await updateGoal(type, input);
      await refreshGoals();
      await refreshDailyReport();
      return goal;
    },
    [refreshDailyReport, refreshGoals]
  );

  const value = useMemo(
    () => ({
      dailyReport,
      goals,
      lastDeletedMealEntry,
      isLoadingReport,
      reportError,
      addExercise,
      addSleep,
      addWater,
      addWeight,
      editMeal,
      logFood,
      logFoods,
      refreshGoals,
      refreshDailyReport,
      removeMeal,
      setGoal,
      undoDeleteMeal,
    }),
    [
      addExercise,
      addSleep,
      addWater,
      addWeight,
      dailyReport,
      editMeal,
      goals,
      isLoadingReport,
      lastDeletedMealEntry,
      logFood,
      logFoods,
      refreshDailyReport,
      refreshGoals,
      removeMeal,
      reportError,
      setGoal,
      undoDeleteMeal,
    ]
  );

  return <NutritionContext.Provider value={value}>{children}</NutritionContext.Provider>;
}

export function useNutrition() {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error("useNutrition must be used inside NutritionProvider");
  }
  return context;
}
