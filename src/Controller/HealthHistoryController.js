import HealthHistory from '../Database/Model/HealthHistory.js';

export const saveHealthHistory = async (req, res) => {
  try {
    const { userId, healthData, analysis, timeOfDay, dayOfWeek } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const newEntry = new HealthHistory({
      userId,
      healthData,
      analysis,
      timeOfDay,
      dayOfWeek
    });

    await newEntry.save();

    res.status(201).json({
      success: true,
      data: newEntry,
      message: 'Health history saved successfully'
    });
  } catch (error) {
    console.error('Error saving health history:', error);
    res.status(500).json({ success: false, message: 'Failed to save health history' });
  }
};

export const getHealthHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const history = await HealthHistory.find({ userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching health history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch health history' });
  }
};
