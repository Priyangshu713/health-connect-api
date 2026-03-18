import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Track connection state for serverless environments (Vercel)
let isConnected = false; 

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not defined in environment variables');
        throw new Error('MONGO_URI is missing');
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState === 1;
        console.log(`MongoDB Connected: ${db.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // NEVER use process.exit(1) in a serverless function, it crashes the lambda
        throw error;
    }
};

export default connectDB;
