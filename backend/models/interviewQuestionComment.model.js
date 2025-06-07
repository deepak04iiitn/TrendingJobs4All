import mongoose from 'mongoose';

const interviewQuestionCommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    questionId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    likes: {
      type: Array,
      default: [],
    },
    numberOfLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const InterviewQuestionComment = mongoose.model('InterviewQuestionComment', interviewQuestionCommentSchema);

export default InterviewQuestionComment; 