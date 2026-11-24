import { randomInt } from 'crypto';

const ROOM_ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
export const ROOM_ID_LENGTH = 12;
// What the API accepts (older sessions may use other characters)
export const ROOM_ID_PATTERN = /^[A-Za-z0-9]{6,32}$/;

// Room IDs are shared by hand, so look-alike characters (0/O, 1/l/I) are left out.
// crypto.randomInt is used instead of Math.random so IDs cannot be guessed.
export function generateRoomId(length = ROOM_ID_LENGTH) {
    let roomId = '';
    for (let i = 0; i < length; i++) {
        roomId += ROOM_ID_CHARS.charAt(randomInt(ROOM_ID_CHARS.length));
    }
    return roomId;
}

export function isValidRoomId(value) {
    return typeof value === 'string' && ROOM_ID_PATTERN.test(value);
}
