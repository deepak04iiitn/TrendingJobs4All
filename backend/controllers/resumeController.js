import Resume from '../models/Resume.js';

// Create new resume
export const createResume = async (req, res) => {
    try {
        const { selectedFields, resumeData } = req.body;
        const userId = req.user.id;

        if (!selectedFields || !resumeData) {
            return res.status(400).json({ message: 'Selected fields and resume data are required' });
        }

        const resume = await Resume.create({
            userId,
            selectedFields,
            resumeData
        });

        res.status(201).json(resume);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all user's resumes
export const getResumes = async (req, res) => {
    try {
        const userId = req.user.id;
        const resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });
        res.status(200).json(resumes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get specific resume
export const getResume = async (req, res) => {
    try {
        const userId = req.user.id;
        const resumeId = req.params.id;
        
        const resume = await Resume.findOne({ _id: resumeId, userId });
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update resume
export const updateResume = async (req, res) => {
    try {
        const { selectedFields, resumeData } = req.body;
        const userId = req.user.id;
        const resumeId = req.params.id;

        if (!selectedFields || !resumeData) {
            return res.status(400).json({ message: 'Selected fields and resume data are required' });
        }

        const resume = await Resume.findOneAndUpdate(
            { _id: resumeId, userId },
            { selectedFields, resumeData },
            { new: true }
        );

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
        const resumeId = req.params.id;

        const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 