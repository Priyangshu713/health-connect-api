import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'


import router from './Route/index.js'
import connectDB from './Database/Index.js'

// Middleware to ensure DB connection (especially important for Vercel lambdas)

const app = express()

dotenv.config()

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
        // Allow any Vercel preview deployment
        if (origin.endsWith('.vercel.app')) return callback(null, true)
        return callback(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}

// CORS must be applied before any other middleware
app.use(cors(corsOptions))

// Body parsers come AFTER CORS
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', router)

app.get('/', (req, res) => {
    res.send('Welcome to MediBridge API')
})

// Only listen on a port if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}


await connectDB().then(() => {
    console.log('Database connected successfully')
}).catch((error) => {
    console.error('Database connection failed:', error)
})

// // Export for Vercel serverless
// export default app
