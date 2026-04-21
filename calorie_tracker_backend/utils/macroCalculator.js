const toFixedNumber = (value, decimals = 2) => Number(value.toFixed(decimals));

const calculateMacrosByQuantity = (food, quantityInGrams) => {
  const factor = quantityInGrams / 100;
  return {
    calories: toFixedNumber(food.calories * factor),
    protein: toFixedNumber(food.protein * factor),
    carbs: toFixedNumber(food.carbs * factor),
    fat: toFixedNumber(food.fat * factor),
  };
};

const calculateDailyTotals = (meals = []) => {
  return meals.reduce(
    (acc, meal) => {
      acc.totalCalories += meal.calories;
      acc.totalProtein += meal.protein;
      acc.totalCarbs += meal.carbs;
      acc.totalFat += meal.fat;
      return acc;
    },
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );
};

module.exports = { calculateMacrosByQuantity, calculateDailyTotals };
