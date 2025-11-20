import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import { z } from 'zod'
import crypto from 'crypto'
import cache from '../utils/cache.js'

dotenv.config()
const apiKey = process.env.YOUR_API_KEY

// Zod Schema for Health Data
const healthDataSchema = z.object({
    age: z.number().or(z.string().transform(Number)),
    gender: z.string(),
    height: z.number().or(z.string().transform(Number)),
    weight: z.number().or(z.string().transform(Number)),
    bmi: z.number().or(z.string().transform(Number)),
    bmiCategory: z.string(),
    bloodGlucose: z.number().or(z.string().transform(Number)),
    modelType: z.string().default('gemini-1.5-pro'),
    sleepHours: z.number().or(z.string().transform(Number)),
    sleepQuality: z.string(),
    exerciseHours: z.number().or(z.string().transform(Number)),
    stressLevel: z.number().or(z.string().transform(Number)),
    waterIntake: z.number().or(z.string().transform(Number)),
    caffeine: z.number().or(z.string().transform(Number)),
    diet: z.string(),

    regularMeals: z.boolean().or(z.string().transform(val => val === 'true')),
    lateNightSnacking: z.boolean().or(z.string().transform(val => val === 'true')),
    highSugar: z.boolean().or(z.string().transform(val => val === 'true')),
    fastFood: z.boolean().or(z.string().transform(val => val === 'true')),

    smoking: z.string(),
    alcoholConsumption: z.string(),

    medicalConditions: z.string().default("None reported"),
    medications: z.string().default("None reported"),
    familyHistory: z.string().default("None reported"),
});

export const analyzeAdvancedHealthData = async (req, res) => {
    try {
        // Validate request body
        const validationResult = healthDataSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Invalid input data',
                details: validationResult.error.format()
            });
        }

        // Generate cache key based on the validated data
        const cacheKey = crypto.createHash('md5').update(JSON.stringify(validationResult.data)).digest('hex');
        const cachedResponse = cache.get(cacheKey);

        if (cachedResponse) {
            console.log('Serving from cache');
            return res.status(200).json({
                success: true,
                data: cachedResponse,
                message: 'Health analysis retrieved from cache'
            });
        }

        const {
            age,
            gender,
            height,
            weight,
            bmi,
            bmiCategory,
            bloodGlucose,
            modelType,
            sleepHours,
            sleepQuality,
            exerciseHours,
            stressLevel,
            waterIntake,
            caffeine,
            diet,
            regularMeals,
            lateNightSnacking,
            highSugar,
            fastFood,
            smoking,
            alcoholConsumption,
            medicalConditions,
            medications,
            familyHistory
        } = validationResult.data;

        // Check if there's meaningful medical history information
        const hasMedicalHistory =
            medicalConditions &&
            medicalConditions !== "None reported" &&
            medicalConditions.length > 5;

        const hasMedications =
            medications &&
            medications !== "None reported" &&
            medications.length > 5;

        const hasFamilyHistory =
            familyHistory &&
            familyHistory !== "None reported" &&
            familyHistory.length > 5;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelType,
        });

        // Enhanced prompt with special focus on medical history when present
        const prompt = `
                        You are a health advisor AI. Please analyze the following health data and provide detailed analysis in these categories: sleep, exercise, stress, nutrition, hydration, lifestyle, and overall health.
                        Format your response in a JSON array of objects with these fields:
                        - category: "sleep", "exercise", "stress", "nutrition", "hydration", "lifestyle", or "overall"
                        - title: A title for this analysis section
                        - analysis: A paragraph analyzing this aspect of health
                        - recommendation: A specific, actionable recommendation
                        - score: A health score (0-100) for this category
                        
                        Patient health data:
                        - Age: ${age}
                        - Gender: ${gender}
                        - Height: ${height} cm
                        - Weight: ${weight} kg
                        - BMI: ${bmi} (Category: ${bmiCategory})
                        - Blood Glucose: ${bloodGlucose} mg/dL
                        - Sleep Hours: ${sleepHours} hours per day
                        - Sleep Quality: ${sleepQuality}
                        - Exercise: ${exerciseHours} hours per week
                        - Stress Level: ${stressLevel}/10
                        - Water Intake: ${waterIntake} liters per day
                        - Caffeine Intake: ${caffeine} cups per day
                        - Diet Type: ${diet}
                        - Food Habits: 
                            * Regular meals: ${regularMeals ? 'Yes' : 'No'}
                            * Late night snacking: ${lateNightSnacking ? 'Yes' : 'No'}
                            * Frequent fast food: ${fastFood ? 'Yes' : 'No'}
                            * High sugar consumption: ${highSugar ? 'Yes' : 'No'}
                        - Smoking Status: ${smoking}
                        - Alcohol Consumption: ${alcoholConsumption}
                        - Medical Conditions: ${medicalConditions}
                        - Medications: ${medications}
                        - Family History: ${familyHistory}
                        
                        ${hasMedicalHistory || hasMedications || hasFamilyHistory ? 'IMPORTANT: The patient has provided medical history information. In your analysis and recommendations, specifically address how their medical conditions, medications, and/or family history impact their health in EACH relevant category, not just the lifestyle category. Include specific advice tailored to their medical situation.' : ''}
                        
                        Provide thorough but concise analysis for each category. 
                        
                        For the "nutrition" category, include a detailed assessment of the diet type and food habits.
                        
                        For the "lifestyle" category, provide specific insights about caffeine intake, smoking status, alcohol consumption, and medical history.
                        ${hasMedicalHistory ? 'Pay special attention to how the reported medical conditions might affect health outcomes. Provide specific recommendations that consider these conditions.' : ''}
                        ${hasMedications ? 'Consider how the mentioned medications might impact other health factors and provide appropriate guidance.' : ''}
                        ${hasFamilyHistory ? 'Factor in family history when assessing risk and making recommendations.' : ''}
                        
                        For the "overall" category, provide a comprehensive summary that includes insights from all other categories, and specifically mentions the impact of their medical history, medications, and family health background if provided.
                        
                        For the scores:
                        - Use 80-100 for excellent habits
                        - Use 60-79 for good but improvable habits
                        - Use 40-59 for habits that need moderate improvement
                        - Use 0-39 for habits that need significant improvement
                        
                        Return ONLY a valid JSON array with exactly 7 objects, one for each category.
                        `;


        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Store in cache
        cache.set(cacheKey, text);

        return res.status(200).json({
            success: true,
            data: text,
            message: 'Health analysis completed successfully'
        });
    } catch (error) {
        console.error('Error in analyzeAdvancedHealthData', error);
        res.status(500).json({
            success: false,
            data: null,
            message: 'Internal Server Error'

        });

    }
}