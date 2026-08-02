import mongoose from 'mongoose';

// Idempotency log for Razorpay webhook deliveries — Razorpay retries on any
// non-2xx response, so redelivered events must be safely ignorable.
const WebhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  event: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
});

const WebhookEvent = mongoose.model('WebhookEvent', WebhookEventSchema);

export default WebhookEvent;
