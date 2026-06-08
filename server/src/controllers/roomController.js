import { customAlphabet } from 'nanoid';
import Room from '../models/Room.js';
import Message from '../models/Message.js';
import RoomVisit from '../models/RoomVisit.js';
import CodeSnapshot from '../models/CodeSnapshot.js';
import Interview from '../models/Interview.js';
import InterviewAnalytics from '../models/InterviewAnalytics.js';
import CodingActivity from '../models/CodingActivity.js';
import { DEFAULT_CODE } from '../config/languages.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { recordRoomVisit } from '../utils/roomVisit.js';
import { saveCodeSnapshot } from '../utils/codeSnapshot.js';

const generateRoomId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

export const createRoom = asyncHandler(async (req, res) => {
  const { language = 'javascript', interviewMode = false, durationMinutes = 60 } = req.body;

  const validLanguages = ['javascript', 'python', 'java', 'cpp'];
  if (!validLanguages.includes(language)) {
    throw new AppError('Invalid language selection', 400);
  }

  let roomId;
  let exists = true;

  while (exists) {
    roomId = generateRoomId();
    exists = await Room.findOne({ roomId });
  }

  const room = await Room.create({
    roomId,
    owner: req.user._id,
    language,
    code: DEFAULT_CODE[language],
    interviewMode: Boolean(interviewMode),
  });

  await room.populate('owner', 'name email');

  await recordRoomVisit(req.user._id, roomId);
  await saveCodeSnapshot({
    roomId,
    code: DEFAULT_CODE[language],
    language,
    savedBy: req.user._id,
  });

  if (interviewMode) {
    await Interview.create({
      roomId,
      interviewer: req.user._id,
      durationMinutes,
      status: 'idle',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Room created successfully',
    data: { room },
  });
});

export const getRecentRooms = asyncHandler(async (req, res) => {
  const visits = await RoomVisit.find({ user: req.user._id })
    .sort({ lastVisitedAt: -1 })
    .limit(20);

  const roomIds = visits.map((v) => v.roomId);
  const rooms = await Room.find({ roomId: { $in: roomIds } }).populate('owner', 'name email');

  const roomMap = new Map(rooms.map((r) => [r.roomId, r]));

  const recentRooms = visits
    .map((visit) => {
      const room = roomMap.get(visit.roomId);
      if (!room) return null;
      return {
        ...room.toObject(),
        lastVisitedAt: visit.lastVisitedAt,
        isOwner: room.owner._id.toString() === req.user._id.toString(),
      };
    })
    .filter(Boolean);

  res.json({
    success: true,
    data: { rooms: recentRooms },
  });
});

export const getMyRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ owner: req.user._id })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { rooms },
  });
});

export const getRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ roomId }).populate('owner', 'name email');
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  res.json({
    success: true,
    data: { room },
  });
});

export const joinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ roomId }).populate('owner', 'name email');
  if (!room) {
    throw new AppError('Room not found. Check the Room ID and try again.', 404);
  }

  await recordRoomVisit(req.user._id, roomId);

  res.json({
    success: true,
    message: 'Room found. You can join now.',
    data: { room },
  });
});

export const getRoomMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ roomId });
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
  const before = req.query.before ? new Date(req.query.before) : null;

  const query = { roomId };
  if (before && !isNaN(before.getTime())) {
    query.timestamp = { $lt: before };
  }

  const messages = await Message.find(query)
    .populate('sender', 'name')
    .sort({ timestamp: -1 })
    .limit(limit);

  messages.reverse();

  res.json({
    success: true,
    data: {
      messages,
      hasMore: messages.length === limit,
    },
  });
});

export const updateRoomLanguage = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { language } = req.body;

  const validLanguages = ['javascript', 'python', 'java', 'cpp'];
  if (!validLanguages.includes(language)) {
    throw new AppError('Invalid language selection', 400);
  }

  const room = await Room.findOne({ roomId });
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  if (room.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Only the room owner can change the language', 403);
  }

  room.language = language;
  room.code = DEFAULT_CODE[language];
  await room.save();

  res.json({
    success: true,
    message: 'Language updated',
    data: { room },
  });
});

export const getRoomHistory = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ roomId });
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const snapshots = await CodeSnapshot.find({ roomId })
    .populate('savedBy', 'name')
    .sort({ savedAt: -1 })
    .limit(30);

  res.json({
    success: true,
    data: { snapshots },
  });
});

export const updateRoomSettings = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { name, description, language } = req.body;

  const room = await Room.findOne({ roomId });
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  if (room.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Only the room owner can update settings', 403);
  }

  if (name !== undefined) room.name = name.trim();
  if (description !== undefined) room.description = description.trim();

  if (language && language !== room.language) {
    const validLanguages = ['javascript', 'python', 'java', 'cpp'];
    if (!validLanguages.includes(language)) {
      throw new AppError('Invalid language selection', 400);
    }
    room.language = language;
    room.code = DEFAULT_CODE[language];
    await saveCodeSnapshot({
      roomId,
      code: room.code,
      language,
      savedBy: req.user._id,
    });
  }

  await room.save();
  await room.populate('owner', 'name email');

  res.json({
    success: true,
    message: 'Room settings updated',
    data: { room },
  });
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ roomId });
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  if (room.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Only the room owner can delete this room', 403);
  }

  const interview = await Interview.findOne({ roomId });

  await Promise.all([
    Room.deleteOne({ roomId }),
    Message.deleteMany({ roomId }),
    CodeSnapshot.deleteMany({ roomId }),
    RoomVisit.deleteMany({ roomId }),
    Interview.deleteMany({ roomId }),
    CodingActivity.deleteMany({ roomId }),
    interview ? InterviewAnalytics.deleteMany({ interviewId: interview._id }) : Promise.resolve(),
  ]);

  res.json({
    success: true,
    message: 'Room deleted successfully',
  });
});
