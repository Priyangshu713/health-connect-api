import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

import router from './Route/index.js'
import connectDB from './Database/Index.js'

// Load env vars BEFORE creating the Express app
dotenv.config()

const app = express()

const PORT = process.env.PORT || 4000

// ── CORS — must be FIRST middleware (before express.json) ─────────────────────
const allowedOrigins = [
    'https://medibridgeofficial.vercel.app',
    'https://health-connect-app-main.vercel.app',
    'https://medibridge.qzz.io',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
]

const corsOptions = {
    origin: (origin, callback) => {
        // Allow Postman / server-to-server (no origin header)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        // Allow only your specific Vercel project preview deployments
        if (/^https:\/\/.*-(medibridgeofficial|health-connect)\.vercel\.app$/.test(origin)) return callback(null, true)
        return callback(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-tier']
}

// CORS must be applied before any other middleware
app.use(cors(corsOptions))

// Rate limiting — prevent API abuse
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        const aiRoutes = ['/api/send-message', '/api/health-report', '/api/advanced-health-analysis', '/api/nutrition-analysis', '/api/analyze-wellness', '/api/health-insights'];
        return aiRoutes.some(route => req.path.startsWith(route));
    },
    message: { error: 'Too many requests, please try again later.' }
})

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 AI requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many AI requests. Please wait before trying again.' }
})

app.use(generalLimiter)
app.use('/api/send-message', aiLimiter)
app.use('/api/health-report', aiLimiter)
app.use('/api/advanced-health-analysis', aiLimiter)
app.use('/api/nutrition-analysis', aiLimiter)
app.use('/api/analyze-wellness', aiLimiter)
app.use('/api/health-insights', aiLimiter)

// Body parsers come AFTER CORS
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', router)

app.get('/', (req, res) => {
    res.send('Welcome to MediBridge API')
})

await connectDB().then(() => {
    console.log('Database connected successfully')
}).catch((error) => {
    console.error('Database connection failed:', error)
})

// Only listen on a port if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

// // Export for Vercel serverless
export default app
