import { Router } from 'express';
import { runCode, getLanguages } from '../controllers/executionController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/run', runCode);
router.get('/languages', getLanguages);

export default router;
