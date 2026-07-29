import DSAProblem from "../models/dsaProblem.model.js";
import { errorHandler } from "../utils/error.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from "../models/user.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dsaData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../frontend/src/data/dsa.json'), 'utf8'));

// Get all DSA problems with user's progress
export const getDSAProblems = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get user's progress for all problems
        const userProgress = await DSAProblem.find({ userId }).lean();
        
        // Create a map for quick lookup
        const progressMap = new Map();
        userProgress.forEach(progress => {
            progressMap.set(progress.problemName, progress);
        });

        // Group problems by category and difficulty
        const groupedProblems = {};
        
        dsaData.forEach(problem => {
            const { Category, Difficulty } = problem;
            
            if (!groupedProblems[Category]) {
                groupedProblems[Category] = {
                    Easy: [],
                    Medium: [],
                    Hard: []
                };
            }

            // Get user's progress for this problem
            const userProgressData = progressMap.get(problem["Problem Name"]) || {
                isCompleted: false,
                isFavorite: false,
                notes: "",
                completedAt: null
            };

            groupedProblems[Category][Difficulty].push({
                problemName: problem["Problem Name"],
                problemLink: problem["Problem Link"],
                category: Category,
                difficulty: Difficulty,
                isCompleted: userProgressData.isCompleted,
                isFavorite: userProgressData.isFavorite,
                notes: userProgressData.notes,
                completedAt: userProgressData.completedAt
            });
        });

        // Calculate progress statistics
        const totalProblems = dsaData.length;
        const completedProblems = userProgress.filter(p => p.isCompleted).length;
        const favoriteProblems = userProgress.filter(p => p.isFavorite).length;

        const progressStats = {
            total: totalProblems,
            completed: completedProblems,
            favorites: favoriteProblems,
            completionPercentage: totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0
        };

        res.json({
            success: true,
            data: {
                problems: groupedProblems,
                stats: progressStats
            }
        });

    } catch (error) {
        next(error);
    }
};

// Update problem status (completed/favorite)
export const updateProblemStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { problemName, isCompleted, isFavorite } = req.body;

        if (!problemName) {
            return next(errorHandler(400, 'Problem name is required'));
        }

        // Find the problem in the DSA data to get its details
        const problemData = dsaData.find(p => p["Problem Name"] === problemName);
        if (!problemData) {
            return next(errorHandler(404, 'Problem not found'));
        }

        // Find or create the problem record
        let problem = await DSAProblem.findOne({ userId, problemName });
        
        if (!problem) {
            problem = new DSAProblem({
                userId,
                problemName,
                category: problemData.Category,
                difficulty: problemData.Difficulty,
                problemLink: problemData["Problem Link"]
            });
        }

        // Update the status
        if (isCompleted !== undefined) {
            problem.isCompleted = isCompleted;
            problem.completedAt = isCompleted ? new Date() : null;
        }
        
        if (isFavorite !== undefined) {
            problem.isFavorite = isFavorite;
        }

        await problem.save();

        res.json({
            success: true,
            message: 'Problem status updated successfully',
            data: {
                problemName: problem.problemName,
                isCompleted: problem.isCompleted,
                isFavorite: problem.isFavorite,
                completedAt: problem.completedAt
            }
        });

    } catch (error) {
        next(error);
    }
};

