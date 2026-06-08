import mongoose from 'mongoose';

const roomVisitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    lastVisitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

roomVisitSchema.index({ user: 1, roomId: 1 }, { unique: true });
roomVisitSchema.index({ user: 1, lastVisitedAt: -1 });

const RoomVisit = mongoose.model('RoomVisit', roomVisitSchema);
export default RoomVisit;
