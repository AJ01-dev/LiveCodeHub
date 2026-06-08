import { Router } from 'express';
import {
  createRoom,
  getMyRooms,
  getRecentRooms,
  getRoom,
  joinRoom,
  getRoomMessages,
  updateRoomLanguage,
  getRoomHistory,
  updateRoomSettings,
  deleteRoom,
} from '../controllers/roomController.js';
import {
  enableInterviewMode,
  startInterview,
  endInterview,
  getInterview,
  getInterviewAnalytics,
  assignCandidate,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', createRoom);
router.get('/my', getMyRooms);
router.get('/recent', getRecentRooms);
router.get('/:roomId', getRoom);
router.post('/:roomId/join', joinRoom);
router.get('/:roomId/messages', getRoomMessages);
router.get('/:roomId/history', getRoomHistory);
router.patch('/:roomId/language', updateRoomLanguage);
router.patch('/:roomId/settings', updateRoomSettings);
router.delete('/:roomId', deleteRoom);

router.post('/:roomId/interview/enable', enableInterviewMode);
router.post('/:roomId/interview/start', startInterview);
router.post('/:roomId/interview/end', endInterview);
router.get('/:roomId/interview', getInterview);
router.get('/:roomId/interview/analytics', getInterviewAnalytics);
router.post('/:roomId/interview/role', assignCandidate);

export default router;
