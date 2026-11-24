import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRoomId, isValidRoomId, ROOM_ID_LENGTH } from '../utils/roomId.js';

test('room ids have the right length and no look-alike characters', () => {
    for (let i = 0; i < 500; i++) {
        const id = generateRoomId();
        assert.equal(id.length, ROOM_ID_LENGTH);
        assert.match(id, /^[A-Za-z0-9]+$/);
        assert.doesNotMatch(id, /[01OIl]/);
        assert.ok(isValidRoomId(id));
    }
});

test('room ids do not repeat', () => {
    const ids = new Set(Array.from({ length: 2000 }, () => generateRoomId()));
    assert.equal(ids.size, 2000);
});

test('isValidRoomId rejects bad values', () => {
    assert.equal(isValidRoomId(''), false);
    assert.equal(isValidRoomId('abc'), false);
    assert.equal(isValidRoomId('abc def ghi'), false);
    assert.equal(isValidRoomId({ $ne: null }), false);
});
