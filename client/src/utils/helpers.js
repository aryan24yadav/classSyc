import { ROUTES } from './constants';

/**
 * Format a date to a readable local string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

/**
 * Copy text to the clipboard. Returns true on success.
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Link that opens the join page with the room ID filled in
 */
export const buildShareableLink = (origin, roomId) => {
  const base = String(origin || '').replace(/\/+$/, '');
  return `${base}${ROUTES.JOIN}?roomId=${encodeURIComponent(roomId)}`;
};

/**
 * Best human-readable message for a failed API call
 */
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  const serverMessage = error?.response?.data?.error;
  if (typeof serverMessage === 'string' && serverMessage) {
    return serverMessage;
  }
  if (error?.request && !error?.response) {
    return 'Cannot reach the server. Please check your connection and try again.';
  }
  return fallback;
};
