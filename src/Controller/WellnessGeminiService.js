import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import NodeCache from 'node-cache';
import crypto from 'crypto';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
const genAI = new GoogleGenAI({ apiKey: process.env.YOUR_API_KEY });

// Zod Schema for validation
const journalEntrySchema = z.object({
    entry: z.string().min(10, 'Journal entry must be at least 10 characters'),
    date: z.string().optional(),
});

const SYSTEM_INSTRUCTION = `You are "Health Connect Wellness Companion". Your role is to analyze mood and mental wellness journal entries.

Your analysis should:
1. **Sentiment Analysis:** Identify the overall emotional tone (positive, negative, neutral, mixed).
2. **Emotion Detection:** Identify specific emotions expressed (joy, sadness, anxiety, stress, frustration, gratitude, etc.).
3. **Stress Triggers:** Highlight potential stressors mentioned (work, relationships, health, finances, etc.).
4. **Patterns:** If the user has made multiple entries, note any recurring themes or changes in mood over time.
5. **Coping Strategies:** Based on the analysis, suggest personalized coping strategies, mindfulness exercises, or positive affirmations.

Format your response in markdown with clear sections:
- **Sentiment Summary**
- **Emotions Detected**
- **Potential Stressors**
- **Recommended Coping Strategies**

Be empathetic, supportive, and non-judgmental. Encourage the user to seek professional help if they express severe distress or suicidal thoughts.`;

export const analyzeWellnessEntry = async (req, res) => {
    try {
        // Validate request body
        const validationResult = journalEntrySchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Invalid request data',
                details: validationResult.error.format()
            });
        }

        const { entry, date } = validationResult.data;

        // Generate cache key
        const cacheKey = crypto.createHash('md5').update(JSON.stringify({ entry, date })).digest('hex');

        // Check cache
        const cachedResponse = cache.get(cacheKey);
        if (cachedResponse) {
            console.log('Returning cached wellness analysis');
            return res.status(200).json({
                success: true,
                data: cachedResponse,
                cached: true
            });
        }

        console.log('Analyzing wellness journal entry');

        const prompt = date
            ? `Date: ${date}\n\nJournal Entry:\n${entry}`
            : `Journal Entry:\n${entry}`;

        const config = {
            systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }]
            }
        };

        const contents = [{
            role: 'user',
            parts: [{ text: prompt }]
        }];

        const result = await genAI.models.generateContent({
            model: 'gemini-flash-lite-latest',
            config,
            contents
        });

        const responseText = result.text || result.response?.text() || '';

        const analysisData = {
            analysis: responseText,
            date: date || new Date().toISOString(),
            timestamp: Date.now()
        };

        // Cache the response
        cache.set(cacheKey, analysisData);

        return res.status(200).json({
            success: true,
            data: analysisData,
            cached: false
        });

    } catch (error) {
        console.error('Error analyzing wellness entry:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
