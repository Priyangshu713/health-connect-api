// import { GoogleGenerativeAI } from '@google/generative-ai'
// import { v4 as uuidv4 } from 'uuid';
// import dotenv from 'dotenv'
// dotenv.config()
// const apiKey = process.env.YOUR_API_KEY

// const chatSections = {}


// export const createGeminiChatSession = async (req, res) => {
//     try {

//         const { modelType } = req.body;

//         console.log(`Creating new Gemini chat session with model: ${modelType}`);
//         const genAI = new GoogleGenerativeAI(apiKey);

//         // Define the base system instruction for health bot
//         const systemInstruction = "You are \"Health Connect Bot\". Your primary purpose is to provide users with general information related to health and medicine in a professional manner. Remember that you are not a medical professional, and the information you provide is for educational purposes only and should not be considered medical advice. For any health concerns, please consult with a qualified healthcare provider.\n\nPlease adhere to the following guidelines:\n\n* Be helpful, informative, empathetic, and understanding.\n* Maintain a professional and neutral tone.\n* Prioritize clarity and simplicity in your responses.\n* Structure your responses logically for easy readability.\n* Ask clarifying questions if needed to understand the user's query better.\n* Acknowledge your limitations as an AI and emphasize that you cannot provide diagnoses or treatment recommendations.\n* Advise users to consult healthcare professionals for diagnosis and treatment.\n* In case of potential medical emergencies, instruct users to call their local emergency number.\n* Do not ask for Personally Identifiable Information (PII).\n* Base your information on reliable medical sources and established scientific understanding.\n* Avoid speculation or unverified information.\n* Welcome feedback but note that you cannot directly implement changes.\n\nUse Markdown formatting in your responses: use **bold** for important terms, headers, and section titles. For lists, use * or - with proper indentation. Structure your answers with clear sections when appropriate.";

//         // Use the selected model or fall back to default
//         const model = genAI.getGenerativeModel({
//             model: modelType,
//             systemInstruction: systemInstruction,
//         });

//         // Check if this is a thinking model that should show its thought process
//         const isThinkingModel = modelType.includes("thinking") || modelType === "gemini-2.5-pro-exp-03-25";

//         // Adjust generation config based on model
//         const generationConfig = {
//             temperature: 0.7,
//             topP: 0.95,
//             topK: 64,
//             maxOutputTokens: isThinkingModel ? 65536 : 8192, // Larger for thinking models
//             responseMimeType: "text/plain",
//         };

//         try {
//             const initialHistory = [
//                 {
//                     role: "user",
//                     parts: [
//                         { text: "You are \"Health Connect Bot\". Your primary purpose is to provide users with general information related to health and medicine in a professional manner. Remember that you are not a medical professional, and the information you provide is for educational purposes only and should not be considered medical advice. For any health concerns, please consult with a qualified healthcare provider.\n\nRemember to always include a disclaimer that you are not a medical professional and users should consult with a qualified healthcare provider for any health concerns.\n\nAlways format your responses using Markdown: use **bold** for important terms, headers, and section titles. Use proper formatting for lists and structure your answers with clear sections when appropriate." },
//                     ],
//                 },
//                 {
//                     role: "model",
//                     parts: [
//                         { text: "Understood. I am \"Health Connect Bot\" and I will provide general health and medical information for educational purposes only. I will maintain a professional tone and emphasize that I am not a medical professional. All information I provide should not be considered a substitute for professional medical consultation. I will advise users to consult with qualified healthcare providers for any health concerns.\n\nI will use **bold** formatting for important terms, headers, and section titles, and will structure my responses with clear sections and proper formatting for lists when appropriate." },
//                     ],
//                 },
//             ];

