import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '' };

const Auth = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const mode = location.pathname === ROUTES.REGISTER ? 'register' : 'login';

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [localError, setLocalError] = useState('');

    const { login, register, submitting, error, setError, isAuthenticated } = useAuth();

    // Send the user back to the page they came from (e.g. a shared join link)
    const from = location.state?.from;
    const redirectTo = from ? `${from.pathname}${from.search || ''}` : ROUTES.DASHBOARD;

    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirectTo, { replace: true });
        }
    }, [isAuthenticated, navigate, redirectTo]);

    // Clear old errors when switching between Sign In and Sign Up
    useEffect(() => {
        setLocalError('');
        setError(null);
    }, [mode, setError]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setLocalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (mode === 'login') {
            if (!formData.email || !formData.password) {
                setLocalError('Please fill in all fields');
                return;
            }
            await login(formData.email, formData.password);
            return;
        }

        if (!formData.name || !formData.email || !formData.password) {
            setLocalError('Please fill in all fields');
            return;
        }
        if (formData.name.trim().length < 3) {
            setLocalError('Name must be at least 3 characters');
            return;
        }
        if (formData.password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }
        await register(formData.name.trim(), formData.email, formData.password);
    };

    return (
        <AuthForm
            mode={mode}
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            loading={submitting}
            error={localError || error}
            fromState={location.state}
        />
    );
};

export default Auth;
