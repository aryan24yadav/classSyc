import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '../context/sessionContext';
import { ROUTES } from '../utils/constants';
import JoinForm from '../components/session/JoinForm';

const JoinSession = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { joinSession } = useSession();

    // A shareable link opens /join?roomId=..., so the field starts filled in
    const [roomId, setRoomId] = useState(searchParams.get('roomId') || '');
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const id = roomId.trim();
        if (!id) {
            setError('Please enter a room ID');
            return;
        }

        setJoining(true);
        setError('');
        const result = await joinSession(id);
        setJoining(false);

        if (result.success) {
            navigate(`${ROUTES.ROOM}?roomId=${encodeURIComponent(result.session.roomId)}`);
        } else {
            setError(result.error);
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-start justify-center px-4 py-16'>
            <div className='w-full max-w-md'>
                <JoinForm
                    roomId={roomId}
                    onRoomIdChange={(value) => {
                        setRoomId(value);
                        setError('');
                    }}
                    onSubmit={handleSubmit}
                    joining={joining}
                    error={error}
                />
            </div>
        </div>
    );
};

export default JoinSession;
