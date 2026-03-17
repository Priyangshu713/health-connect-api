import mongoose from 'mongoose';

const analysisSectionSchema = new mongoose.Schema({
  category: String,
  title: String,
  analysis: String,
  recommendation: String,
  score: Number
}, { _id: false });

const userHealthProfileSchema = new mongoose.Schema({
  userId: {
    type: String, // User email — same identifier used across the app
    required: true,
    unique: true,
    index: true
  },
  healthData: {
    age: Number,
    height: Number,
    weight: Number,
    gender: String,
    bloodGlucose: Number,
    bmi: Number,
    bmiCategory: String,
    completedProfile: Boolean,
    completedAdvancedAnalysis: Boolean,
    sleepScore: Number,
    exerciseScore: Number,
    stressScore: Number,
    hydrationScore: Number,
    overallAdvancedScore: Number,
    savedAnalysis: [analysisSectionSchema]
  },
  geminiTier: {
    type: String,
    enum: ['free', 'lite', 'pro'],
    default: 'free'
  },
  appointmentCredits: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const UserHealthProfile = mongoose.model('UserHealthProfile', userHealthProfileSchema);

export default UserHealthProfile;
