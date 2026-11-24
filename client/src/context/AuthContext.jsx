import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { AUTH_EXPIRED_EVENT } from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    // true while we check a saved token on first load
    const [loading, setLoading] = useState(true);
    // true while a login / register request is running
    const [submitting, setSubmitting] = useState(false);

    // Check if the user is already logged in (saved token) on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(API_ENDPOINTS.AUTH.ME);
                setUser(response.data?.data?.user ?? null);
            } catch (err) {
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Log out when any request comes back with an expired / invalid token
    useEffect(() => {
        const handleExpired = () => setUser(null);
        window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
        return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    }, []);

    const authenticate = useCallback(async (endpoint, body, fallbackMessage) => {
        try {
            setError(null);
            setSubmitting(true);

            const response = await api.post(endpoint, body);
            const { user: loggedInUser, token } = response.data.data;

            localStorage.setItem('token', token);
            setUser(loggedInUser);

            return { success: true, user: loggedInUser };
        } catch (err) {
            const errorMessage = getErrorMessage(err, fallbackMessage);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setSubmitting(false);
        }
    }, []);

    const register = useCallback(
        (name, email, password) =>
            authenticate(API_ENDPOINTS.AUTH.REGISTER, { name, email, password }, 'Registration failed'),
        [authenticate]
    );

    const login = useCallback(
        (email, password) => authenticate(API_ENDPOINTS.AUTH.LOGIN, { email, password }, 'Login failed'),
        [authenticate]
    );

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        setError(null);
    }, []);

    const value = {
        user,
        loading,
        submitting,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        setError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