//             // Special handling for Gemini 2.5 Pro model
//             if (modelType === "gemini-2.5-pro-exp-03-25") {
//                 initialHistory.push({
//                     role: "user",
//                     parts: [
//                         { text: "When responding to health questions, I'd like you to show your thinking process. First, think through the question step by step using available medical knowledge. Label this section as 'THINKING PROCESS:'. When you're ready to provide the actual response, use the exact phrase 'RESPONSE_BEGINS_HEALTH_CONNECT:' to indicate where your formal answer starts. This will help me understand how you arrive at your health guidance. Use Markdown formatting in your answer section: use **bold** for important terms and section titles." }]
//                 });
//                 initialHistory.push({
//                     role: "model",
//                     parts: [
//                         { text: "I understand. For health-related questions, I'll structure my responses in two parts:\n\n1. THINKING PROCESS: Where I'll analyze the question systematically using medical knowledge.\n2. RESPONSE_BEGINS_HEALTH_CONNECT: Where I'll provide a clear, concise response based on that analysis.\n\nThis format will give transparency to how I develop health guidance while ensuring my final answer remains accessible. In my answer section, I'll use **bold text** for important terms and section titles to improve readability.\n\nPlease note that regardless of my analysis, I'll always maintain that I'm not a medical professional, and my information should not replace professional medical advice." }]
//                 });
//             }
//             // For other thinking models
//             else if (isThinkingModel) {
//                 initialHistory.push({
//                     role: "user",
//                     parts: [
//                         { text: "When responding to health questions, I'd like you to show your thinking process. First, think through the question step by step using available medical knowledge. Label this section as 'THINKING PROCESS:'. When you're ready to provide the actual response, use the exact phrase 'RESPONSE_BEGINS_HEALTH_CONNECT:' to indicate where your formal answer starts. This will help me understand how you arrive at your health guidance. Use Markdown formatting in your answer section: use **bold** for important terms and section titles." }]
//                 });
//                 initialHistory.push({
//                     role: "model",
//                     parts: [
//                         { text: "I understand. For health-related questions, I'll structure my responses in two parts:\n\n1. THINKING PROCESS: Where I'll analyze the question systematically using medical knowledge.\n2. RESPONSE_BEGINS_HEALTH_CONNECT: Where I'll provide a clear, concise response based on that analysis.\n\nThis format will give transparency to how I develop health guidance while ensuring my final answer remains accessible. In my answer section, I'll use **bold text** for important terms and section titles to improve readability." }]
//                 });
//             }

//             const chatSession =await model.startChat({
//                 generationConfig,
//                 history: initialHistory,
//             });
            

//             // // if chat seccion are crossing our limit then delete the oldest one
//             // if (Object.keys(chatSections).length >= 10) {
//             //     chatSections.forEach((sessionId) => {
//             //         if (sessionId.time > Date.now()) {
//             //             // Delete the session if it has expired
//             //             chatSession.end();

//             //             delete chatSections[sessionId];
//             //         }
//             //     });
//             // }

//             for (const [id, sessionData] of Object.entries(chatSections)) {
//                 if (sessionData.time < Date.now()) {
//                     console.log(`Deleting expired session: ${id}`);
//                     delete chatSections[id];
//                 }
//             }
            
//             const sessionId = uuidv4();
//             // Store the chat session with a timeout of 10 minutes

//             // chatSections[sessionId] = {chatSession , modelType , time : Date.now() +(10*60*1000)};
//             chatSections[sessionId] = {
//                 chatSession: chatSession, // The actual session object
//                 modelType: modelType,
//                 time: Date.now() + (10 * 60 * 1000) // 10 minute expiry
//             };


//             return res.status(200).json({
//                 message: 'Gemini chat session created successfully',
//                 success: true,
//                 data: sessionId ,
//             }); 


//         } catch (error) {
//             console.error('Error creating Gemini chat session:', error);
//             return res.status(500).json({ error: 'Internal server error' });
//         }
//     }catch (error) {    
//         console.error('Error in createGeminiChatSession:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// };

// export const getGeminiChatSession = async(req, res) => {
//     try {
//         const { sessionId ,message} = req.body;
//         console.log(`Retrieving Gemini chat session with ID: ${sessionId} and model: ${modelType} and message: ${message}`);

//         if (!sessionId  || !message) {
//             return res.status(400).json({ error: 'Session ID is required' });
//         }

