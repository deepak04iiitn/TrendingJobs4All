// Razorpay SDK rejections aren't Error instances — they're plain objects
// shaped like { statusCode, error: { code, description, ... } }. This also
// works for our own errorHandler()-created Error objects (statusCode + message),
// so callers can pass either kind through one helper.
//
// Razorpay's own statusCode (e.g. 401 "Authentication failed" when OUR
// server's API key/secret pair is wrong) must never be forwarded as-is —
// the frontend treats a 401 from this app as "your login session expired,"
// which would be actively misleading here. Upstream Razorpay failures
// always surface as 502, with Razorpay's description preserved for
// debugging.
export function respondWithError(res, error, fallbackMessage) {
  console.error(error);

  if (error?.statusCode && error?.error?.description) {
    return res.status(502).json({ message: `Payment gateway error: ${error.error.description}` });
  }
  if (error?.statusCode && error?.message) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return res.status(500).json({ message: fallbackMessage || 'Internal server error' });
}
