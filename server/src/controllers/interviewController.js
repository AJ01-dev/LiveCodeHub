import Interview from '../models/Interview.js';
import InterviewAnalytics from '../models/InterviewAnalytics.js';
import Room from '../models/Room.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { logActivity, computeAnalytics, getInterviewState } from '../utils/interview.js';
import { emitToRoom } from '../socket/emitter.js';

const getRoomAndInterview = async (roomId) => {
  const room = await Room.findOne({ roomId });
  if (!room) throw new AppError('Room not found', 404);

  let interview = await Interview.findOne({ roomId })
    .populate('interviewer', 'name email')
    .populate('candidate', 'name email');

  return { room, interview };
};

export const enableInterviewMode = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { durationMinutes = 60 } = req.body;

  const { room } = await getRoomAndInterview(roomId);

  if (room.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Only the room owner can enable interview mode', 403);
  }

  let interview = await Interview.findOne({ roomId });

  if (interview && interview.status === 'active') {
    throw new AppError('Interview is already in progress', 400);
  }

  if (interview) {
    interview.durationMinutes = durationMinutes;
    interview.status = 'idle';
    interview.startedAt = null;
    interview.endedAt = null;
    await interview.save();
  } else {
    interview = await Interview.create({
      roomId,
      interviewer: req.user._id,
      durationMinutes,
      status: 'idle',
    });
  }

  await Room.findOneAndUpdate({ roomId }, { interviewMode: true });

  await interview.populate('interviewer', 'name email');

  res.json({
    success: true,
    message: 'Interview mode enabled',
    data: { interview: getInterviewState(interview) },
  });
});

export const startInterview = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const { room, interview } = await getRoomAndInterview(roomId);

  if (!interview) {
    throw new AppError('Interview mode is not enabled for this room', 404);
  }

  if (room.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Only the interviewer can start the interview', 403);
  }

  if (interview.status === 'active') {
    throw new AppError('Interview is already active', 400);
  }

  interview.status = 'active';
  interview.startedAt = new Date();
  interview.endedAt = null;
  await interview.save();

  await logActivity({
    roomId,
    interviewId: interview._id,
    userId: req.user._id,
    role: 'interviewer',
    type: 'interview_start',
  });

  await interview.populate('interviewer', 'name email');
  await interview.populate('candidate', 'name email');

  emitToRoom(roomId, 'interview-started', { interview: getInterviewState(interview) });

  res.json({
    success: true,
    message: 'Interview started',
    data: { interview: getInterviewState(interview) },
  });
});

export const endInterview = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const { room, interview } = await getRoomAndInterview(roomId);

  if (!interview) {
    throw new AppError('No interview found for this room', 404);
  }

  if (room.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Only the interviewer can end the interview', 403);
  }

  if (interview.status !== 'active') {
    throw new AppError('Interview is not active', 400);
  }

  interview.status = 'ended';
  interview.endedAt = new Date();
  await interview.save();

  await logActivity({
    roomId,
    interviewId: interview._id,
    userId: req.user._id,
    role: 'interviewer',
    type: 'interview_end',
  });

  const analytics = await computeAnalytics(interview);

  emitToRoom(roomId, 'interview-ended', {
    interview: getInterviewState(interview),
    analytics,
  });

  res.json({
    success: true,
    message: 'Interview ended',
    data: {
      interview: getInterviewState(interview),
      analytics,
    },
  });
});

export const getInterview = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const interview = await Interview.findOne({ roomId })
    .populate('interviewer', 'name email')
    .populate('candidate', 'name email');

  if (!interview) {
    return res.json({
      success: true,
      data: { interview: null },
    });
  }

  res.json({
    success: true,
    data: { interview: getInterviewState(interview) },
  });
});

export const getInterviewAnalytics = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const interview = await Interview.findOne({ roomId });
  if (!interview) {
    throw new AppError('No interview found for this room', 404);
  }

  let analytics = await InterviewAnalytics.findOne({ interviewId: interview._id });

  if (!analytics && interview.status === 'ended') {
    analytics = await computeAnalytics(interview);
  }

  res.json({
    success: true,
    data: { analytics, interview: getInterviewState(interview) },
  });
});

export const assignCandidate = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const interview = await Interview.findOne({ roomId });
  if (!interview) {
    throw new AppError('Interview mode is not enabled for this room', 404);
  }

  if (interview.interviewer.toString() === req.user._id.toString()) {
    return res.json({
      success: true,
      data: { role: 'interviewer' },
    });
  }

  interview.candidate = req.user._id;
  await interview.save();

  await logActivity({
    roomId,
    interviewId: interview._id,
    userId: req.user._id,
    role: 'candidate',
    type: 'join',
  });

  res.json({
    success: true,
    data: { role: 'candidate' },
  });
});
