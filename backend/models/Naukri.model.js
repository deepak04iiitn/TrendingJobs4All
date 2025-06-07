import mongoose from 'mongoose';

const NaukriSchema = new mongoose.Schema({
  job_title: {
    type: String,
    required: true,
    index: true // Index for faster job title searches
  },
  company: {
    type: String,
    required: true,
    index: true // Index for faster company searches
  },
  location: {
    type: [String],
    index: true // Index for faster location searches
  },
  min_exp: {
    type: Number,
    index: true // Index for faster experience-based queries
  },
  full_jd: String,
  apply_link: String,
  time: {
    type: Date,
    default: Date.now,
    index: true // Index for faster date-based queries
  },
  category: {
    type: String,
    index: true // Index for faster category-based queries
  }
}, {
  timestamps: true
});

// Compound index for common query patterns
NaukriSchema.index({ company: 1, time: -1 }); // For company-specific job listings
NaukriSchema.index({ category: 1, time: -1 }); // For category-specific job listings
NaukriSchema.index({ min_exp: 1, time: -1 }); // For experience-based job listings

const Naukri = mongoose.model('Naukri', NaukriSchema);

export default Naukri; 