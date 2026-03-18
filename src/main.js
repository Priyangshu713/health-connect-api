import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config(
    {
        debug: false,
        path: './.env',

    }
)

import router from './Route/index.js'
import connectDB from './Database/Index.js'

// Connect to MongoDB
connectDB();

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
const allowedOrigins = [
    'https://medibridgeofficial.vercel.app',
    'https://health-connect-app-main.vercel.app',
    'https://medibridge.qzz.io',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        return callback(new Error('CORS: origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.options('*', cors());
app.use(express.urlencoded({ extended: true }))

app.use('/api', router)

app.get('/', (req, res) => {
    res.send('Welcome to MediBridge API')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


