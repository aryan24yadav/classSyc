import { FaSpinner } from 'react-icons/fa';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <FaSpinner className='animate-spin text-5xl text-blue-600 mb-4 mx-auto' />
                    <p className='text-lg text-gray-600'>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Remember where the user wanted to go (e.g. a shared join link)
        return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
    }

    return children;
}

export default ProtectedRoute;
