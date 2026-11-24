import express from 'express';
import { body, param, query } from 'express-validator';
import {
    createSession,
    getSession,
    joinSession,
    leaveSession,
    listSession,
    endSession,
    getVideoToken,
} from '../controllers/sessionControllers.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';
import { ROOM_ID_PATTERN } from '../utils/roomId.js';

const router = express.Router();

const roomIdInBody = body('roomId')
    .isString()
    .withMessage('Room ID is required')
    .trim()
    .matches(ROOM_ID_PATTERN)
    .withMessage('Room ID is invalid');

const roomIdInParams = param('roomId')
    .trim()
    .matches(ROOM_ID_PATTERN)
    .withMessage('Room ID is invalid');

// Every session route needs a logged-in user
router.use(protect);

// GET /api/session/list?status=all|active|ended
router.get(
    '/list',
    [query('status').optional().isIn(['all', 'active', 'ended']).withMessage('Invalid status filter')],
    handleValidationErrors,
    listSession
);

// POST /api/session/create
router.post('/create', createSession);

// POST /api/session/join
router.post('/join', [roomIdInBody], handleValidationErrors, joinSession);

// POST /api/session/leave
router.post('/leave', [roomIdInBody], handleValidationErrors, leaveSession);

// POST /api/session/end (host only)
router.post('/end', [roomIdInBody], handleValidationErrors, endSession);

// POST /api/session/zego-token (host or participant of an active session)
router.post('/zego-token', [roomIdInBody], handleValidationErrors, getVideoToken);

// GET /api/session/:roomId  (keep this last so it does not catch the routes above)
router.get('/:roomId', [roomIdInParams], handleValidationErrors, getSession);

export default router;