//         // FIX 3: Use the corrected variable name
//         const storedSession = chatSections[sessionId];

//         if (!storedSession) {
//             return res.status(404).json({ error: 'Chat session not found. It may have expired.' });
//         }
//         if (storedSession.time < Date.now()) {
//             console.log(`Attempt to use expired session: ${sessionId}. Deleting it now.`);
//             delete chatSections[sessionId]; // Clean up the expired session
//             return res.status(404).json({ error: 'Chat session has expired. Please start a new one.' });
//         }


//         // const result = await chatSession.sendMessage(message);
//         // const responseText = result.response.text();
//         const result = await storedSession.chatSession.sendMessage(message);
//         const responseText = result.response.text();


//         return res.status(200).json({
//             message: 'Chat session retrieved successfully',
//             success: true,
//             data: responseText,
//         });
//     } catch (error) {
//         console.error('Error retrieving Gemini chat session:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// }

import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.YOUR_API_KEY;

const chatSections = {};


export const createGeminiChatSession = async (req, res) => {
    try {
        // **FIX**: We will default to a valid model if the client sends an invalid one,
        // but for this fix, we assume the client will now send a valid name like 'gemini-1.5-pro'.
        let { modelType } = req.body;

        // **VALIDATION**: Ensure a valid model is used. Default to 'gemini-1.5-pro' if an invalid one is passed.
        // You should update your client-side to send a valid model name.
        if (modelType !== 'gemini-1.5-pro' && !modelType.includes('flash')) {
             console.log(`Invalid or unsupported model '${modelType}' requested. Defaulting to 'gemini-1.5-pro'.`);
             modelType = 'gemini-1.5-pro';
        }


        console.log(`Creating new Gemini chat session with model: ${modelType}`);
        const genAI = new GoogleGenerativeAI(apiKey);

        const systemInstruction = "You are \"Health Connect Bot\". Your primary purpose is to provide users with general information related to health and medicine in a professional manner. Remember that you are not a medical professional, and the information you provide is for educational purposes only and should not be considered medical advice. For any health concerns, please consult with a qualified healthcare provider.\n\nPlease adhere to the following guidelines:\n\n* Be helpful, informative, empathetic, and understanding.\n* Maintain a professional and neutral tone.\n* Prioritize clarity and simplicity in your responses.\n* Structure your responses logically for easy readability.\n* Ask clarifying questions if needed to understand the user's query better.\n* Acknowledge your limitations as an AI and emphasize that you cannot provide diagnoses or treatment recommendations.\n* Advise users to consult healthcare professionals for diagnosis and treatment.\n* In case of potential medical emergencies, instruct users to call their local emergency number.\n* Do not ask for Personally Identifiable Information (PII).\n* Base your information on reliable medical sources and established scientific understanding.\n* Avoid speculation or unverified information.\n* Welcome feedback but note that you cannot directly implement changes.\n\nUse Markdown formatting in your responses: use **bold** for important terms, headers, and section titles. For lists, use * or - with proper indentation. Structure your answers with clear sections when appropriate.";

        const model = genAI.getGenerativeModel({
            model: modelType,
            systemInstruction: systemInstruction,
        });

        // **FIX**: The logic for "thinking" models is updated. We'll now consider 'gemini-1.5-pro' as a thinking model.
        const isThinkingModel = modelType.includes("thinking") || modelType === "gemini-1.5-pro";

        const generationConfig = {
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192, // Standardized for modern models
            responseMimeType: "text/plain",
        };

        try {
            const initialHistory = [
                {
                    role: "user",
                    parts: [
                        { text: "You are \"Health Connect Bot\". Your primary purpose is to provide users with general information related to health and medicine in a professional manner. Remember that you are not a medical professional, and the information you provide is for educational purposes only and should not be considered medical advice. For any health concerns, please consult with a qualified healthcare provider.\n\nRemember to always include a disclaimer that you are not a medical professional and users should consult with a qualified healthcare provider for any health concerns.\n\nAlways format your responses using Markdown: use **bold** for important terms, headers, and section titles. Use proper formatting for lists and structure your answers with clear sections when appropriate." },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        { text: "Understood. I am \"Health Connect Bot\" and I will provide general health and medical information for educational purposes only. I will maintain a professional tone and emphasize that I am not a medical professional. All information I provide should not be considered a substitute for professional medical consultation. I will advise users to consult with qualified healthcare providers for any health concerns.\n\nI will use **bold** formatting for important terms, headers, and section titles, and will structure my responses with clear sections and proper formatting for lists when appropriate." },
                    ],
                },
            ];
            
            // **FIX**: Updated the condition to use the valid model name.
            if (isThinkingModel) {
                initialHistory.push({
                    role: "user",
                    parts: [
                        { text: "When responding to health questions, I'd like you to show your thinking process. First, think through the question step by step using available medical knowledge. Label this section as 'THINKING PROCESS:'. When you're ready to provide the actual response, use the exact phrase 'RESPONSE_BEGINS_HEALTH_CONNECT:' to indicate where your formal answer starts. This will help me understand how you arrive at your health guidance. Use Markdown formatting in your answer section: use **bold** for important terms and section titles." }]
                });
                initialHistory.push({
                    role: "model",
                    parts: [
                        { text: "I understand. For health-related questions, I'll structure my responses in two parts:\n\n1. THINKING PROCESS: Where I'll analyze the question systematically using medical knowledge.\n2. RESPONSE_BEGINS_HEALTH_CONNECT: Where I'll provide a clear, concise response based on that analysis.\n\nThis format will give transparency to how I develop health guidance while ensuring my final answer remains accessible. In my answer section, I'll use **bold text** for important terms and section titles to improve readability.\n\nPlease note that regardless of my analysis, I'll always maintain that I'm not a medical professional, and my information should not replace professional medical advice." }]
                });
            }

            const chatSession = await model.startChat({
                generationConfig,
                history: initialHistory,
            });

            for (const [id, sessionData] of Object.entries(chatSections)) {
                if (sessionData.time < Date.now()) {
                    console.log(`Deleting expired session: ${id}`);
                    delete chatSections[id];
                }
            }
            
            const sessionId = uuidv4();
            
            chatSections[sessionId] = {
                chatSession: chatSession,
                modelType: modelType,
                time: Date.now() + (30 * 60 * 1000)
            };

            return res.status(200).json({
                message: 'Gemini chat session created successfully',
                success: true,
                data: sessionId,
            }); 

        } catch (error) {
            // This is where the 404 error was likely caught before.
            console.error('Error starting chat or creating session:', error);
            // Provide a more specific error message to the client
            if (error.message.includes('404')) {
                 return res.status(400).json({ error: `The model '${modelType}' is not a valid or accessible model. Please use a valid model name.` });
            }
            return res.status(500).json({ error: 'Internal server error while starting chat session' });
        }
    } catch (error) {    
        console.error('Error in createGeminiChatSession:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getGeminiChatSession = async (req, res) => {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({ error: 'Session ID and message are required' });
        }

        const storedSession = chatSections[sessionId];

        if (!storedSession) {
            return res.status(404).json({ error: 'Chat session not found. It may have expired.' });
        }
        
        if (storedSession.time < Date.now()) {
            console.log(`Attempt to use expired session: ${sessionId}. Deleting it now.`);
            delete chatSections[sessionId];
            return res.status(404).json({ error: 'Chat session has expired. Please start a new one.' });
        }

        console.log(`Retrieving Gemini chat session with ID: ${sessionId} and model: ${storedSession.modelType} and message: ${message}`);

        const result = await storedSession.chatSession.sendMessage(message);
        const responseText = result.response.text();

        return res.status(200).json({
            message: 'Chat session retrieved successfully',
            success: true,
            data: responseText,
        });
    } catch (error) {
        console.error('Error retrieving Gemini chat session:', error);
        // This is where the error from the log was thrown.
        if (error.constructor.name === 'GoogleGenerativeAIFetchError') {
             return res.status(502).json({ error: 'Failed to get a response from the AI model. The model may be unavailable or the request failed.' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
}