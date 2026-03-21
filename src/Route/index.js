import express from "express";
import { healthReportGemeniService } from "../Controller/HealthReportGemeniService.js";
import { analyzeAdvancedHealthData } from "../Controller/AdvanceHealthGeminiService.js";
import {
  analyzeNutrition,
  fetchRecipeFromGemini,
  generateMealFromIngredients,
  fetchNutritionPlanFromGemini,
  getFoodNutritionInfoFromGemini,
} from "../Controller/NutritionGeminiService.js";
import { fetchNutritionFromGemini } from "../Controller/EdamamNutritionService.js";
import {
  getHealthCategorization,
  checkIfFoodItem,
} from "../Controller/FoodSearchService.js";
import { analyzeWorkout } from "../Controller/WorkoutGeminiService.js";
import {
  createGeminiChatSession,
  getGeminiChatSession,
  getChatHistory,
} from "../Controller/GeminiChatService.js";
import { analyzeHealthInsights } from "../Controller/HealthInsightsGeminiService.js";
import { analyzeWellnessEntry } from "../Controller/WellnessGeminiService.js";
import { getAIUsageStatus, checkFreeUserLimit } from "../Controller/AIUsageController.js";
import verifyToken from "../utils/apiKeyMiddleware.js";

import { saveHealthHistory, getHealthHistory } from "../Controller/HealthHistoryController.js";
import { saveUserHealthProfile, getUserHealthProfile } from "../Controller/UserHealthProfileController.js";

const router = express.Router();

// All AI & health routes require authentication
router.use(verifyToken);

// Route to handle health report generation
router.post("/health-report", healthReportGemeniService);

// Route to handle advanced health analysis
router.post("/advanced-health-analysis", analyzeAdvancedHealthData);

// Route to handle nutrition analysis
router.post("/nutrition-analysis", analyzeNutrition);

// Route to handle recipe generation
router.post("/recipe-generation", fetchRecipeFromGemini);

// Route to handle meal idea generation
router.post("/meal-idea-generation", generateMealFromIngredients);

// Route to handle nutrition plan generation
router.post("/nutrition-plan-generation", fetchNutritionPlanFromGemini);

// Route to handle food nutrition info
router.post("/food-nutrition-info", getFoodNutritionInfoFromGemini);

// Route to handle nutrition categories
router.post("/nutrition-categories", getHealthCategorization);

// Route to handle food identification
router.post("/food-identification", checkIfFoodItem);

router.get("/get-Nutrition", fetchNutritionFromGemini);

router.post("/workout-analysis", analyzeWorkout);

router.post("/create-chat-session", checkFreeUserLimit, createGeminiChatSession);
router.post("/send-message", checkFreeUserLimit, getGeminiChatSession);
router.get("/chat-history/:sessionId", getChatHistory);

// AI usage status for free users (timer/counter)
router.get("/ai-usage-status", getAIUsageStatus);

// Wellness journal endpoint
router.post('/analyze-wellness', analyzeWellnessEntry);

// Route to handle health insights (Profile Summary)
router.post("/health-insights", analyzeHealthInsights);

router.post("/save-history", saveHealthHistory);
router.get("/get-history/:userId", getHealthHistory);

// Health profile routes
router.post("/save-health-profile", saveUserHealthProfile);
router.get("/get-health-profile/:userId", getUserHealthProfile);

export default router;
