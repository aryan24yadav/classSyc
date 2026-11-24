import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBearerToken } from '../utils/http.js';

test('reads the token from a Bearer header', () => {
    assert.equal(getBearerToken('Bearer abc.def.ghi'), 'abc.def.ghi');
    assert.equal(getBearerToken('bearer abc'), 'abc');
    assert.equal(getBearerToken('  Bearer   abc  '), 'abc');
});

test('returns null for missing or malformed headers', () => {
    assert.equal(getBearerToken(undefined), null);
    assert.equal(getBearerToken(''), null);
    assert.equal(getBearerToken('Bearer'), null);
    assert.equal(getBearerToken('Basic abc'), null);
    assert.equal(getBearerToken('abc'), null);
    assert.equal(getBearerToken('Bearer a b'), null);
});
