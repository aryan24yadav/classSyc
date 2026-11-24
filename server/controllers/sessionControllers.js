import mongoose from 'mongoose';
import Session from '../model/Session.js';
import User from '../model/User.js';
import { generateToken04 } from '../utils/zegoToken.js';

const MAX_ROOM_ID_ATTEMPTS = 10;
const DEFAULT_VIDEO_TOKEN_TTL_SECONDS = 2 * 60 * 60; // 2 hours

const notFound = (res, message = 'Session not found') =>
    res.status(404).json({ success: false, error: message });

// GET /api/session/list?status=all|active|ended
export const listSession = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { status } = req.query;
        const statusFilter = status === 'active' || status === 'ended' ? { status } : {};

        const sessions = await Session.find({
            ...statusFilter,
            $or: [{ host: userId }, { 'participants.userId': userId }],
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                sessions: sessions.map((s) => {
                    const { participants, ...summary } = s.toClient(userId);
                    return summary;
                }),
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/session/create
export const createSession = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        let roomId = null;
        for (let attempt = 0; attempt < MAX_ROOM_ID_ATTEMPTS; attempt++) {
            const candidate = Session.generateRoomId();
            if (!(await Session.roomIdExists(candidate))) {
                roomId = candidate;
                break;
            }
        }
        if (!roomId) {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate a unique room ID. Please try again',
            });
        }

        const session = await Session.create({
            roomId,
            host: user._id,
            hostName: user.name,
            participants: [{ userId: user._id, userName: user.name }],
        });

        res.status(201).json({
            success: true,
            data: { session: session.toClient(userId) },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/session/join  { roomId }
export const joinSession = async (req, res, next) => {
    try {
        const { roomId } = req.body;
        const { userId } = req.user;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Atomic: two quick joins from the same user cannot add them twice
        await Session.updateOne(
            { roomId, status: 'active', 'participants.userId': { $ne: user._id } },
            { $push: { participants: { userId: user._id, userName: user.name } } }
        );

        const session = await Session.findOne({ roomId });
        if (!session) {
            return notFound(res, 'Session not found. Please check the room ID');
        }
        if (session.status !== 'active') {
            return res.status(400).json({ success: false, error: 'This session has ended' });
        }

        res.json({
            success: true,
            data: { session: session.toClient(userId) },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/session/:roomId
export const getSession = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { userId } = req.user;

        const session = await Session.findOne({ roomId });
        if (!session) {
            return notFound(res);
        }

        const data = session.toClient(userId);
        // Only people in the session can see who else is in it
        if (!data.isHost && !data.isParticipant) {
            delete data.participants;
        }

        res.json({ success: true, data: { session: data } });
    } catch (error) {
        next(error);
    }
};

// POST /api/session/end  { roomId }  (host only)
export const endSession = async (req, res, next) => {
    try {
        const { roomId } = req.body;
        const { userId } = req.user;

        const session = await Session.findOne({ roomId });
        if (!session) {
            return notFound(res);
        }

        if (!session.isHost(userId)) {
            return res.status(403).json({
                success: false,
                error: "You can't end this session. Only the host can end it",
            });
        }

        if (session.status === 'ended') {
            return res.status(400).json({ success: false, error: 'Session has already ended' });
        }

        session.status = 'ended';
        session.endedAt = new Date();
        await session.save();

        res.json({
            success: true,
            data: { session: session.toClient(userId) },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/session/leave  { roomId }
export const leaveSession = async (req, res, next) => {
    try {
        const { roomId } = req.body;
        const { userId } = req.user;

        const result = await Session.updateOne(
            { roomId },
            { $pull: { participants: { userId: new mongoose.Types.ObjectId(String(userId)) } } }
        );
        if (result.matchedCount === 0) {
            return notFound(res, 'Session not found. Please check the room ID');
        }

        res.json({ success: true, data: { message: 'Left session successfully' } });
    } catch (error) {
        next(error);
    }
};

// POST /api/session/zego-token  { roomId }
// Issues a short-lived ZEGOCLOUD token for a user who is in an active session.
// The ServerSecret stays on the server; the browser only gets the token.
export const getVideoToken = async (req, res, next) => {
    try {
        const appId = Number(process.env.ZEGO_APP_ID);
        const secret = process.env.ZEGO_SERVER_SECRET;
        if (!Number.isInteger(appId) || appId <= 0 || !secret) {
            return res.status(503).json({
                success: false,
                error: 'Video service is not configured on the server',
            });
        }

        const { roomId } = req.body;
        const { userId } = req.user;

        const session = await Session.findOne({ roomId });
        if (!session) {
            return notFound(res);
        }
        if (session.status !== 'active') {
            return res.status(400).json({ success: false, error: 'This session has ended' });
        }
        if (!session.isHost(userId) && !session.isParticipant(userId)) {
            return res.status(403).json({ success: false, error: 'Join the session before entering the video room' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const ttl = Number(process.env.ZEGO_TOKEN_TTL_SECONDS) || DEFAULT_VIDEO_TOKEN_TTL_SECONDS;
        const zegoUserId = user._id.toString();
        const token = generateToken04({
            appId,
            userId: zegoUserId,
            secret,
            effectiveTimeInSeconds: ttl,
        });

        res.json({
            success: true,
            data: {
                appId,
                token,
                roomId,
                userId: zegoUserId,
                userName: user.name,
                expiresIn: ttl,
            },
        });
    } catch (error) {
        next(error);
    }
};
