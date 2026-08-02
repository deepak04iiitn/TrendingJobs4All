import Razorpay from 'razorpay';

// Constructed lazily (not at module-import time): ESM imports across the app
// resolve before backend/index.js's own dotenv.config() call runs, so eagerly
// building this client at import time would read undefined env vars.
let instance = null;

function getRazorpayClient() {
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
}

const razorpay = new Proxy({}, {
  get(_target, prop) {
    const client = getRazorpayClient();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export default razorpay;
