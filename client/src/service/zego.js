import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

let zegoInstance = null;

// Ask for camera + microphone first, so the SDK can turn them on when joining
const requestMediaPermission = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => track.stop());
        return true;
    } catch (error) {
        console.warn('Camera / microphone permission not granted:', error);
        return false;
    }
};

const destroyInstance = () => {
    const instance = zegoInstance;
    zegoInstance = null;
    if (!instance) return;
    try {
        instance.destroy();
    } catch (error) {
        console.error('Error while closing the video room', error);
    }
};

/**
 * Joins a ZEGOCLOUD room using a token created by our server.
 * The ServerSecret is never in the browser: we only receive a short-lived token.
 */
export const joinRoom = async ({ appId, token, roomId, userId, userName, container, onJoin, onLeave }) => {
    if (!container) {
        throw new Error('Video container is not ready');
    }
    if (!appId || !token) {
        throw new Error('Missing video token from the server');
    }

    // Only one room at a time
    destroyInstance();

    const hasPermission = await requestMediaPermission();

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        Number(appId),
        token,
        roomId,
        String(userId),
        userName || `User_${userId}`
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zegoInstance = zp;

    zp.joinRoom({
        container,
        scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
        },
        turnOnCameraWhenJoining: hasPermission,
        turnOnMicrophoneWhenJoining: hasPermission,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showTextChat: true,
        showUserList: true,
        onJoinRoom: () => onJoin?.(),
        onLeaveRoom: () => onLeave?.(),
    });

    return zp;
};

export const leaveRoom = () => {
    destroyInstance();
};
