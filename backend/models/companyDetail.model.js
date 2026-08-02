import mongoose from 'mongoose';

// Maps to the `company_details` collection, populated by an external scraper
// (shared Mongo cluster). Read-only from this app — never write to it.
const CompanyDetailSchema = new mongoose.Schema({
  company: { type: String, index: true },
  follower: { type: Number, default: 0 },
}, { strict: false });

const CompanyDetail = mongoose.model('CompanyDetail', CompanyDetailSchema, 'company_details');

export default CompanyDetail;