// Update problem notes
export const updateProblemNotes = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { problemName, notes } = req.body;

        if (!problemName) {
            return next(errorHandler(400, 'Problem name is required'));
        }

        // Find the problem in the DSA data to get its details
        const problemData = dsaData.find(p => p["Problem Name"] === problemName);
        if (!problemData) {
            return next(errorHandler(404, 'Problem not found'));
        }

        // Find or create the problem record
        let problem = await DSAProblem.findOne({ userId, problemName });
        
        if (!problem) {
            problem = new DSAProblem({
                userId,
                problemName,
                category: problemData.Category,
                difficulty: problemData.Difficulty,
                problemLink: problemData["Problem Link"]
            });
        }

        problem.notes = notes || "";
        await problem.save();

        res.json({
            success: true,
            message: 'Problem notes updated successfully',
            data: {
                problemName: problem.problemName,
                notes: problem.notes
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get user's progress statistics
export const getProgressStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const userProgress = await DSAProblem.find({ userId });
        
        const totalProblems = dsaData.length;
        const completedProblems = userProgress.filter(p => p.isCompleted).length;
        const favoriteProblems = userProgress.filter(p => p.isFavorite).length;

        // Calculate progress by category
        const categoryStats = {};
        dsaData.forEach(problem => {
            const category = problem.Category;
            if (!categoryStats[category]) {
                categoryStats[category] = { total: 0, completed: 0 };
            }
            categoryStats[category].total++;
        });

        userProgress.forEach(progress => {
            if (progress.isCompleted && categoryStats[progress.category]) {
                categoryStats[progress.category].completed++;
            }
        });

        // Calculate progress by difficulty
        const difficultyStats = {
            Easy: { total: 0, completed: 0 },
            Medium: { total: 0, completed: 0 },
            Hard: { total: 0, completed: 0 }
        };

        dsaData.forEach(problem => {
            difficultyStats[problem.Difficulty].total++;
        });

        userProgress.forEach(progress => {
            if (progress.isCompleted) {
                difficultyStats[progress.difficulty].completed++;
            }
        });

        res.json({
            success: true,
            data: {
                overall: {
                    total: totalProblems,
                    completed: completedProblems,
                    favorites: favoriteProblems,
                    completionPercentage: totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0
                },
                byCategory: categoryStats,
                byDifficulty: difficultyStats
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get problems by filter (completed, favorites, etc.)
export const getFilteredProblems = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { filter, category, difficulty } = req.query;

        let query = { userId };
        
        if (filter === 'completed') {
            query.isCompleted = true;
        } else if (filter === 'favorites') {
            query.isFavorite = true;
        } else if (filter === 'incomplete') {
            query.isCompleted = false;
        }

        if (category) {
            query.category = category;
        }

        if (difficulty) {
            query.difficulty = difficulty;
        }

        const problems = await DSAProblem.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: problems
        });

    } catch (error) {
        next(error);
    }
};

// Bulk update problems (for bulk operations)
export const bulkUpdateProblems = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { problemNames, updates } = req.body;

        if (!problemNames || !Array.isArray(problemNames) || problemNames.length === 0) {
            return next(errorHandler(400, 'Problem names array is required'));
        }

        if (!updates || Object.keys(updates).length === 0) {
            return next(errorHandler(400, 'Updates object is required'));
        }

        const results = [];
        
        for (const problemName of problemNames) {
            // Find the problem in the DSA data to get its details
            const problemData = dsaData.find(p => p["Problem Name"] === problemName);
            if (!problemData) {
                results.push({ problemName, success: false, error: 'Problem not found' });
                continue;
            }

            // Find or create the problem record
            let problem = await DSAProblem.findOne({ userId, problemName });
            
            if (!problem) {
                problem = new DSAProblem({
                    userId,
                    problemName,
                    category: problemData.Category,
                    difficulty: problemData.Difficulty,
                    problemLink: problemData["Problem Link"]
                });
            }

            // Update the fields
            Object.keys(updates).forEach(key => {
                if (key === 'isCompleted' && updates[key]) {
                    problem.completedAt = new Date();
                } else if (key === 'isCompleted' && !updates[key]) {
                    problem.completedAt = null;
                }
                problem[key] = updates[key];
            });

            await problem.save();
            results.push({ problemName, success: true, data: problem });
        }

        res.json({
            success: true,
            message: 'Bulk update completed',
            data: results
        });

    } catch (error) {
        next(error);
    }
};

