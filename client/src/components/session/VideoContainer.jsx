import React from 'react';
import { FaCircle, FaExclamationCircle, FaExpand, FaSpinner } from 'react-icons/fa';
import { APP_CONFIG } from '../../utils/constants';

const { VIDEO } = APP_CONFIG.SESSION_CONTENT;

// status: 'idle' | 'connecting' | 'ready' | 'joined' | 'left' | 'error' (see hooks/useZego.js)
const VideoContainer = ({ containerRef, status, error, onFullscreen, onRejoin, onLeave, leaveButtonText, disabled }) => {
    // Once the SDK UI is on screen ('ready' / 'joined') the overlay must not cover it
    const showOverlay = status === 'idle' || status === 'connecting' || status === 'left' || status === 'error';

    return (
        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
                <div className='flex items-center space-x-3'>
                    <h2 className='text-lg font-bold text-gray-900'>{VIDEO.TITLE}</h2>
                    {status === 'joined' && (
                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700'>
                            <FaCircle className='w-2 h-2 mr-1' />
                            {VIDEO.CONNECTED}
                        </span>
                    )}
                </div>
                <button
                    type='button'
                    onClick={onFullscreen}
                    className='inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                >
                    <FaExpand className='w-4 h-4 mr-2' />
                    {VIDEO.FULLSCREEN}
                </button>
            </div>

            <div className='relative bg-gray-900'>
                {/* ZEGOCLOUD renders the video UI inside this div. It must always exist and have a size. */}
                <div ref={containerRef} className='w-full h-[520px]' />

                {showOverlay && (
                    <div className='absolute inset-0 flex items-center justify-center bg-gray-900/90 text-center p-6'>
                        {status === 'error' ? (
                            <div>
                                <FaExclamationCircle className='w-10 h-10 text-red-400 mx-auto mb-3' />
                                <p className='text-white mb-4'>{error}</p>
                                <button
                                    type='button'
                                    onClick={onRejoin}
                                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700'
                                >
                                    {VIDEO.RETRY_BUTTON}
                                </button>
                            </div>
                        ) : status === 'left' ? (
                            <div>
                                <p className='text-white mb-4'>{VIDEO.LEFT}</p>
                                <button
                                    type='button'
                                    onClick={onRejoin}
                                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700'
                                >
                                    {VIDEO.REJOIN_BUTTON}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <FaSpinner className='animate-spin w-10 h-10 text-blue-400 mx-auto mb-3' />
                                <p className='text-gray-200'>{VIDEO.CONNECTING}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className='px-6 py-4 border-t border-gray-100 flex justify-end'>
                <button
                    type='button'
                    onClick={onLeave}
                    disabled={disabled}
                    className='px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {leaveButtonText}
                </button>
            </div>
        </div>
    );
};

export default VideoContainer;
