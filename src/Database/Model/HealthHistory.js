import mongoose from 'mongoose';

const analysisSectionSchema = new mongoose.Schema({
  category: String,
  title: String,
  analysis: String,
  recommendation: String,
  score: Number
});

const healthHistorySchema = new mongoose.Schema({
  userId: {
    type: String, // We'll use email or a unique identifier from the frontend
    required: true,
    index: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  healthData: {
    age: Number,
    height: Number,
    weight: Number,
    gender: String,
    bloodGlucose: Number,
    bmi: Number,
    bmiCategory: String,
    sleepScore: Number,
    exerciseScore: Number,
    stressScore: Number,
    hydrationScore: Number,
    overallAdvancedScore: Number,
  },
  analysis: [analysisSectionSchema],
  timeOfDay: String,
  dayOfWeek: String
}, { timestamps: true });

const HealthHistory = mongoose.model('HealthHistory', healthHistorySchema);

export default HealthHistory;