// Get user's recent activity
export const getRecentActivity = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { limit = 10 } = req.query;

        const recentActivity = await DSAProblem.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(parseInt(limit))
            .select('problemName category difficulty isCompleted isFavorite updatedAt');

        res.json({
            success: true,
            data: recentActivity
        });

    } catch (error) {
        next(error);
    }
};

// ADMIN: Get per-user DSA progress stats
export const getAdminUsersDSAStats = async (req, res, next) => {
    try {
        const { search } = req.query;
        const pageNum = Math.max(1, parseInt(req.query.page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));

        // Aggregate completed and favorite counts per user
        const perUser = await DSAProblem.aggregate([
            {
                $group: {
                    _id: "$userId",
                    completedCount: {
                        $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] }
                    },
                    favoriteCount: {
                        $sum: { $cond: [{ $eq: ["$isFavorite", true] }, 1, 0] }
                    },
                    lastCompletedAt: {
                        $max: "$completedAt"
                    }
                }
            }
        ]);

        const userIds = perUser.map(u => u._id);
        const users = await User.find({ _id: { $in: userIds } })
            .select("username email profilePicture createdAt isUserAdmin status lastVisit")
            .lean();
        const userMap = new Map(users.map(u => [String(u._id), u]));

        const totalProblems = dsaData.length;

        const rows = perUser
            .map(u => {
                const user = userMap.get(String(u._id));
                if (!user) return null;
                const completionPercentage = totalProblems > 0 ? Math.round((u.completedCount / totalProblems) * 100) : 0;
                return {
                    userId: u._id,
                    username: user.username,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    createdAt: user.createdAt,
                    status: user.status,
                    lastVisit: user.lastVisit,
                    isUserAdmin: user.isUserAdmin,
                    completedCount: u.completedCount,
                    favoriteCount: u.favoriteCount,
                    lastCompletedAt: u.lastCompletedAt,
                    totalProblems,
                    completionPercentage
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.completedCount - a.completedCount);

        const filteredRows = search && search.trim()
            ? rows.filter((r) => {
                const q = search.trim().toLowerCase();
                return r.username?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q);
            })
            : rows;

        const total = filteredRows.length;
        const start = (pageNum - 1) * limitNum;
        const items = filteredRows.slice(start, start + limitNum);

        res.json({ success: true, items, total, page: pageNum, limit: limitNum, totalProblems });
    } catch (error) {
        next(error);
    }
};

// ADMIN: Leaderboard - top users by completed problems
export const getAdminDSALeaderboard = async (req, res, next) => {
    try {
        const limit = Math.max(1, Math.min(parseInt(req.query.limit || '20', 10), 100));
        const top = await DSAProblem.aggregate([
            {
                $group: {
                    _id: "$userId",
                    completedCount: {
                        $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] }
                    },
                    lastCompletedAt: { $max: "$completedAt" }
                }
            },
            { $sort: { completedCount: -1, lastCompletedAt: -1 } },
            { $limit: limit }
        ]);

        const userIds = top.map(t => t._id);
        const users = await User.find({ _id: { $in: userIds } })
            .select("username email profilePicture")
            .lean();
        const userMap = new Map(users.map(u => [String(u._id), u]));
        const totalProblems = dsaData.length;

        const items = top.map(t => {
            const user = userMap.get(String(t._id));
            return {
                userId: t._id,
                username: user?.username || "Unknown",
                email: user?.email || "",
                profilePicture: user?.profilePicture,
                completedCount: t.completedCount,
                completionPercentage: totalProblems > 0 ? Math.round((t.completedCount / totalProblems) * 100) : 0,
                lastCompletedAt: t.lastCompletedAt
            };
        });

        res.json({ success: true, items, totalProblems });
    } catch (error) {
        next(error);
    }
};

// Helper: compute last Monday 00:00:00 for weekly window (UTC)
const getLastMonday = () => {
    const now = new Date();
    const day = now.getUTCDay(); // 0=Sun,1=Mon
    const diffToMonday = (day + 6) % 7; // days since Monday
    const lastMonday = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0, 0, 0, 0
    ));
    lastMonday.setUTCDate(lastMonday.getUTCDate() - diffToMonday);
    return lastMonday;
};

