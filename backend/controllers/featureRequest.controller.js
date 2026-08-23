import FeatureRequest from '../models/featureRequest.model.js';
import { errorHandler } from '../utils/error.js';
import { notifyFoundersFeedbackReceived } from '../utils/feedbackAlert.js';

export const createFeatureRequest = async (req, res, next) => {
  try {
    const { email, description, pageUrl, userAgent } = req.body;
    if (!email || !description) {
      return next(errorHandler(400, 'Email and description are required'));
    }
    const request = await FeatureRequest.create({ email, description, pageUrl, userAgent });
    notifyFoundersFeedbackReceived({
      type: 'feature',
      email: request.email,
      description: request.description,
      pageUrl: request.pageUrl,
      userAgent: request.userAgent,
      reportId: String(request._id),
      submittedAt: request.createdAt,
    }).catch((err) => {
      console.error('[feedback-alert] feature request notify failed:', err?.message || err);
    });
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

export const listFeatureRequests = async (req, res, next) => {
  try {
    if (!req.user?.isUserAdmin) {
      return next(errorHandler(403, 'Admin access required'));
    }

    const {
      search = '',
      status,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit)));
    const parsedPage = Math.max(1, parseInt(page));

    const filter = {};
    if (status && ['Pending', 'Implemented'].includes(status)) {
      filter.status = status;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      FeatureRequest.find(filter)
        .sort(sort)
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit),
      FeatureRequest.countDocuments(filter),
    ]);

    res.status(200).json({ items, total, page: parsedPage, limit: parsedLimit });
  } catch (error) {
    next(error);
  }
};

export const updateFeatureStatus = async (req, res, next) => {
  try {
    if (!req.user?.isUserAdmin) {
      return next(errorHandler(403, 'Admin access required'));
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!['Pending', 'Implemented'].includes(status)) {
      return next(errorHandler(400, 'Invalid status'));
    }
    const updated = await FeatureRequest.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updated) return next(errorHandler(404, 'Feature request not found'));
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};


