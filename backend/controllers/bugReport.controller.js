import BugReport from '../models/bugReport.model.js';
import { errorHandler } from '../utils/error.js';
import { notifyFoundersFeedbackReceived } from '../utils/feedbackAlert.js';

export const createBugReport = async (req, res, next) => {
  try {
    const { email, description, pageUrl, userAgent } = req.body;
    if (!email || !description) {
      return next(errorHandler(400, 'Email and description are required'));
    }
    const report = await BugReport.create({ email, description, pageUrl, userAgent });
    notifyFoundersFeedbackReceived({
      type: 'bug',
      email: report.email,
      description: report.description,
      pageUrl: report.pageUrl,
      userAgent: report.userAgent,
      reportId: String(report._id),
      submittedAt: report.createdAt,
    }).catch((err) => {
      console.error('[feedback-alert] bug report notify failed:', err?.message || err);
    });
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

export const listBugReports = async (req, res, next) => {
  try {
    // Admin only: ensure token decoded and admin flag present
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
    if (status && ['Pending', 'Resolved'].includes(status)) {
      filter.status = status;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      BugReport.find(filter)
        .sort(sort)
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit),
      BugReport.countDocuments(filter),
    ]);

    res.status(200).json({ items, total, page: parsedPage, limit: parsedLimit });
  } catch (error) {
    next(error);
  }
};

export const updateBugStatus = async (req, res, next) => {
  try {
    if (!req.user?.isUserAdmin) {
      return next(errorHandler(403, 'Admin access required'));
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!['Pending', 'Resolved'].includes(status)) {
      return next(errorHandler(400, 'Invalid status'));
    }
    const updated = await BugReport.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updated) return next(errorHandler(404, 'Bug report not found'));
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};


