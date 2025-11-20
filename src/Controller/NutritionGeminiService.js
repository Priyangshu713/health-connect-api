import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()
const apiKey = process.env.YOUR_API_KEY



export const analyzeNutrition = async (req, res) => {
    try {
        const { modelType, foodList } = req.body;
        // Validate user input
        if (!modelType || !foodList  ) {
            return res.status(400).json({ error: 'Invalid input data' });
        }
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: modelType,
        });

        const prompt = `
             You are a nutritionist AI. Please analyze the following food list and provide a nutritional breakdown.
             Format your response in a JSON object with the following structure:
             {
               "calories": "Total calories with unit (e.g., 450 kcal)",
               "protein": "Total protein with unit (e.g., 25g)",
               "carbs": "Total carbs with unit (e.g., 60g)",
               "fat": "Total fat with unit (e.g., 15g)",
               "fiber": "Total fiber with unit (e.g., 8g)",
               "recommendations": ["1-3 brief recommendations for improving this meal nutritionally"]
             }
             
             Food list: "${foodList}"
             
             Make your best estimate based on standard portion sizes if quantities are not specified.
             Be realistic in your assessment and provide reasonable estimates.
             Return ONLY a valid JSON object with no other text.
            `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({
            success: true,
            data: text,
            message: 'Nutrition analysis completed successfully'
        });

    } catch (error) {
        console.error('Error analyzing nutrition:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const fetchNutritionPlanFromGemini = async (req, res) => {
    try {
        const { modelType, allergies, age = 'Not specified', gender = 'Not specified', height = 'Not specified', weight = 'Not specified', bmi = 'Not specified', bmiCategory = 'Not specified', bloodGlucose = 'Not specified' } = req.body;
        // Validate user input
        if (!modelType || !allergies || !age || !gender || !height || !weight || !bmi || !bmiCategory || !bloodGlucose) { 
            return res.status(400).json({ error: 'Invalid input data' });
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelType,
        });
        const allergyString = allergies.length > 0
            ? `The patient has the following food allergies: ${allergies.join(', ')}.`
            : 'The patient has no reported food allergies.';

        const prompt = `
      You are a nutrition advisor AI. Please analyze the following health data and provide a personalized nutrition plan.
      Format your response in a JSON object with the following structure:
      {
        "categories": [
          {
            "category": "Category name (e.g., Low-Calorie, Nutrient-Dense Foods)",
            "foods": ["Food 1", "Food 2", "Food 3", "Food 4"],
            "benefits": "Brief description of benefits",
            "mealPlan": "Example meal plan/recipe using these foods"
          }
        ],
        "generalAdvice": "General nutrition advice for this person"
      }
      
      Patient health data:
      - Age: ${age || 'Not specified'}
      - Gender: ${gender || 'Not specified'}
      - Height: ${height || 'Not specified'} cm
      - Weight: ${weight || 'Not specified'} kg
      - BMI: ${bmi || 'Not specified'} (Category: ${bmiCategory || 'Not specified'})
      - Blood Glucose: ${bloodGlucose || 'Not specified'} mg/dL
      - ${allergyString}
      
      Provide:
      - 3-4 categories of foods appropriate for this person's health profile
      - For each category, list 4-6 specific foods that would be beneficial
      - Include a brief explanation of why these foods are beneficial
      - Include a simple meal plan or recipe example for each category
      - Avoid any foods mentioned in allergies list
      - Make sure to address blood sugar management if glucose is elevated
      - Make sure to address weight management if BMI is in overweight or obese range
      
      Return ONLY a valid JSON object with no other text.
    `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({
            success: true,
            data: text,
            message: 'Nutrition plan fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching nutrition plan:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

};

export const fetchRecipeFromGemini = async (req, res) => {
    try {

        const { modelType, mealIdea, allergies } = req.body;
        // Validate user input
        if (!modelType || !mealIdea || !allergies || !Array.isArray(allergies)) {
            return res.status(400).json({ error: 'Invalid input data' });
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelType,
        });


        const allergyString = allergies.length > 0
            ? `The user has the following food allergies: ${allergies.join(', ')}. Avoid these ingredients in the recipe.`
            : 'The user has no reported food allergies.';


        const prompt = `
                You are a culinary expert and nutrition advisor. Create a detailed recipe for the following meal idea:
                "${mealIdea}"
                
                ${allergyString}
                
                Format your response in a JSON object with the following structure:
                {
                    "title": "Recipe title",
                    "description": "Brief description of the dish",
                    "ingredients": ["Ingredient 1", "Ingredient 2", ...],
                    "instructions": ["Step 1", "Step 2", ...],
                    "preparationTime": "Total time needed to prepare and cook",
                    "nutritionInfo": "Brief nutritional information (calories, macros, etc.)"
                }
                
                Make sure the recipe is:
                - Healthy and nutritionally balanced
                - Detailed with specific quantities for ingredients
                - Broken down into clear, step-by-step instructions
                - Reasonably easy to prepare
                
                Return ONLY a valid JSON object with no other text.
                `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({
            success: true,
            data: text,
            message: 'Recipe fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching recipe:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const getFoodNutritionInfoFromGemini = async (req, res) => {
    try {
        const { modelType, foodName, } = req.body;
        // Validate user input
        if (!modelType || !foodName) {
            return res.status(400).json({ error: 'Invalid input data' });
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelType,
        });
        const prompt = `
                    You are a nutrition advisor AI. Please provide detailed nutritional information about the following food:
                    "${foodName}"
                    
                    Format your response in a JSON object with the following structure:
                    {
                        "name": "Proper name of the food",
                        "calories": "Caloric content per 100g",
                        "protein": "Protein content per 100g",
                        "carbs": "Carbohydrate content per 100g",
                        "fat": "Fat content per 100g",
                        "isVegan": boolean value indicating if the food is vegan,
                        "dishes": ["Popular dish 1", "Popular dish 2", "Popular dish 3"],
                        "preparationTips": "Tips for preparing this food to maximize nutritional value",
                        "benefits": "Health benefits of consuming this food"
                    }
                    
                    Make sure to provide:
                    - Accurate nutritional values with proper units
                    - At least 3 popular dishes that feature this food
                    - Specific preparation tips to maximize nutritional value
                    - Scientifically-backed health benefits
                    - Correct vegan status
                    
                    Return ONLY a valid JSON object with no other text.
                    `;


        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return res.status(200).json({
            success: true,
            data: text,
            message: 'Food nutrition info fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching food nutrition info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const generateMealFromIngredients = async (req, res) => {
    try {
        const { modelType, ingredients, servings, restrictions } = req.body;
        // Validate user input
        if (!modelType || !ingredients || !Array.isArray(ingredients) || !servings || !restrictions || !Array.isArray(restrictions) ) {
            return res.status(400).json({ error: 'Invalid input data' });
        }


        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelType,
        });

        const restrictionsString = restrictions.length > 0
            ? `The user has the following dietary restrictions or allergies: ${restrictions.join(', ')}. Avoid these ingredients.`
            : 'The user has no reported dietary restrictions or allergies.';

        const prompt = `
                    You are a professional chef and nutritionist. Create a complete meal idea using ONLY the following ingredients plus basic kitchen staples (salt, pepper, oil, basic herbs and spices):
                    ${ingredients.join(', ')}
                    
                    Number of servings: ${servings}
                    ${restrictionsString}
                    
                    Format your response in a JSON object with the following structure:
                    {
                        "title": "Name of the dish",
                        "description": "Brief description of the dish, including its flavor profile and key benefits",
                        "ingredients": [
                        {"name": "ingredient1", "amount": "quantity needed"},
                        {"name": "ingredient2", "amount": "quantity needed", "optional": true}
                        ],
                        "instructions": ["Step 1 instruction", "Step 2 instruction", ...],
                        "preparationTime": "Total time needed (prep + cooking)",
                        "nutritionInfo": {
                        "calories": "approximate per serving",
                        "protein": "approximate per serving", 
                        "carbs": "approximate per serving",
                        "fat": "approximate per serving"
                        },
                        "tips": "Optional cooking or serving suggestions"
                    }
                    
                    Make sure to:
                    1. ONLY use the ingredients provided plus basic pantry staples (salt, pepper, olive oil, common herbs & spices)
                    2. Mark any substitute or optional ingredients as optional
                    3. Provide accurate nutritional estimates
                    4. Provide clear, step-by-step instructions
                    5. Include cooking time and temperature information
                    6. Be creative but realistic with the available ingredients
                    7. Do not suggest adding major ingredients that the user hasn't listed
                    
                    Return ONLY a valid JSON object with no other text.
                    `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({
            success: true,
            data: text,
            message: 'Meal generated successfully'
        });
    } catch (error) {
        console.error('Error generating meal from ingredients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};