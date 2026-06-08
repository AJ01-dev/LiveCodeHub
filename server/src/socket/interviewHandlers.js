import Interview from '../models/Interview.js';
import { logActivity } from '../utils/interview.js';
import { getInterviewState } from '../utils/interview.js';

export const getActiveInterview = async (roomId) => {
  return Interview.findOne({ roomId, status: 'active' });
};

export const getRoomInterview = async (roomId) => {
  return Interview.findOne({ roomId });
};

export const resolveUserRole = async (room, userId) => {
  if (room.owner.toString() === userId.toString()) {
    return 'interviewer';
  }

  const interview = await getRoomInterview(room.roomId);
  if (!interview) return null;

  if (interview.interviewer.toString() === userId.toString()) {
    return 'interviewer';
  }

  return 'candidate';
};

export const isInterviewerReadOnly = async (roomId, role, readOnlyEnabled = true) => {
  const interview = await getActiveInterview(roomId);
  if (!interview) return false;
  if (role !== 'interviewer') return false;
  return readOnlyEnabled !== false;
};

export const trackCodingActivity = async ({
  roomId,
  userId,
  role,
  type,
  metadata = {},
}) => {
  const interview = await getRoomInterview(roomId);
  if (!interview || interview.status !== 'active') return;

  await logActivity({
    roomId,
    interviewId: interview._id,
    userId,
    role,
    type,
    metadata,
  });
};

export const buildInterviewPayload = async (roomId) => {
  const interview = await Interview.findOne({ roomId })
    .populate('interviewer', 'name email')
    .populate('candidate', 'name email');

  if (!interview) return null;
  return getInterviewState(interview);
};
