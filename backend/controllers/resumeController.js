import Resume from '../models/Resume.js';

// Create or update resume
export const createOrUpdateResume = async (req, res) => {
    try {
        const { selectedFields, resumeData } = req.body;
        const userId = req.user.id; // Using req.user.id instead of req.user._id

        if (!selectedFields || selectedFields.length !== 6) {
            return res.status(400).json({ message: 'Exactly 6 fields must be selected' });
        }

        let resume = await Resume.findOne({ userId });
        
        if (resume) {
            resume.selectedFields = selectedFields;
            resume.resumeData = resumeData;
            await resume.save();
        } else {
            resume = await Resume.create({
                userId,
                selectedFields,
                resumeData
            });
        }

        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's resume
export const getResume = async (req, res) => {
    try {
        const userId = req.user.id;
        const resume = await Resume.findOne({ userId });
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete resume
export const deleteResume = async (req, res) => {
    try {
        const userId = req.user.id;
        const resume = await Resume.findOneAndDelete({ userId });
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 