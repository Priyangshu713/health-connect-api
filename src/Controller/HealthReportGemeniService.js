import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()
const apiKey = process.env.YOUR_API_KEY


export const healthReportGemeniService = async (req, res) => {
    try {
        const { modelType, age, gender, height, weight, bmi, bmiCategory, bloodGlucose } = req.body


        // Validate user input
        if (!modelType || !age || !gender || !height || !weight || !bmi || !bmiCategory || !bloodGlucose) {
            return res.status(400).json({ error: 'Invalid input data' })
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: modelType,
        });

        const prompt = `
      You are a health advisor AI. Please analyze the following health data and provide personalized recommendations.
      Format your response in a JSON array of objects with the following structure:
      [
        {
          "id": "unique-id-1",
          "title": "Short, specific recommendation title",
          "description": "Detailed, actionable recommendation with specific advice",
          "type": "diet|exercise|lifestyle|medical",
          "priority": "high|medium|low",
          "icon": "utensils|dumbbell|heart-pulse|stethoscope|person-walking|apple-whole|clock|cookie|hospital|carrot"
        }
      ]
      
      Patient health data:
      - Age: ${age}
      - Gender: ${gender}
      - Height: ${height} cm
      - Weight: ${weight} kg
      - BMI: ${bmi} (Category: ${bmiCategory})
      - Blood Glucose: ${bloodGlucose} mg/dL
      
      Provide:
      - 3-4 Diet recommendations (type: "diet") - specific meal suggestions, foods to add/avoid based on health metrics
      - 3-4 Exercise recommendations (type: "exercise") - specific workout routines with frequency/duration 
      - 2-3 Medical recommendations (type: "medical") - health checkups, monitoring suggestions
      - 1-2 Lifestyle recommendations (type: "lifestyle") - sleep, stress management, etc.
      
      Make recommendations personalized to this person's specific health metrics and condition.
      Assign priority based on health risks (high for metrics far outside normal range, medium for borderline, low for preventive).
      
      Return ONLY a valid JSON array with no other text.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Health report generated successfully:');

        return res.status(200).json({ 
            success: true,
            data: text,
            message: 'Health report generated successfully'
         })
    } catch (error) {
        console.error('Error generating health report:', error)
        return res.status(500).json({ error: 'Failed to generate health report' })
    }
}