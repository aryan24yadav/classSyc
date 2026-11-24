import React from 'react';
import { FaCheck, FaCopy } from 'react-icons/fa';
import { APP_CONFIG } from '../../utils/constants';

const { INFO_CARD } = APP_CONFIG.SESSION_CONTENT;

const CopyButton = ({ copied, onClick }) => (
    <button
        type='button'
        onClick={onClick}
        className='inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-shrink-0'
    >
        {copied ? <FaCheck className='w-4 h-4 mr-1' /> : <FaCopy className='w-4 h-4 mr-1' />}
        {copied ? INFO_CARD.COPIED_BUTTON : INFO_CARD.COPY_BUTTON}
    </button>
);

const SessionInfoCard = ({ roomId, shareableLink, status, participantsCount, copiedField, onCopyRoomId, onCopyLink }) => {
    const isActive = status === 'active';

    return (
        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
            <h2 className='text-lg font-bold text-gray-900 mb-4'>{INFO_CARD.HEADING}</h2>

            <div className='space-y-4'>
                <div>
                    <p className='text-sm font-medium text-gray-500 mb-1'>{INFO_CARD.ROOM_ID_LABEL}</p>
                    <div className='flex items-center gap-3'>
                        <code className='flex-1 min-w-0 truncate px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-mono'>
                            {roomId}
                        </code>
                        <CopyButton copied={copiedField === 'roomId'} onClick={onCopyRoomId} />
                    </div>
                </div>

                <div>
                    <p className='text-sm font-medium text-gray-500 mb-1'>{INFO_CARD.SHAREABLE_LINK_LABEL}</p>
                    <div className='flex items-center gap-3'>
                        <span className='flex-1 min-w-0 truncate px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700'>
                            {shareableLink}
                        </span>
                        <CopyButton copied={copiedField === 'link'} onClick={onCopyLink} />
                    </div>
                </div>

                <div className='flex flex-wrap gap-6 pt-2'>
                    <div>
                        <p className='text-sm font-medium text-gray-500'>{INFO_CARD.STATUS_LABEL}</p>
                        <span className={`inline-flex items-center mt-1 px-3 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {status}
                        </span>
                    </div>
                    <div>
                        <p className='text-sm font-medium text-gray-500'>{INFO_CARD.PARTICIPANTS_LABEL}</p>
                        <p className='mt-1 text-lg font-semibold text-gray-900'>{participantsCount ?? 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionInfoCard;
