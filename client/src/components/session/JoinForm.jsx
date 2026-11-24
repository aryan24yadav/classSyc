import React from 'react';
import { FaExclamationCircle, FaSignInAlt, FaSpinner } from 'react-icons/fa';
import { APP_CONFIG } from '../../utils/constants';

const { JOIN_FORM } = APP_CONFIG.SESSION_CONTENT;

const JoinForm = ({ roomId, onRoomIdChange, onSubmit, joining, error }) => {
    return (
        <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
            <div className='text-center mb-6'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-4'>
                    <FaSignInAlt className='w-8 h-8 text-white' />
                </div>
                <h1 className='text-2xl font-bold text-gray-900'>{JOIN_FORM.HEADING}</h1>
                <p className='mt-2 text-sm text-gray-600'>{JOIN_FORM.DESCRIPTION}</p>
            </div>

            <form onSubmit={onSubmit} className='space-y-5'>
                {error && (
                    <div className='bg-red-50 border border-red-500 text-red-700 p-4 rounded-lg flex items-start'>
                        <FaExclamationCircle className='w-5 h-5 mr-2 mt-0.5 flex-shrink-0' />
                        <span className='text-sm'>{error}</span>
                    </div>
                )}

                <div>
                    <label htmlFor='roomId' className='block text-sm font-medium text-gray-700 mb-2'>
                        {JOIN_FORM.ROOM_ID_LABEL}
                    </label>
                    <input
                        id='roomId'
                        name='roomId'
                        type='text'
                        autoComplete='off'
                        required
                        value={roomId}
                        onChange={(e) => onRoomIdChange(e.target.value)}
                        placeholder={JOIN_FORM.ROOM_ID_PLACEHOLDER}
                        className='block w-full px-4 py-3 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors'
                    />
                    <p className='mt-2 text-xs text-gray-500'>{JOIN_FORM.ROOM_ID_HELP}</p>
                </div>

                <button
                    type='submit'
                    disabled={joining || !roomId.trim()}
                    className='w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                >
                    {joining ? (
                        <>
                            <FaSpinner className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' />
                            {JOIN_FORM.BUTTON_LOADING}
                        </>
                    ) : (
                        JOIN_FORM.BUTTON
                    )}
                </button>
            </form>
        </div>
    );
};

export default JoinForm;
