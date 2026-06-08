import Interview from '../models/Interview.js';
import CodingActivity from '../models/CodingActivity.js';
import InterviewAnalytics from '../models/InterviewAnalytics.js';
import Room from '../models/Room.js';

export const logActivity = async ({ roomId, interviewId, userId, role, type, metadata = {} }) => {
  return CodingActivity.create({
    roomId,
    interviewId,
    userId,
    role,
    type,
    metadata,
  });
};

export const computeAnalytics = async (interview) => {
  const activities = await CodingActivity.find({
    interviewId: interview._id,
  }).sort({ timestamp: 1 });

  const candidateActivities = activities.filter((a) => a.role === 'candidate');

  const durationSeconds = interview.endedAt && interview.startedAt
    ? Math.round((interview.endedAt - interview.startedAt) / 1000)
    : 0;

  const room = await Room.findOne({ roomId: interview.roomId });
  const finalCode = room?.code || '';
  const finalLineCount = finalCode.split('\n').length;

  const analytics = {
    interviewId: interview._id,
    roomId: interview.roomId,
    candidateId: interview.candidate,
    durationSeconds,
    totalKeystrokes: candidateActivities.filter((a) => a.type === 'keystroke').length,
    codeSaves: candidateActivities.filter((a) => a.type === 'code_save').length,
    codeRuns: candidateActivities.filter((a) => a.type === 'run_code').length,
    pasteEvents: candidateActivities.filter((a) => a.type === 'paste').length,
    languageChanges: candidateActivities.filter((a) => a.type === 'language_change').length,
    finalCodeLength: finalCode.length,
    finalLineCount,
    activityTimeline: activities.slice(-50).map((a) => ({
      type: a.type,
      role: a.role,
      timestamp: a.timestamp,
      metadata: a.metadata,
    })),
  };

  return InterviewAnalytics.findOneAndUpdate(
    { interviewId: interview._id },
    analytics,
    { upsert: true, new: true }
  );
};

export const getInterviewState = (interview) => {
  if (!interview) return null;

  const elapsedSeconds = interview.status === 'active' && interview.startedAt
    ? Math.floor((Date.now() - new Date(interview.startedAt).getTime()) / 1000)
    : 0;

  const remainingSeconds = interview.status === 'active'
    ? Math.max(0, interview.durationMinutes * 60 - elapsedSeconds)
    : interview.durationMinutes * 60;

  return {
    id: interview._id,
    roomId: interview.roomId,
    status: interview.status,
    durationMinutes: interview.durationMinutes,
    startedAt: interview.startedAt,
    endedAt: interview.endedAt,
    elapsedSeconds,
    remainingSeconds,
    interviewer: interview.interviewer,
    candidate: interview.candidate,
  };
};
