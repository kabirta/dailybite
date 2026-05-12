import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { addFoodToMeal, getDailyNutritionReport } from "../services/backendApi";

type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "other";

type LogFoodInput = {
  foodId: string;
  mealType: MealType;
  quantity?: number;
  date?: Date;
};

type NutritionContextValue = {
  dailyReport: any;
  isLoadingReport: boolean;
  reportError: string;
  logFood: (input: LogFoodInput) => Promise<any>;
  refreshDailyReport: (date?: Date) => Promise<any>;
};

const NutritionContext = createContext<NutritionContextValue | null>(null);

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState("");

  const refreshDailyReport = useCallback(async (date: Date = new Date()) => {
    setIsLoadingReport(true);
    setReportError("");
    try {
      const report = await getDailyNutritionReport(date);
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

  const logFood = useCallback(
    async ({ foodId, mealType, quantity = 1, date = new Date() }: LogFoodInput) => {
      const entry = await addFoodToMeal({ foodId, mealType, quantity, date });
      await refreshDailyReport(date);
      return entry;
    },
    [refreshDailyReport]
  );

  const value = useMemo(
    () => ({
      dailyReport,
      isLoadingReport,
      reportError,
      logFood,
      refreshDailyReport,
    }),
    [dailyReport, isLoadingReport, logFood, refreshDailyReport, reportError]
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
