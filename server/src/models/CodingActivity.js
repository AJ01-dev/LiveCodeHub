import mongoose from 'mongoose';

const codingActivitySchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['interviewer', 'candidate'],
      required: true,
    },
    type: {
      type: String,
      enum: [
        'keystroke',
        'paste',
        'code_save',
        'run_code',
        'language_change',
        'join',
        'leave',
        'interview_start',
        'interview_end',
      ],
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

codingActivitySchema.index({ roomId: 1, timestamp: 1 });
codingActivitySchema.index({ interviewId: 1, timestamp: 1 });

const CodingActivity = mongoose.model('CodingActivity', codingActivitySchema);
export default CodingActivity;
