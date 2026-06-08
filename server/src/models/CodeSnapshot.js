import mongoose from 'mongoose';

const codeSnapshotSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

codeSnapshotSchema.index({ roomId: 1, savedAt: -1 });

const CodeSnapshot = mongoose.model('CodeSnapshot', codeSnapshotSchema);
export default CodeSnapshot;
