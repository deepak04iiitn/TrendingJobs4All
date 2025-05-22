import Comment from "../models/comment.model.js";
import InterviewExperience from "../models/interview.model.js";
import Referral from "../models/referral.model.js";
import Salary from "../models/salary.model.js";
import Template from "../models/template.model.js";
import User from "../models/user.model.js";

export const statistics = async (req , res , next) => {

    try {
        const usersLength = await User.countDocuments();
        const commentsLength = await Comment.countDocuments();
        const interviewExperiencesLength = await InterviewExperience.countDocuments();
        const referralsLength = await Referral.countDocuments();
        const salariesLength = await Salary.countDocuments();
        const resumeTemplatesLength = await Template.countDocuments();
    
        res.json({
          usersLength,
          commentsLength,
          interviewExperiencesLength,
          referralsLength,
          salariesLength,
          resumeTemplatesLength
        });

      } catch (error) {
        res.status(500).json({ message: 'Error fetching platform statistics' });
      }
}