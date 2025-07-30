import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()
const apiKey = process.env.YOUR_API_KEY

export const analyzeWorkout = async (req, res) => {
    try {
        const { workoutType, duration, intensity, weight, gender, age, caloriesConsumed, bmrValue, modelType } = req.body;
        if (!workoutType || !duration || !intensity || !weight || !gender || !age || !caloriesConsumed || !bmrValue || !modelType) {
            return res.status(400).json({ error: 'Invalid input data' });
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelType,
        });

        const prompt = `
                    You are a fitness expert AI. Please analyze the following workout data and provide a detailed breakdown:
                    
                    User profile:
                    - Weight: ${weight} kg
                    - Gender: ${gender}
                    - Age: ${age}
                    - BMR: ${bmrValue} kcal
                    
                    Workout details:
                    - Type: ${workoutType}
                    - Duration: ${duration} minutes
                    - Intensity: ${intensity}
                    - Calories consumed today: ${caloriesConsumed} kcal
                    
                    Format your response in a JSON object with the following structure:
                    {
                        "caloriesBurned": estimated calories burned during this workout (number only),
                        "benefitsSummary": "brief summary of the benefits of this workout type",
                        "recommendations": ["1-3 specific recommendations for this workout"],
                        "bodyImpact": "description of how this workout affects the body",
                        "calorieBalance": {
                        "totalBurned": total calories burned (BMR + workout + other activity),
                        "bmr": BMR value,
                        "activityBurn": calories burned from workout and other activity,
                        "consumed": calories consumed,
                        "deficit": deficit or surplus (if negative, it's a surplus),
                        "weightImpact": "brief statement about whether user is likely losing/gaining weight and at what rate"
                        }
                    }
                    
                    Be realistic in your calorie estimations based on duration, intensity, and user profile.
                    Return ONLY a valid JSON object with no other text.
                    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({
            message: 'Workout analysis completed successfully',
            data: text,
            success: true
        });

    } catch (error) {
        console.error('Error analyzing workout:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }




}