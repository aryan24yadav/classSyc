import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import { useSession } from '../context/sessionContext';
import { useAuth } from '../context/AuthContext';
import { useZego } from '../hooks/useZego';
import { APP_CONFIG, ROUTES, SESSION_POLL_INTERVAL } from '../utils/constants';
import { buildShareableLink, copyToClipboard } from '../utils/helpers';
import SessionInfoCard from '../components/session/SessionInfoCard';
import VideoContainer from '../components/session/VideoContainer';
import ParticipantsList from '../components/session/ParticipantsList';
import SessionHeader from '../components/session/SessionHeader';

const { SESSION_CONTENT } = APP_CONFIG;

// One page for host and participants: the server says who is the host
const SessionRoom = () => {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('roomId');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getSession, joinSession, leaveSession, endSession, getVideoToken } = useSession();
    const { containerRef, status: videoStatus, error: videoError, join, leave, fail } = useZego();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copiedField, setCopiedField] = useState(null);
    const [busy, setBusy] = useState(false);
    const videoStartedRef = useRef(false);

    const goToDashboard = useCallback(() => navigate(ROUTES.DASHBOARD), [navigate]);

    // 1. Load the session (and join it if this user is not in it yet)
    useEffect(() => {
        let active = true;

        const load = async () => {
            if (!roomId) {
                goToDashboard();
                return;
            }

            const result = await getSession(roomId);
            if (!active) return;

            if (!result.success) {
                toast.error(result.error);
                goToDashboard();
                return;
            }
            if (result.session.status !== 'active') {
                toast.error(SESSION_CONTENT.SESSION_ENDED);
                goToDashboard();
                return;
            }

            let current = result.session;
            if (!current.isHost && !current.isParticipant) {
                const joined = await joinSession(roomId);
                if (!active) return;
                if (!joined.success) {
                    toast.error(joined.error);
                    goToDashboard();
                    return;
                }
                current = joined.session;
            }

            setSession(current);
            setLoading(false);
        };

        load();
        return () => {
            active = false;
        };
    }, [roomId, getSession, joinSession, goToDashboard]);

    const isHost = !!session?.isHost;

    // 2. Ask our server for a video token, then enter the video room
    const startVideo = useCallback(async () => {
        const tokenResult = await getVideoToken(roomId);
        if (!tokenResult.success) {
            fail(tokenResult.error);
            return;
        }

        const { appId, token, userId, userName } = tokenResult.video;
        await join({
            appId,
            token,
            roomId,
            userId,
            userName,
            // The user pressed "Leave" inside the video UI
            onUserLeft: async () => {
                if (!isHost) {
                    await leaveSession(roomId);
                    goToDashboard();
                }
            },
        });
    }, [getVideoToken, join, fail, leaveSession, goToDashboard, roomId, isHost]);

    useEffect(() => {
        if (!session || videoStartedRef.current) return;
        videoStartedRef.current = true;
        startVideo();
    }, [session, startVideo]);

    // 3. Keep the participant list fresh, and notice when the host ends the session
    useEffect(() => {
        if (!roomId || loading) return undefined;

        const interval = setInterval(async () => {
            const result = await getSession(roomId);
            if (!result.success) return;

            if (result.session.status !== 'active') {
                clearInterval(interval);
                leave();
                if (!result.session.isHost) {
                    toast(SESSION_CONTENT.ENDED_BY_HOST);
                }
                goToDashboard();
                return;
            }
            setSession(result.session);
        }, SESSION_POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [roomId, loading, getSession, leave, goToDashboard]);

    const shareableLink = roomId ? buildShareableLink(window.location.origin, roomId) : '';

    const handleCopy = async (field, text) => {
        if (await copyToClipboard(text)) {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } else {
            toast.error('Could not copy. Please copy it manually.');
        }
    };

    const handleFullscreen = () => {
        const element = containerRef.current;
        if (!element) return;
        if (document.fullscreenElement) {
            document.exitFullscreen?.();
        } else {
            element.requestFullscreen?.().catch(() => {});
        }
    };

    const handleEndSession = async () => {
        if (!isHost || busy) return;
        if (!window.confirm(SESSION_CONTENT.END_CONFIRM)) return;

        setBusy(true);
        const result = await endSession(roomId);
        setBusy(false);

        if (!result.success) {
            toast.error(result.error);
            return;
        }
        leave();
        toast.success('Session ended');
        goToDashboard();
    };

    const handleLeave = async () => {
        if (isHost) {
            handleEndSession();
            return;
        }
        if (busy) return;

        setBusy(true);
        leave();
        const result = await leaveSession(roomId);
        setBusy(false);
        if (!result.success) {
            toast.error(result.error);
        }
        goToDashboard();
    };

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <FaSpinner className='animate-spin h-12 w-12 text-blue-600 mx-auto' />
                    <p className='mt-4 text-gray-600'>{APP_CONFIG.LOADING_MESSAGES.SESSION}</p>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
            <SessionHeader
                title={isHost ? SESSION_CONTENT.HEADER.HOSTING_TITLE : SESSION_CONTENT.HEADER.PARTICIPANT_TITLE}
                roomId={roomId}
                userName={user?.name}
                onBack={goToDashboard}
                showEndButton={isHost}
                endButtonText={SESSION_CONTENT.HEADER.END_SESSION_BUTTON}
                onEndSession={handleEndSession}
                disabled={busy}
            />

            <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    <div className='lg:col-span-2 space-y-6'>
                        <SessionInfoCard
                            roomId={roomId}
                            shareableLink={shareableLink}
                            status={session.status}
                            participantsCount={session.participantsCount}
                            copiedField={copiedField}
                            onCopyRoomId={() => handleCopy('roomId', roomId)}
                            onCopyLink={() => handleCopy('link', shareableLink)}
                        />

                        <VideoContainer
                            containerRef={containerRef}
                            status={videoStatus}
                            error={videoError}
                            onFullscreen={handleFullscreen}
                            onRejoin={startVideo}
                            onLeave={handleLeave}
                            leaveButtonText={isHost ? SESSION_CONTENT.VIDEO.END_BUTTON : SESSION_CONTENT.VIDEO.LEAVE_BUTTON}
                            disabled={busy}
                        />
                    </div>

                    <div className='lg:col-span-1'>
                        <ParticipantsList
                            participants={session.participants || []}
                            hostId={session.hostId}
                            currentUserId={user?.id}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SessionRoom;
