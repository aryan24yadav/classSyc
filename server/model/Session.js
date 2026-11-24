import mongoose from 'mongoose';
import { generateRoomId } from '../utils/roomId.js';

const participantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

const sessionSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true, trim: true },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    hostName: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'ended'],
        default: 'active',
    },
    participants: [participantSchema],
    startedAt: {
        type: Date,
        default: Date.now,
    },
    // Set only when the host ends the session
    endedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

// Used by the "Your sessions" list (sessions a user hosted or joined)
sessionSchema.index({ 'participants.userId': 1, createdAt: -1 });

sessionSchema.statics.generateRoomId = generateRoomId;

sessionSchema.statics.roomIdExists = async function (roomId) {
    return (await this.exists({ roomId })) !== null;
};

sessionSchema.methods.isHost = function (userId) {
    return this.host.toString() === userId.toString();
};

sessionSchema.methods.isParticipant = function (userId) {
    return this.participants.some((p) => p.userId.toString() === userId.toString());
};

// The shape every session endpoint returns
sessionSchema.methods.toClient = function (userId) {
    return {
        id: this._id,
        roomId: this.roomId,
        hostId: this.host,
        hostName: this.hostName,
        status: this.status,
        startedAt: this.startedAt,
        endedAt: this.endedAt,
        participantsCount: this.participants.length,
        isHost: this.isHost(userId),
        isParticipant: this.isParticipant(userId),
        participants: this.participants.map((p) => ({
            userId: p.userId,
            userName: p.userName,
            joinedAt: p.joinedAt,
        })),
    };
};

export default mongoose.model('Session', sessionSchema);
