import { createCipheriv, randomInt } from 'crypto';

/**
 * Generates a ZEGOCLOUD "Token04" on the server, so the ServerSecret never
 * has to be shipped to the browser.
 *
 * Token layout (as documented by ZEGOCLOUD):
 *   "04" + base64( expire[int64 BE] + ivLength[uint16 BE] + iv
 *                  + cipherLength[uint16 BE] + AES-CBC(json, secret, iv) )
 * where json = { app_id, user_id, nonce, ctime, expire, payload }.
 */

const IV_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
const MAX_EFFECTIVE_SECONDS = 24 * 24 * 60 * 60; // ZEGOCLOUD allows at most 24 days

function randomIv() {
    let iv = '';
    for (let i = 0; i < 16; i++) {
        iv += IV_CHARS.charAt(randomInt(IV_CHARS.length));
    }
    return iv;
}

function algorithmFor(secret) {
    switch (Buffer.byteLength(secret)) {
        case 16: return 'aes-128-cbc';
        case 24: return 'aes-192-cbc';
        case 32: return 'aes-256-cbc';
        default: throw new Error('ZEGO server secret must be 16, 24 or 32 bytes long');
    }
}

export function generateToken04({ appId, userId, secret, effectiveTimeInSeconds, payload = '' }) {
    if (!Number.isInteger(appId) || appId <= 0) {
        throw new Error('ZEGO appId must be a positive integer');
    }
    if (typeof userId !== 'string' || userId.length === 0) {
        throw new Error('ZEGO userId must be a non-empty string');
    }
    if (typeof secret !== 'string' || secret.length !== 32) {
        throw new Error('ZEGO server secret must be a 32 character string');
    }
    if (!Number.isInteger(effectiveTimeInSeconds) || effectiveTimeInSeconds <= 0
        || effectiveTimeInSeconds > MAX_EFFECTIVE_SECONDS) {
        throw new Error(`ZEGO token lifetime must be between 1 and ${MAX_EFFECTIVE_SECONDS} seconds`);
    }

    const ctime = Math.floor(Date.now() / 1000);
    const tokenInfo = {
        app_id: appId,
        user_id: userId,
        nonce: randomInt(-2147483648, 2147483647),
        ctime,
        expire: ctime + effectiveTimeInSeconds,
        payload,
    };

    const iv = randomIv();
    const cipher = createCipheriv(algorithmFor(secret), secret, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(tokenInfo), 'utf8'), cipher.final()]);

    const expire = Buffer.alloc(8);
    expire.writeBigInt64BE(BigInt(tokenInfo.expire));
    const ivLength = Buffer.alloc(2);
    ivLength.writeUInt16BE(iv.length);
    const encryptedLength = Buffer.alloc(2);
    encryptedLength.writeUInt16BE(encrypted.length);

    const packed = Buffer.concat([expire, ivLength, Buffer.from(iv), encryptedLength, encrypted]);
    return `04${packed.toString('base64')}`;
}
