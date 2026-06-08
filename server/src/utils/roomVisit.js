import RoomVisit from '../models/RoomVisit.js';

export const recordRoomVisit = async (userId, roomId) => {
  await RoomVisit.findOneAndUpdate(
    { user: userId, roomId },
    { lastVisitedAt: new Date() },
    { upsert: true, new: true }
  );
};
