import mongoose from "mongoose";

const questionAnswerSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  }
});

const interviewQuestionSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    questions: [questionAnswerSchema],
    likes: {
      type: Array,
      default: [],
    },
    numberOfLikes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Array,
      default: [],
    },
    numberOfDislikes: {
      type: Number,
      default: 0,
    },
    userRef: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);

export default InterviewQuestion; 