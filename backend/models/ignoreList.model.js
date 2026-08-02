import mongoose from 'mongoose';

// Maps to the `ignorelist` collection (blocklisted companies), populated by
// an external scraper (shared Mongo cluster). Read-only from this app.
const IgnoreListSchema = new mongoose.Schema({
  company: { type: String, index: true },
}, { strict: false });

const IgnoreList = mongoose.model('IgnoreList', IgnoreListSchema, 'ignorelist');

export default IgnoreList;
