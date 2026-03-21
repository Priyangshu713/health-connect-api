import mongoose from 'mongoose';

const aiMessageUsageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    // Start of the current 15-day window
    windowStart: {
        type: Date,
        required: true
    },
    // End of the current 15-day window
    windowEnd: {
        type: Date,
        required: true
    },
    // Messages used in this window
    messagesUsed: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Compound index to quickly find the active window for a user
aiMessageUsageSchema.index({ userId: 1, windowEnd: -1 });

const AIMessageUsage = mongoose.model('AIMessageUsage', aiMessageUsageSchema);

export default AIMessageUsage;
