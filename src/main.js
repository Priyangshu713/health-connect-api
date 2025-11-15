import express from 'express'
import dotenv from 'dotenv'
import  cors from 'cors'

import router from './Route/index.js'
dotenv.config(
    {
        debug: false,
        path: './.env',

    }
)

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

app.use('/api', router)

app.get('/', (req, res) => {
    res.send('Welcome to Health Connect API')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