// Helper: common aggregation for leaderboard with points and deterministic ranking
async function computeLeaderboard({ weekly = true, limit = 20 }) {
    const matchStage = { isCompleted: true };
    if (weekly) {
        matchStage.completedAt = { $gte: getLastMonday() };
    }

    // Points per difficulty: Easy=10, Medium=20, Hard=30
    const difficultyPoints = {
        Easy: 10,
        Medium: 20,
        Hard: 30,
    };

    const pipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: "$userId",
                completedCount: { $sum: 1 },
                totalPoints: {
                    $sum: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$difficulty", "Easy"] }, then: difficultyPoints.Easy },
                                { case: { $eq: ["$difficulty", "Medium"] }, then: difficultyPoints.Medium },
                                { case: { $eq: ["$difficulty", "Hard"] }, then: difficultyPoints.Hard },
                            ],
                            default: 0,
                        },
                    },
                },
                lastCompletedAt: { $max: "$completedAt" },
                firstCompletedAt: { $min: "$completedAt" },
            },
        },
        // Deterministic ordering: points desc, count desc, lastCompletedAt desc, _id asc
        { $sort: { totalPoints: -1, completedCount: -1, lastCompletedAt: -1, _id: 1 } },
        { $limit: limit },
    ];

    const agg = await DSAProblem.aggregate(pipeline);
    const userIds = agg.map((a) => a._id);
    const users = await User.find({ _id: { $in: userIds } })
        .select("username email profilePicture")
        .lean();
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    // Assign unique ranks (no ties) in sorted order
    const items = agg.map((row, idx) => {
        const user = userMap.get(String(row._id));
        return {
            rank: idx + 1,
            userId: row._id,
            username: user?.username || "Unknown",
            email: user?.email || "",
            profilePicture: user?.profilePicture,
            completedCount: row.completedCount,
            totalPoints: row.totalPoints,
            lastCompletedAt: row.lastCompletedAt,
            firstCompletedAt: row.firstCompletedAt,
        };
    });

    return { items };
}

// Public (authenticated) leaderboard
export const getDSALeaderboard = async (req, res, next) => {
    try {
        const limit = Math.max(1, Math.min(parseInt(req.query.limit || '20', 10), 100));
        const period = (req.query.period || 'weekly').toLowerCase();
        const weekly = period !== 'all';
        const { items } = await computeLeaderboard({ weekly, limit });
        res.json({ success: true, items, period });
    } catch (error) {
        next(error);
    }
};

// Weekly winners (top 3 of current week)
export const getWeeklyWinners = async (req, res, next) => {
    try {
        const { items } = await computeLeaderboard({ weekly: true, limit: 3 });
        res.json({ success: true, items, weekStart: getLastMonday() });
    } catch (error) {
        next(error);
    }
};

// SSE: real-time leaderboard stream
export const streamDSALeaderboard = async (req, res, next) => {
    try {
        // Headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Allow cookies over SSE
        res.flushHeaders?.();

        const limit = Math.max(1, Math.min(parseInt(req.query.limit || '20', 10), 100));
        const period = (req.query.period || 'weekly').toLowerCase();
        const weekly = period !== 'all';

        let closed = false;
        req.on('close', () => { closed = true; clearInterval(timer); });

        const send = async () => {
            try {
                const { items } = await computeLeaderboard({ weekly, limit });
                const payload = JSON.stringify({ items, period });
                res.write(`event: leaderboard\n`);
                res.write(`data: ${payload}\n\n`);
            } catch (e) {
                // On error, send comment to keep connection alive
                res.write(`: ping\n\n`);
            }
        };

        // Initial send
        await send();
        // Periodic updates every 10s
        const timer = setInterval(() => {
            if (!closed) send();
        }, 10000);
    } catch (error) {
        next(error);
    }
};