import mongoose from 'mongoose';

const interviewAnalyticsSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      unique: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    totalKeystrokes: {
      type: Number,
      default: 0,
    },
    codeSaves: {
      type: Number,
      default: 0,
    },
    codeRuns: {
      type: Number,
      default: 0,
    },
    pasteEvents: {
      type: Number,
      default: 0,
    },
    languageChanges: {
      type: Number,
      default: 0,
    },
    finalCodeLength: {
      type: Number,
      default: 0,
    },
    finalLineCount: {
      type: Number,
      default: 0,
    },
    activityTimeline: [
      {
        type: String,
        timestamp: Date,
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const InterviewAnalytics = mongoose.model('InterviewAnalytics', interviewAnalyticsSchema);
export default InterviewAnalytics;
