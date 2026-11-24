import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDecipheriv } from 'node:crypto';
import { generateToken04 } from '../utils/zegoToken.js';

const SECRET = '0123456789abcdef0123456789abcdef'; // 32 chars, test-only value

// Reverses the Token04 layout so the test can check what is inside
function decodeToken04(token, secret) {
    assert.ok(token.startsWith('04'), 'token starts with version "04"');
    const buf = Buffer.from(token.slice(2), 'base64');
    let offset = 0;
    const expire = Number(buf.readBigInt64BE(offset)); offset += 8;
    const ivLength = buf.readUInt16BE(offset); offset += 2;
    const iv = buf.subarray(offset, offset + ivLength).toString(); offset += ivLength;
    const cipherLength = buf.readUInt16BE(offset); offset += 2;
    const encrypted = buf.subarray(offset, offset + cipherLength); offset += cipherLength;
    assert.equal(offset, buf.length, 'no trailing bytes');

    const decipher = createDecipheriv('aes-256-cbc', secret, iv);
    const json = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    return { expire, iv, info: JSON.parse(json) };
}

test('token carries app id, user id and expiry, encrypted with the secret', () => {
    const before = Math.floor(Date.now() / 1000);
    const token = generateToken04({ appId: 123456789, userId: 'user_1', secret: SECRET, effectiveTimeInSeconds: 3600 });
    const { expire, iv, info } = decodeToken04(token, SECRET);

    assert.equal(iv.length, 16);
    assert.equal(info.app_id, 123456789);
    assert.equal(info.user_id, 'user_1');
    assert.equal(info.payload, '');
    assert.equal(info.expire, info.ctime + 3600);
    assert.equal(expire, info.expire, 'plain-text expiry matches the encrypted one');
    assert.ok(info.ctime >= before && info.ctime <= before + 5);
    assert.ok(Number.isInteger(info.nonce));
});

test('every token uses a fresh iv and nonce', () => {
    const args = { appId: 1, userId: 'u', secret: SECRET, effectiveTimeInSeconds: 60 };
    const a = decodeToken04(generateToken04(args), SECRET);
    const b = decodeToken04(generateToken04(args), SECRET);
    assert.notEqual(a.iv + a.info.nonce, b.iv + b.info.nonce);
});

test('a different secret cannot decrypt the token', () => {
    const token = generateToken04({ appId: 1, userId: 'u', secret: SECRET, effectiveTimeInSeconds: 60 });
    assert.throws(() => decodeToken04(token, 'ffffffffffffffffffffffffffffffff'));
});

test('rejects bad input', () => {
    const ok = { appId: 1, userId: 'u', secret: SECRET, effectiveTimeInSeconds: 60 };
    assert.throws(() => generateToken04({ ...ok, appId: 0 }), /appId/);
    assert.throws(() => generateToken04({ ...ok, appId: '123' }), /appId/);
    assert.throws(() => generateToken04({ ...ok, userId: '' }), /userId/);
    assert.throws(() => generateToken04({ ...ok, secret: 'short' }), /secret/);
    assert.throws(() => generateToken04({ ...ok, effectiveTimeInSeconds: 0 }), /lifetime/);
    assert.throws(() => generateToken04({ ...ok, effectiveTimeInSeconds: 25 * 24 * 3600 }), /lifetime/);
});
