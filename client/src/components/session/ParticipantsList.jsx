import React from 'react';
import { APP_CONFIG } from '../../utils/constants';

const { PARTICIPANTS } = APP_CONFIG.SESSION_CONTENT;

const ParticipantsList = ({ participants, hostId, currentUserId }) => {
    const isSameUser = (a, b) => a != null && b != null && String(a) === String(b);

    return (
        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
            <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-bold text-gray-900'>{PARTICIPANTS.HEADING}</h2>
                <span className='text-sm font-semibold text-gray-500'>{participants.length}</span>
            </div>

            {participants.length === 0 ? (
                <p className='text-sm text-gray-500'>{PARTICIPANTS.EMPTY_MESSAGE}</p>
            ) : (
                <ul className='space-y-3'>
                    {participants.map((p) => {
                        const isHost = isSameUser(p.userId, hostId);
                        const isMe = isSameUser(p.userId, currentUserId);
                        return (
                            <li key={String(p.userId)} className='flex items-center space-x-3'>
                                <div className='w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0'>
                                    <span className='text-white text-sm font-semibold'>
                                        {p.userName?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className='flex-1 min-w-0 truncate text-gray-800 font-medium'>
                                    {p.userName}
                                    {isMe && <span className='text-gray-400 font-normal'> ({PARTICIPANTS.YOU_LABEL})</span>}
                                </span>
                                {isHost && (
                                    <span className='text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full'>
                                        {PARTICIPANTS.HOST_LABEL}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default ParticipantsList;
