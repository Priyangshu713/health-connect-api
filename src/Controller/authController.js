
export const registerUser = async (req, res) => {
    res.status(200).json({ message: 'User registered successfully' });
};

export const loginUser = async (req, res) => {
    res.status(200).json({ message: 'User logged in successfully' });
};

export const getAlldoctor = async (req, res) => {
    res.status(200).json({ message: 'All doctors fetched successfully' });
};
