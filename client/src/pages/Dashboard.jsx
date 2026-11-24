import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/sessionContext';
import { ROUTES } from '../utils/constants';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import ActionCard from '../components/dashboard/ActionCard';
import FeaturesGrid from '../components/dashboard/FeaturesGrid';
import SessionList from '../components/dashboard/SessionList';

const roomLink = (roomId) => `${ROUTES.ROOM}?roomId=${encodeURIComponent(roomId)}`;

const Dashboard = () => {
    const { user } = useAuth();
    const { createSession, listSessions } = useSession();
    const navigate = useNavigate();

    const [creating, setCreating] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [listError, setListError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoadingSessions(true);
            const result = await listSessions(statusFilter);
            if (!active) return;
            if (result.success) {
                setSessions(result.sessions);
                setListError('');
            } else {
                setListError(result.error);
            }
            setLoadingSessions(false);
        };
        load();
        return () => {
            active = false;
        };
    }, [listSessions, statusFilter]);

    const handleCreateSession = async () => {
        setCreating(true);
        const result = await createSession();
        setCreating(false);
        if (result.success) {
            navigate(roomLink(result.session.roomId));
        } else {
            toast.error(result.error);
        }
    };

    // You are already in your own sessions, so "Rejoin" opens the room directly
    const handleRejoinSession = (session) => {
        if (session.status === 'active') {
            navigate(roomLink(session.roomId));
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
            <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
                <WelcomeSection userName={user?.name} />

                <ActionCard
                    onCreateSession={handleCreateSession}
                    onJoinSession={() => navigate(ROUTES.JOIN)}
                    creating={creating}
                />

                <FeaturesGrid />

                {listError && (
                    <div className='mt-12 max-w-5xl mx-auto bg-red-50 border border-red-500 text-red-700 p-4 rounded-lg shadow-sm flex items-center'>
                        <FaExclamationCircle className='w-5 h-5 mr-2' />
                        <span>{listError}</span>
                    </div>
                )}

                <SessionList
                    sessions={sessions}
                    loading={loadingSessions}
                    statusFilter={statusFilter}
                    onFilterChange={setStatusFilter}
                    onRejoinSession={handleRejoinSession}
                />
            </main>
        </div>
    );
};

export default Dashboard;
