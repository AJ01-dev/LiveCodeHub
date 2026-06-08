import { Server } from 'socket.io';
import Message from '../models/Message.js';
import Room from '../models/Room.js';
import { socketAuth } from '../middleware/auth.js';
import { recordRoomVisit } from '../utils/roomVisit.js';
import { saveCodeSnapshot } from '../utils/codeSnapshot.js';
import { setIO } from './emitter.js';
import Interview from '../models/Interview.js';
import {
  resolveUserRole,
  isInterviewerReadOnly,
  trackCodingActivity,
  buildInterviewPayload,
} from './interviewHandlers.js';

const roomUsers = new Map();
const roomLiveState = new Map();

const getRoomLiveState = (roomId) => roomLiveState.get(roomId);

const setRoomLiveState = (roomId, updates) => {
  const current = roomLiveState.get(roomId) || {};
  roomLiveState.set(roomId, { ...current, ...updates, updatedAt: Date.now() });
};

const getRoomUserList = (roomId) => {
  const users = roomUsers.get(roomId);
  if (!users) return [];
  return Array.from(users.values());
};

const emitRoomActivity = (io, roomId, payload) => {
  io.to(roomId).emit('room-activity', {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
  });
};

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const user = await socketAuth(token);
      socket.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      };
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.id})`);

    socket.on('join-room', async ({ roomId }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit('room-error', { message: 'Room not found' });
          return;
        }

        const role = await resolveUserRole(room, socket.user.id);
        socket.interviewRole = role;
        socket.interviewerReadOnly = role === 'interviewer';

        socket.join(roomId);
        socket.roomId = roomId;

        await recordRoomVisit(socket.user.id, roomId);

        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Map());
        }
        roomUsers.get(roomId).set(socket.id, {
          socketId: socket.id,
          id: socket.user.id,
          name: socket.user.name,
          email: socket.user.email,
          role,
          online: true,
        });

        const users = getRoomUserList(roomId);
        const interview = await buildInterviewPayload(roomId);
        const live = getRoomLiveState(roomId);
        const currentCode = live?.code ?? room.code;
        const currentLanguage = live?.language ?? room.language;

        if (role === 'candidate' && interview) {
          await Interview.findOneAndUpdate(
            { roomId },
            { candidate: socket.user.id }
          );
        }

        socket.emit('room-joined', {
          room: {
            roomId: room.roomId,
            name: room.name,
            description: room.description,
            language: currentLanguage,
            code: currentCode,
            owner: room.owner,
            lastSavedAt: room.lastSavedAt,
            interviewMode: room.interviewMode,
          },
          users,
          interview,
          role,
        });

        socket.to(roomId).emit('user-joined', {
          user: { id: socket.user.id, name: socket.user.name },
          users,
        });

        io.to(roomId).emit('users-update', { users });

        emitRoomActivity(io, roomId, {
          id: `join-${socket.id}-${Date.now()}`,
          type: 'join',
          message: `${socket.user.name} joined the room`,
          user: { id: socket.user.id, name: socket.user.name },
        });
      } catch (error) {
        socket.emit('room-error', { message: error.message });
      }
    });

    socket.on('code-change', async ({ roomId, code, isPaste = false }) => {
      if (socket.roomId !== roomId) return;

      const readOnly = await isInterviewerReadOnly(
        roomId,
        socket.interviewRole,
        socket.interviewerReadOnly
      );
      if (readOnly) return;

      setRoomLiveState(roomId, { code });
      socket.to(roomId).emit('code-update', { code, userId: socket.user.id });

      await trackCodingActivity({
        roomId,
        userId: socket.user.id,
        role: socket.interviewRole || 'candidate',
        type: isPaste ? 'paste' : 'keystroke',
        metadata: { codeLength: code?.length || 0 },
      });
    });

    socket.on('language-change', async ({ roomId, language, code }) => {
      if (socket.roomId !== roomId) return;

      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit('room-error', { message: 'Room not found' });
          return;
        }

        if (room.owner.toString() !== socket.user.id) {
          socket.emit('room-error', { message: 'Only the room owner can change the language' });
          return;
        }

        await Room.findOneAndUpdate({ roomId }, { language, code });
        setRoomLiveState(roomId, { language, code });
        io.to(roomId).emit('language-update', { language, code });

        emitRoomActivity(io, roomId, {
          id: `lang-${Date.now()}`,
          type: 'language_changed',
          message: `${socket.user.name} changed language to ${language}`,
          user: { id: socket.user.id, name: socket.user.name },
          metadata: { language },
        });
      } catch (error) {
        socket.emit('room-error', { message: 'Failed to update language' });
      }
    });

    socket.on('chat-message', async ({ roomId, text }) => {
      if (socket.roomId !== roomId || !text?.trim()) return;

      try {
        const message = await Message.create({
          roomId,
          sender: socket.user.id,
          text: text.trim(),
        });

        await message.populate('sender', 'name');

        const messageData = {
          _id: message._id,
          roomId: message.roomId,
          text: message.text,
          timestamp: message.timestamp,
          sender: {
            id: message.sender._id,
            name: message.sender.name,
          },
        };

        io.to(roomId).emit('new-message', messageData);
      } catch (error) {
        socket.emit('room-error', { message: 'Failed to send message' });
      }
    });

    socket.on('save-code', async ({ roomId, code }) => {
      if (socket.roomId !== roomId) return;

      const readOnly = await isInterviewerReadOnly(
        roomId,
        socket.interviewRole,
        socket.interviewerReadOnly
      );
      if (readOnly) return;

      try {
        const room = await Room.findOne({ roomId });
        if (!room) return;

        const now = new Date();
        await Room.findOneAndUpdate({ roomId }, { code, lastSavedAt: now });
        setRoomLiveState(roomId, { code, language: room.language });
        await saveCodeSnapshot({
          roomId,
          code,
          language: room.language,
          savedBy: socket.user.id,
        });

        await trackCodingActivity({
          roomId,
          userId: socket.user.id,
          role: socket.interviewRole || 'candidate',
          type: 'code_save',
          metadata: { codeLength: code?.length || 0 },
        });

        socket.emit('code-saved', { savedAt: now.toISOString() });
      } catch (error) {
        console.error('Failed to save code:', error.message);
        socket.emit('code-save-error', { message: 'Failed to save code' });
      }
    });

    socket.on('track-activity', async ({ roomId, type, metadata }) => {
      if (socket.roomId !== roomId) return;

      await trackCodingActivity({
        roomId,
        userId: socket.user.id,
        role: socket.interviewRole || 'candidate',
        type,
        metadata,
      });
    });

    socket.on('interview-readonly', ({ roomId, readOnly }) => {
      if (socket.roomId !== roomId || socket.interviewRole !== 'interviewer') return;

      socket.interviewerReadOnly = readOnly;
      socket.to(roomId).emit('interview-readonly-update', { readOnly });
    });

    socket.on('room-activity', ({ roomId, type, message, metadata }) => {
      if (socket.roomId !== roomId || !type || !message) return;

      emitRoomActivity(io, roomId, {
        id: `${type}-${socket.id}-${Date.now()}`,
        type,
        message,
        user: { id: socket.user.id, name: socket.user.name },
        metadata,
      });
    });

    socket.on('leave-room', ({ roomId }) => {
      handleLeaveRoom(socket, roomId, io);
    });

    socket.on('disconnect', () => {
      if (socket.roomId) {
        handleLeaveRoom(socket, socket.roomId, io);
      }
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  setIO(io);
  return io;
};

const handleLeaveRoom = (socket, roomId, io) => {
  const users = roomUsers.get(roomId);
  if (users) {
    users.delete(socket.id);
    if (users.size === 0) {
      roomUsers.delete(roomId);
      // Keep roomLiveState so rejoining users get the latest in-session code
    }
  }

  socket.leave(roomId);
  const updatedUsers = getRoomUserList(roomId);

  io.to(roomId).emit('user-left', {
    user: { id: socket.user.id, name: socket.user.name },
    users: updatedUsers,
  });

  io.to(roomId).emit('users-update', { users: updatedUsers });

  emitRoomActivity(io, roomId, {
    id: `leave-${socket.id}-${Date.now()}`,
    type: 'leave',
    message: `${socket.user.name} left the room`,
    user: { id: socket.user.id, name: socket.user.name },
  });

  socket.roomId = null;
};

export default initializeSocket;
