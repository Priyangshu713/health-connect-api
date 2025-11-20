import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import { z } from 'zod'
import crypto from 'crypto'
import cache from '../utils/cache.js'

dotenv.config()
const apiKey = process.env.YOUR_API_KEY

// Zod Schema for Health Insights
const insightsSchema = z.object({
    modelType: z.string().optional().default('gemini-1.5-flash'),
    age: z.number().or(z.string().transform(Number)),
    gender: z.string(),
    height: z.number().or(z.string().transform(Number)),
    weight: z.number().or(z.string().transform(Number)),
    bmi: z.number().or(z.string().transform(Number)),
    bmiCategory: z.string(),
    bloodGlucose: z.number().or(z.string().transform(Number)),
});

export const analyzeHealthInsights = async (req, res) => {
    try {
        // Validate request body
        const validationResult = insightsSchema.safeParse(req.body);

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
                message: 'Health insights retrieved from cache'
            });
        }

        const {
            modelType,
            age,
            gender,
            height,
            weight,
            bmi,
            bmiCategory,
            bloodGlucose
        } = validationResult.data;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelType,
        });

        const prompt = `
            You are a medical AI analyst. Analyze the following patient health data and provide 4 key health insights.
            
            Patient Data:
            - Age: ${age}
            - Gender: ${gender}
            - Height: ${height} cm
            - Weight: ${weight} kg
            - BMI: ${bmi} (${bmiCategory})
            - Blood Glucose: ${bloodGlucose} mg/dL

            Provide 4 insights in a JSON array. Each insight should have:
            - title: Short title (e.g., "BMI Status", "Glucose Levels")
            - content: A concise explanation (1-2 sentences)
            - type: One of ["normal", "warning", "critical", "positive"] based on medical standards.

            Example:
            [
                { "title": "Healthy BMI", "content": "Your BMI is within the healthy range.", "type": "positive" },
                { "title": "Elevated Glucose", "content": "Your blood glucose is slightly high.", "type": "warning" }
            ]

            Return ONLY the JSON array.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Store in cache
        cache.set(cacheKey, text);

        return res.status(200).json({
            success: true,
            data: text,
            message: 'Health insights generated successfully'
        });

    } catch (error) {
        console.error('Error generating health insights:', error);
        res.status(500).json({
            success: false,
            data: null,
            message: 'Internal Server Error'
        });
    }
}
