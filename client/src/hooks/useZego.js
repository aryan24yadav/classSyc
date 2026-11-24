import { useCallback, useEffect, useRef, useState } from 'react';
import { joinRoom, leaveRoom } from '../service/zego';

const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Video room state for a page.
 * status: 'idle'       nothing started yet
 *         'connecting' waiting for the container / creating the room
 *         'ready'      ZEGOCLOUD UI is on screen (pre-join view or room)
 *         'joined'     inside the room
 *         'left'       the user left from the video UI
 *         'error'      joining failed
 */
export const useZego = () => {
    const containerRef = useRef(null);
    const mountedRef = useRef(true);
    const joiningRef = useRef(false);
    // true while *we* close the room, so the SDK's onLeaveRoom is not treated as the user leaving
    const leavingByAppRef = useRef(false);

    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    // Only touch state while the page is still on screen
    const update = useCallback((nextStatus, nextError = null) => {
        if (!mountedRef.current) return;
        setStatus(nextStatus);
        setError(nextError);
    }, []);

    const join = useCallback(async ({ appId, token, roomId, userId, userName, onUserLeft }) => {
        if (joiningRef.current) {
            return { success: false, error: 'Already joining' };
        }
        joiningRef.current = true;
        update('connecting');

        try {
            // The container div may not be in the DOM on the very first render
            for (let i = 0; i < 30 && !containerRef.current; i++) {
                await waitFor(100);
            }
            if (!containerRef.current) {
                throw new Error('Video container is not available');
            }

            // Close any previous room without treating it as the user leaving
            leavingByAppRef.current = true;
            leaveRoom();
            leavingByAppRef.current = false;

            await joinRoom({
                appId,
                token,
                roomId,
                userId,
                userName,
                container: containerRef.current,
                onJoin: () => update('joined'),
                onLeave: () => {
                    if (leavingByAppRef.current) return;
                    update('left');
                    onUserLeft?.();
                },
            });

            // Show the SDK's own UI (it may ask the user to press "Join" first)
            if (mountedRef.current) {
                setStatus((current) => (current === 'joined' ? current : 'ready'));
            }
            return { success: true };
        } catch (err) {
            const message = err?.message
                || 'Failed to join the video room. Check your camera and microphone permissions and try again.';
            update('error', message);
            return { success: false, error: message };
        } finally {
            joiningRef.current = false;
        }
    }, [update]);

    // Show an error in the video area (e.g. the server refused a video token)
    const fail = useCallback((message) => update('error', message), [update]);

    const leave = useCallback(() => {
        leavingByAppRef.current = true;
        leaveRoom();
        update('idle');
    }, [update]);

    // Close the room when the page unmounts
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            leavingByAppRef.current = true;
            leaveRoom();
        };
    }, []);

    return { containerRef, status, error, join, leave, fail };
};
