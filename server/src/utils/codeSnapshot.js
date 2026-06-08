import CodeSnapshot from '../models/CodeSnapshot.js';

const MAX_SNAPSHOTS_PER_ROOM = 50;

export const saveCodeSnapshot = async ({ roomId, code, language, savedBy }) => {
  const lastSnapshot = await CodeSnapshot.findOne({ roomId }).sort({ savedAt: -1 });

  if (lastSnapshot && lastSnapshot.code === code) {
    return lastSnapshot;
  }

  const snapshot = await CodeSnapshot.create({
    roomId,
    code,
    language,
    savedBy,
  });

  const count = await CodeSnapshot.countDocuments({ roomId });
  if (count > MAX_SNAPSHOTS_PER_ROOM) {
    const excess = count - MAX_SNAPSHOTS_PER_ROOM;
    const oldest = await CodeSnapshot.find({ roomId })
      .sort({ savedAt: 1 })
      .limit(excess)
      .select('_id');
    await CodeSnapshot.deleteMany({ _id: { $in: oldest.map((s) => s._id) } });
  }

  return snapshot;
};
