
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { z } from 'zod';
import ChatSession from '../Database/Model/ChatSession.js';

dotenv.config();
const apiKey = process.env.YOUR_API_KEY;
const ai = new GoogleGenAI({ apiKey });

// Zod Schemas
const createSessionSchema = z.object({
    modelType: z.string().default('gemini-flash-lite-latest'),
    mode: z.string().optional().default('chat'),
});

const sendMessageSchema = z.object({
    sessionId: z.string().min(1, "Session ID is required"),
    message: z.string().min(1, "Message is required"),
});

const SYSTEM_INSTRUCTION = "You are \"Health Connect Bot\". Your primary purpose is to provide users with general information related to health and medicine in a professional manner. Remember that you are not a medical professional, and the information you provide is for educational purposes only and should not be considered medical advice. For any health concerns, please consult with a qualified healthcare provider.\n\nPlease adhere to the following guidelines:\n\n* Be helpful, informative, empathetic, and understanding.\n* Maintain a professional and neutral tone.\n* Prioritize clarity and simplicity in your responses.\n* Structure your responses logically for easy readability.\n* Ask clarifying questions if needed to understand the user's query better.\n* Acknowledge your limitations as an AI and emphasize that you cannot provide diagnoses or treatment recommendations.\n* Advise users to consult healthcare professionals for diagnosis and treatment.\n* In case of potential medical emergencies, instruct users to call your local emergency number.\n* Do not ask for Personally Identifiable Information (PII).\n* Base your information on reliable medical sources and established scientific understanding.\n* Avoid speculation or unverified information.\n* Welcome feedback but note that you cannot directly implement changes.\n\nUse Markdown formatting in your responses: use **bold** for important terms, headers, and section titles. For lists, use * or - with proper indentation. Structure your answers with clear sections when appropriate.";

const THINKING_INSTRUCTION = "\n\nIMPORTANT: You are using a thinking process. You MUST explicitly show your thinking process. Start your thought process with 'THINKING PROCESS:' and end it with 'RESPONSE_BEGINS_HEALTH_CONNECT:'.\n\nYour thinking process should be:\n1.  **Detailed and Step-by-Step:** Break down the user's query into components.\n2.  **Internal Monologue:** Ask yourself questions to clarify the user's intent and potential medical context.\n3.  **Fact-Checking:** Verify your internal knowledge against the query.\n4.  **Formulation:** Draft the response structure before finalizing.\n\nExample format:\nTHINKING PROCESS:\n- User is asking about [Topic].\n- Key medical terms identified: [Term 1], [Term 2].\n- Potential risks: [Risk].\n- Strategy: Provide general overview, then specific advice, then disclaimer.\n- Self-Correction: Ensure I don't diagnose [Condition].\nRESPONSE_BEGINS_HEALTH_CONNECT:\n[Final Answer]";

const SYMPTOM_CHECKER_INSTRUCTION = `You are "Health Connect Symptom Checker". Your goal is to perform a preliminary medical triage assessment.
Follow this structured approach:
1. **Gather Information:** Ask specific questions about the user's main symptom, onset, duration, severity (1-10), and associated symptoms. Ask one question at a time.
2. **Red Flags:** Immediately check for "red flag" symptoms (e.g., chest pain, difficulty breathing, severe bleeding, sudden weakness). If present, advise immediate emergency care.
3. **Assessment:** Based on the information, provide a list of potential causes (differentials) but emphasize this is NOT a diagnosis.
4. **Recommendation:** Recommend a course of action:
   - **Emergency:** Call emergency services.
   - **Urgent:** See a doctor within 24 hours.
   - **Routine:** Schedule an appointment.
   - **Self-Care:** Home remedies and monitoring.

Disclaimer: Always end with "I am an AI, not a doctor. This is for informational purposes only."`;

