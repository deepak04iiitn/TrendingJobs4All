import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    selectedFields: {
        type: [String],
        required: true,
    },
    resumeData: {
        type: Object,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Update the updatedAt field before saving
resumeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume; 