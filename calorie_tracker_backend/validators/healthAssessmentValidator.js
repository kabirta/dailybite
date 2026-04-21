const { body } = require("express-validator");

const normalizeText = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().toLowerCase().replace(/\s+/g, "_");
};

const normalizeHereTo = (value) => {
  const normalized = normalizeText(value);
  const map = {
    lose_weight: "lose_weight",
    maintain_my_weight: "maintain_weight",
    maintain_weight: "maintain_weight",
    work_that_out: "work_that_out",
  };
  return map[normalized] || normalized;
};

const normalizeMainHealthGoal = (value) => {
  const normalized = normalizeText(value);
  const map = {
    understand_my_food_intake: "understand_food_intake",
    understand_food_intake: "understand_food_intake",
    manage_a_medical_condition: "manage_medical_condition",
    manage_medical_condition: "manage_medical_condition",
    improve_my_overallhealth: "improve_overall_health",
    improve_my_overall_health: "improve_overall_health",
    improve_overall_health: "improve_overall_health",
    improve_my_emotional_wellbing: "improve_emotional_wellbeing",
    improve_my_emotional_wellbeing: "improve_emotional_wellbeing",
    improve_emotional_wellbeing: "improve_emotional_wellbeing",
    other: "other",
  };
  return map[normalized] || normalized;
};

const calculateAge = (dateOfBirth) => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - dob.getUTCMonth();
  const isBeforeBirthday =
    monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < dob.getUTCDate());

  if (isBeforeBirthday) {
    age -= 1;
  }

  return age;
};

const minWeightByAge = (age) => {
  if (age <= 12) return 20;
  if (age <= 17) return 30;
  if (age <= 64) return 35;
  return 32;
};

const createHealthAssessmentValidator = [
  body("hereTo")
    .customSanitizer(normalizeHereTo)
    .isIn(["lose_weight", "maintain_weight", "work_that_out"])
    .withMessage("hereTo must be lose_weight, maintain_weight, or work_that_out"),
  body("mainHealthGoal")
    .customSanitizer(normalizeMainHealthGoal)
    .isIn([
      "understand_food_intake",
      "manage_medical_condition",
      "improve_overall_health",
      "improve_emotional_wellbeing",
      "other",
    ])
    .withMessage(
      "mainHealthGoal must be understand_food_intake, manage_medical_condition, improve_overall_health, improve_emotional_wellbeing, or other"
    ),
  body("healthGoalOption")
    .isInt({ min: 1, max: 4 })
    .withMessage("healthGoalOption must be an integer from 1 to 4"),
  body("heightUnit").isIn(["cm", "ft_in"]).withMessage("heightUnit must be cm or ft_in"),
  body("heightCm").optional().isFloat({ min: 30, max: 300 }).withMessage("heightCm must be 30 to 300"),
  body("heightFt").optional().isInt({ min: 1, max: 9 }).withMessage("heightFt must be between 1 and 9"),
  body("heightIn")
    .optional()
    .isFloat({ min: 0, max: 11.99 })
    .withMessage("heightIn must be between 0 and 11.99"),
  body()
    .custom((payload) => {
      if (payload.heightUnit === "cm" && payload.heightCm === undefined) {
        throw new Error("heightCm is required when heightUnit is cm");
      }

      if (
        payload.heightUnit === "ft_in" &&
        (payload.heightFt === undefined || payload.heightIn === undefined)
      ) {
        throw new Error("heightFt and heightIn are required when heightUnit is ft_in");
      }

      return true;
    })
    .withMessage("Invalid height payload"),
  body("currentWeightKg")
    .isFloat({ min: 20, max: 500 })
    .withMessage("currentWeightKg must be between 20 and 500"),
  body("dateOfBirth")
    .isISO8601()
    .withMessage("dateOfBirth must be a valid date")
    .custom((value) => {
      const dob = new Date(value);
      const now = new Date();
      if (dob > now) {
        throw new Error("dateOfBirth cannot be in the future");
      }

      const age = calculateAge(dob);
      if (age < 1 || age > 120) {
        throw new Error("dateOfBirth produces an invalid age");
      }

      return true;
    }),
  body("weightGoalKg")
    .isFloat({ min: 20, max: 500 })
    .withMessage("weightGoalKg must be between 20 and 500")
    .custom((value, { req }) => {
      const age = calculateAge(req.body.dateOfBirth);
      const minimum = minWeightByAge(age);
      if (Number(value) < minimum) {
        throw new Error(`weightGoalKg cannot be below ${minimum}kg for age ${age}`);
      }
      return true;
    }),
  body("sex").isIn(["male", "female", "other"]).withMessage("sex must be male, female, or other"),
];

module.exports = { createHealthAssessmentValidator };
