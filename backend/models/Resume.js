import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    selectedFields: [{
        type: String,
        required: true,
        enum: ['Header', 'Objective', 'Education', 'Technical Skills', 'Projects', 
               'Work Experience', 'Positions of Responsibility', 'Certifications', 
               'Achievements', 'Research/Publications', 'Languages', 'Hobbies']
    }],
    resumeData: {
        Header: {
            name: String,
            email: String,
            phone: String,
            location: String,
            linkedin: String,
            github: String
        },
        Objective: String,
        Education: [{
            degree: String,
            institution: String,
            year: String,
            gpa: String,
            description: String
        }],
        'Technical Skills': [String],
        Projects: [{
            title: String,
            description: String,
            technologies: [String],
            link: String,
            sourceCode: String
        }],
        'Work Experience': [{
            company: String,
            position: String,
            duration: String,
            description: String
        }],
        'Positions of Responsibility': [{
            title: String,
            organization: String,
            duration: String,
            description: String
        }],
        Certifications: [{
            name: String,
            issuer: String,
            date: String,
            link: String
        }],
        Achievements: [String],
        'Research/Publications': [{
            title: String,
            authors: String,
            publication: String,
            date: String,
            link: String
        }],
        Languages: [{
            language: String,
            proficiency: String
        }],
        Hobbies: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
resumeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Resume', resumeSchema); 