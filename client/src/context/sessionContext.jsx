import { createContext, useCallback, useContext, useMemo } from 'react';
import { API_ENDPOINTS } from '../utils/constants';
import api from '../utils/api';
import { getErrorMessage } from '../utils/helpers';

const SessionContext = createContext(null);

// Runs an API call and returns { success, ...data } or { success: false, error }
const request = async (call, pick, fallbackMessage) => {
    try {
        const response = await call();
        return { success: true, ...pick(response.data.data) };
    } catch (error) {
        return { success: false, error: getErrorMessage(error, fallbackMessage) };
    }
};

export const SessionProvider = ({ children }) => {
    const createSession = useCallback(
        () => request(
            () => api.post(API_ENDPOINTS.SESSION.CREATE),
            (data) => ({ session: data.session }),
            'Failed to create a new session'
        ),
        []
    );

    const joinSession = useCallback(
        (roomId) => request(
            () => api.post(API_ENDPOINTS.SESSION.JOIN, { roomId }),
            (data) => ({ session: data.session }),
            'Failed to join the session'
        ),
        []
    );

    const getSession = useCallback(
        (roomId) => request(
            () => api.get(`${API_ENDPOINTS.SESSION.GET}/${encodeURIComponent(roomId)}`),
            (data) => ({ session: data.session }),
            'Failed to load the session'
        ),
        []
    );

    const leaveSession = useCallback(
        (roomId) => request(
            () => api.post(API_ENDPOINTS.SESSION.LEAVE, { roomId }),
            () => ({}),
            'Failed to leave the session'
        ),
        []
    );

    const endSession = useCallback(
        (roomId) => request(
            () => api.post(API_ENDPOINTS.SESSION.END, { roomId }),
            (data) => ({ session: data.session }),
            'Failed to end the session'
        ),
        []
    );

    const listSessions = useCallback(
        (status = 'all') => request(
            () => api.get(API_ENDPOINTS.SESSION.LIST, { params: { status } }),
            (data) => ({ sessions: data.sessions }),
            'Failed to load your sessions'
        ),
        []
    );

    // Short-lived ZEGOCLOUD token, created by the server
    const getVideoToken = useCallback(
        (roomId) => request(
            () => api.post(API_ENDPOINTS.SESSION.VIDEO_TOKEN, { roomId }),
            (data) => ({ video: data }),
            'Failed to get access to the video room'
        ),
        []
    );

    const value = useMemo(() => ({
        createSession,
        joinSession,
        getSession,
        leaveSession,
        endSession,
        listSessions,
        getVideoToken,
    }), [createSession, joinSession, getSession, leaveSession, endSession, listSessions, getVideoToken]);

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

export default SessionContext;
