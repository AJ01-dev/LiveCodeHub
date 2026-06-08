import User from '../models/User.js';
import Room from '../models/Room.js';
import RoomVisit from '../models/RoomVisit.js';
import Message from '../models/Message.js';
import { generateToken } from '../config/jwt.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { notifySignup, notifyPasswordChange } from '../utils/notifyOwner.js';

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Please provide name, email, and password', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  notifySignup(user);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Logged in successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    },
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [ownedRooms, recentVisits, messagesSent] = await Promise.all([
    Room.countDocuments({ owner: userId }),
    RoomVisit.countDocuments({ user: userId }),
    Message.countDocuments({ sender: userId }),
  ]);

  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
      stats: {
        ownedRooms,
        roomsVisited: recentVisits,
        messagesSent,
      },
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    throw new AppError('Name is required', 400);
  }

  req.user.name = name.trim();
  await req.user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  notifyPasswordChange(user);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});
