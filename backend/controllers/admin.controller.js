import Comment from "../models/comment.model.js";
import InterviewExperience from "../models/interview.model.js";
import Salary from "../models/salary.model.js";
import User from "../models/user.model.js";

export const statistics = async (req , res , next) => {

    try {
        const usersLength = await User.countDocuments();
        const commentsLength = await Comment.countDocuments();
        const interviewExperiencesLength = await InterviewExperience.countDocuments();
        const salariesLength = await Salary.countDocuments();
    
        res.json({
          usersLength,
          commentsLength,
          interviewExperiencesLength,
          salariesLength,
        });

      } catch (error) {
        res.status(500).json({ message: 'Error fetching platform statistics' });
      }
}
