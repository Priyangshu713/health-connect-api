import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()
const apiKey = process.env.YOUR_API_KEY


export const fetchNutritionFromGemini = async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const prompt = `
                    You are a nutrition expert. Please provide 5 categories of nutritious foods that people should eat for optimal health.
                    
                    For each category:
                    1. Give it a name (like "Colorful Vegetables", "Lean Proteins", etc.)
                    2. List 5 specific foods in that category
                    3. Explain briefly (30 words max) why these foods are beneficial for health
                    
                    Format your response in a JSON object with this structure:
                    [
                        {
                        "category": "Category Name",
                        "foods": ["Food 1", "Food 2", "Food 3", "Food 4", "Food 5"],
                        "benefits": "Brief explanation of benefits",
                        "type": "vegetables" // use one of: vegetables, fruits, proteins, grains, fats
                        }
                    ]
                    
                    Return ONLY a valid JSON array with no other text.
                    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);

        return res.status(200).json({
            success: true,
            data: text,
            message: 'Nutrition categories fetched successfully'
        });
    } catch (error) {

        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};