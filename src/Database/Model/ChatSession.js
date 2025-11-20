import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    modelType: {
        type: String,
        default: 'gemini-1.5-pro'
    },
    mode: {
        type: String,
        enum: ['chat', 'symptom-checker'],
        default: 'chat'
    },
    messages: [
        {
            role: {
                type: String,
                enum: ['user', 'model'],
                required: true
            },
            text: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30 // Expire after 30 days
    }
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
