import { buildShareableLink, getErrorMessage } from './helpers';

describe('buildShareableLink', () => {
  test('points to the join page with the room ID', () => {
    expect(buildShareableLink('https://classsync.app', 'AbC234xyz789')).toBe(
      'https://classsync.app/join?roomId=AbC234xyz789'
    );
  });

  test('does not create a double slash when the origin ends with /', () => {
    expect(buildShareableLink('http://localhost:3000/', 'room42abc')).toBe(
      'http://localhost:3000/join?roomId=room42abc'
    );
  });

  test('encodes unsafe characters', () => {
    expect(buildShareableLink('http://x.test', 'a b&c')).toBe('http://x.test/join?roomId=a%20b%26c');
  });
});

describe('getErrorMessage', () => {
  test('uses the message sent by the server', () => {
    const error = { response: { status: 404, data: { error: 'Session not found' } } };
    expect(getErrorMessage(error, 'fallback')).toBe('Session not found');
  });

  test('explains when the server cannot be reached', () => {
    const error = { request: {}, message: 'Network Error' };
    expect(getErrorMessage(error, 'fallback')).toMatch(/cannot reach the server/i);
  });

  test('falls back when there is nothing better', () => {
    expect(getErrorMessage({ response: { status: 500, data: {} } }, 'Failed to join')).toBe('Failed to join');
    expect(getErrorMessage(undefined, 'Failed to join')).toBe('Failed to join');
  });
});
