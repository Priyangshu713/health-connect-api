import AIMessageUsage from '../Database/Model/AIMessageUsage.js';

const FREE_MESSAGE_LIMIT = 2;
const WINDOW_DAYS = 15;

/**
 * Get the active usage window for a user.
 * If no active window exists, returns null.
 */
const getActiveWindow = async (userId) => {
    const now = new Date();
    return AIMessageUsage.findOne({
        userId,
        windowEnd: { $gt: now }
    }).sort({ windowEnd: -1 });
};

/**
 * Create a new 15-day usage window starting now.
 */
const createNewWindow = async (userId) => {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);
    return AIMessageUsage.create({
        userId,
        windowStart: now,
        windowEnd,
        messagesUsed: 0
    });
};

/**
 * GET /api/ai-usage-status
 * Returns the free user's current usage status:
 *   - messagesUsed, messagesRemaining, limit
 *   - isExhausted (boolean)
 *   - nextResetDate (when the window ends)
 *   - windowStart, windowEnd
 */
export const getAIUsageStatus = async (req, res) => {
    try {
        const userId = req.userId;

        let window = await getActiveWindow(userId);

        // If no active window, user hasn't used any messages yet in a current window
        if (!window) {
            return res.status(200).json({
                messagesUsed: 0,
                messagesRemaining: FREE_MESSAGE_LIMIT,
                limit: FREE_MESSAGE_LIMIT,
                windowDays: WINDOW_DAYS,
                isExhausted: false,
                nextResetDate: null,
                windowStart: null,
                windowEnd: null
            });
        }

        const messagesRemaining = Math.max(0, FREE_MESSAGE_LIMIT - window.messagesUsed);
        const isExhausted = window.messagesUsed >= FREE_MESSAGE_LIMIT;

        return res.status(200).json({
            messagesUsed: window.messagesUsed,
            messagesRemaining,
            limit: FREE_MESSAGE_LIMIT,
            windowDays: WINDOW_DAYS,
            isExhausted,
            nextResetDate: window.windowEnd,
            windowStart: window.windowStart,
            windowEnd: window.windowEnd
        });
    } catch (error) {
        console.error('Error getting AI usage status:', error);
        return res.status(500).json({ error: 'Failed to get usage status' });
    }
};

/**
 * Middleware: checkFreeUserLimit
 * For free-tier users, checks if they have remaining messages.
 * - If the user is paid (tier info passed via header), skips the check.
 * - If free and exhausted, returns 429 with the next reset date.
 * - If free and allowed, increments the counter and proceeds.
 */
export const checkFreeUserLimit = async (req, res, next) => {
    try {
        const userId = req.userId;
        const userTier = req.headers['x-user-tier'] || 'free';

        // Paid users bypass the limit
        if (userTier === 'lite' || userTier === 'pro') {
            return next();
        }

        // Free user: check usage
        let window = await getActiveWindow(userId);

        // No active window? Create one (first message in this period)
        if (!window) {
            window = await createNewWindow(userId);
        }

        // Check if limit exhausted
        if (window.messagesUsed >= FREE_MESSAGE_LIMIT) {
            return res.status(429).json({
                error: 'Free message limit reached',
                message: `You've used all ${FREE_MESSAGE_LIMIT} free messages for this ${WINDOW_DAYS}-day period.`,
                isExhausted: true,
                nextResetDate: window.windowEnd,
                messagesUsed: window.messagesUsed,
                limit: FREE_MESSAGE_LIMIT
            });
        }

        // Increment the counter
        window.messagesUsed += 1;
        await window.save();

        // Attach usage info to the request for downstream use
        req.aiUsage = {
            messagesUsed: window.messagesUsed,
            messagesRemaining: Math.max(0, FREE_MESSAGE_LIMIT - window.messagesUsed),
            limit: FREE_MESSAGE_LIMIT,
            windowEnd: window.windowEnd
        };

        next();
    } catch (error) {
        console.error('Error checking free user limit:', error);
        // Don't block the user on DB errors — let it pass
        next();
    }
};