export const createGeminiChatSession = async (req, res) => {
    try {
        // Validate request body
        const validationResult = createSessionSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Invalid request data',
                details: validationResult.error.format()
            });
        }

        let { modelType, mode } = validationResult.data;

        // Validate allowed models
        const allowedModels = ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-2.5-flash'];
        if (!allowedModels.includes(modelType)) {
            console.log(`Invalid model '${modelType}' requested. Defaulting to 'gemini-flash-lite-latest'.`);
            modelType = 'gemini-flash-lite-latest';
        }

        // Validate mode
        if (!mode) mode = 'chat';
        const allowedModes = ['chat', 'symptom-checker'];
        if (!allowedModes.includes(mode)) {
            mode = 'chat';
        }

        console.log(`Creating new Gemini chat session with model: ${modelType}, mode: ${mode}`);

        const sessionId = uuidv4();

        // Save session to MongoDB
        try {
            await ChatSession.create({
                sessionId,
                modelType,
                mode,
                messages: []
            });
        } catch (dbError) {
            console.error('Error saving chat session to DB:', dbError);
            return res.status(500).json({ error: 'Failed to create chat session in database' });
        }

        return res.status(200).json({
            message: 'Gemini chat session created successfully',
            success: true,
            data: sessionId,
        });

    } catch (error) {
        console.error('Error in createGeminiChatSession:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getGeminiChatSession = async (req, res) => {
    try {
        // Validate request body
        const validationResult = sendMessageSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Invalid request data',
                details: validationResult.error.format()
            });
        }

        const { sessionId, message } = validationResult.data;

        // Retrieve session from DB
        const session = await ChatSession.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({ error: 'Chat session not found. It may have expired.' });
        }

        console.log(`Streaming response for session: ${sessionId} with model: ${session.modelType}, mode: ${session.mode}`);

        // Save user message to DB
        try {
            session.messages.push({ role: 'user', text: message });
            await session.save();
        } catch (dbError) {
            console.error('Error saving user message to DB:', dbError);
        }

        // Prepare contents for API
        // Map DB messages to API format
        // Note: @google/genai expects 'user' and 'model' roles.
        const contents = session.messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        // Configure model and tools
        const model = session.modelType;

        // Select system instruction based on mode
        let systemInstructionText = SYSTEM_INSTRUCTION;
        if (session.mode === 'symptom-checker') {
            systemInstructionText = SYMPTOM_CHECKER_INSTRUCTION;
        } else if (model === 'gemini-2.5-flash') {
            systemInstructionText += THINKING_INSTRUCTION;
        }

        let config = {
            systemInstruction: {
                parts: [{ text: systemInstructionText }]
            }
        };

        if (model === 'gemini-2.5-flash') {
            config = {
                ...config,
                thinkingConfig: {
                    thinkingBudget: 24576,
                }
            };
        }

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/plain');
        // res.setHeader('Transfer-Encoding', 'chunked'); // Node.js handles this automatically with res.write

        try {
            const response = await ai.models.generateContentStream({
                model,
                config,
                contents,
            });

            let fullResponse = '';

            for await (const chunk of response) {
                let chunkText = '';

                // Try to get text from chunk
                if (typeof chunk.text === 'function') {
                    chunkText = chunk.text();
                } else if (chunk.text) {
                    chunkText = chunk.text;
                }

                // Check for native thinking parts if text is empty or to supplement
                const parts = chunk.candidates?.[0]?.content?.parts;
                if (parts && parts.length > 0) {
                    for (const part of parts) {
                        // If we find a part that seems to be a thought (e.g., has 'thought' property or specific role)
                        // Note: The SDK might not expose 'thought' property directly on the part object in all versions.
                        // We rely on the system instruction to force thoughts into the text stream as "THINKING PROCESS: ..."
                        // But if the model returns a separate part for thinking, we want to capture it.
                        if (part.thought) {
                            chunkText += `THINKING PROCESS: ${part.text}\n`;
                        }
                    }
                }

                if (chunkText) {
                    fullResponse += chunkText;
                    res.write(chunkText);
                }
            }

            res.end();

            // Save model response to DB
            try {
                await ChatSession.findOneAndUpdate(
                    { sessionId },
                    {
                        $push: {
                            messages: { role: 'model', text: fullResponse }
                        }
                    }
                );
            } catch (dbError) {
                console.error('Error saving model response to DB:', dbError);
            }

        } catch (apiError) {
            console.error('Error calling Gemini API:', apiError);
            if (!res.headersSent) {
                return res.status(502).json({ error: 'Failed to get a response from the AI model.' });
            } else {
                // If headers sent, we can't send JSON error, but we can end the stream
                res.end();
            }
        }

    } catch (error) {
        console.error('Error retrieving Gemini chat session:', error);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal server error' });
        } else {
            res.end();
        }
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const session = await ChatSession.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({ error: 'Chat session not found' });
        }

        return res.status(200).json({
            success: true,
            data: session.messages
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};