import UserHealthProfile from '../Database/Model/UserHealthProfile.js';

/**
 * Save (upsert) the user's health profile.
 * Called whenever health data changes on the frontend.
 */
export const saveUserHealthProfile = async (req, res) => {
  try {
    const { userId, healthData, geminiTier, appointmentCredits } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID (email) is required' });
    }

    const profile = await UserHealthProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        healthData,
        geminiTier: geminiTier || 'free',
        appointmentCredits: appointmentCredits || 0
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Health profile saved successfully'
    });
  } catch (error) {
    console.error('Error saving user health profile:', error);
    res.status(500).json({ success: false, message: 'Failed to save health profile' });
  }
};

/**
 * Get the user's health profile.
 * Called on login to restore health data from the server.
 */
export const getUserHealthProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID (email) is required' });
    }

    const profile = await UserHealthProfile.findOne({ userId });

    if (!profile) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No health profile found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching user health profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch health profile' });
  }
};
