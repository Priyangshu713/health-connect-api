import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()
const apiKey = process.env.YOUR_API_KEY


export const checkIfFoodItem = async (req, res) => {
    try {

        const { query, modelType } = req.body;
        // Validate user input
        if (!query || !modelType) {
            return res.status(400).json({ error: 'Invalid input data' })
        }


        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: modelType,
        });

        const prompt = `
                You are a food identification expert. For the following item, determine if it is a food item that humans consume as nutrition:
                
                Item: "${query}"
                
                Provide a JSON response with this format:
                {
                    "isFood": true/false,
                    "components": ["component1", "component2", "etc"] (if not food, list primary materials/components)
                }
                
                Guidelines:
                - "isFood" should be true ONLY for items that are edible and commonly consumed by humans as food or drink.
                - For non-food items, "isFood" should be false.
                - For toys, objects, chemicals, and other non-edible items, return false.
                - Be strict in classification - if in doubt, classify as non-food.
                
                Return ONLY a valid JSON object with no other text.
                `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({
            success: true,
            data: text,
            message: 'Food identification completed successfully'
        });

    } catch (error) {
        console.error('Error in chackIfFoodItem:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}


export const getHealthCategorization = async (req, res) => {
    try {
        const { foodName, modelType } = req.body;
        // Validate user input
        if (!foodName || !modelType) {
            return res.status(400).json({ error: 'Invalid input data' })
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelType,
        });


        const prompt = `
                    As a nutrition expert, analyze the following food item: "${foodName}"
                    
                    Provide a JSON response with the following structure:
                    {
                        "category": "healthy" OR "unhealthy" OR "junk" OR "neutral", 
                        "ingredients": ["main ingredient 1", "main ingredient 2", ...],
                        "healthImplications": ["health implication 1", "health implication 2", ...],
                        "benefits": "Brief description of any health benefits"
                    }
                    
                    Guidelines:
                    - For "category": classify as "healthy" (nutritious foods that promote wellbeing), "unhealthy" (foods with some concerning nutritional aspects), "junk" (highly processed with little nutritional value), or "neutral" (moderate nutritional value)
                    - For "ingredients": list 3-5 main ingredients typically found in this food
                    - For "healthImplications": provide 3-4 brief points about potential health effects of regular consumption
                    - For "benefits": briefly describe any health benefits, or state "Limited health benefits" if appropriate
                    
                    Return ONLY a valid JSON object with no other text.
                    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return res.status(200).json({
            success: true,
            data: text,
            message: 'Health categorization completed successfully'
        });
    } catch (error) {
        console.error('Error in getHealthCategorization ');
        return res.status(500).json({ error: 'Internal Server Error' })
    }
};