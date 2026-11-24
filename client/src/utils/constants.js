export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  SESSION: {
    CREATE: '/session/create',
    JOIN: '/session/join',
    END: '/session/end',
    LEAVE: '/session/leave',
    GET: '/session', // Base path, append /:roomId
    LIST: '/session/list',
    // The server creates the ZEGOCLOUD token, so the ServerSecret never reaches the browser
    VIDEO_TOKEN: '/session/zego-token',
  },
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ROOM: '/room',
  JOIN: '/join',
};

// How often the session room refreshes the participant list (ms)
export const SESSION_POLL_INTERVAL = 5000;

const GITHUB_REPO = 'https://github.com/aryan24yadav/classsyc';

export const APP_CONFIG = {
  APP_NAME: 'ClassSync',
  APP_DESCRIPTION: 'Host or join live sessions in your browser with group video, chat and a participant list. Share a room ID and start in seconds.',
  APP_TAGLINE: 'Connect, Learn, Grow Together',
  SOCIAL_LINKS: {
    GITHUB: GITHUB_REPO,
    LINKEDIN: 'https://www.linkedin.com/in/aryan-yadav-a701b3350/',
  },
  FOOTER_LINKS: {
    QUICK_LINKS: [
      { label: 'Home', route: '/', isExternal: false },
      { label: 'Dashboard', route: '/dashboard', isExternal: false },
      { label: 'Sign In', route: '/login', isExternal: false },
      { label: 'Sign Up', route: '/register', isExternal: false },
    ],
    SUPPORT_LINKS: [
      { label: 'Source code', url: GITHUB_REPO, isExternal: true },
      { label: 'Report an issue', url: `${GITHUB_REPO}/issues`, isExternal: true },
    ],
  },
  COPYRIGHT_TEXT: 'All rights reserved.',
  FEATURES: [
    { icon: 'FaVideo', title: 'Group Video', description: 'Group video calls right in the browser, powered by the ZEGOCLOUD UIKit', shortDescription: 'Group video calls in the browser', color: 'blue' },
    { icon: 'FaComments', title: 'Built-in Chat', description: 'Text chat and a live participant list inside every session', shortDescription: 'Text chat during your sessions', color: 'green' },
    { icon: 'FaShieldAlt', title: 'Secure Access', description: 'Only signed-in users who joined the session get a short-lived video token from the server', shortDescription: 'Short-lived video tokens from the server', color: 'purple' },
    { icon: 'FaUsers', title: 'Easy Invites', description: 'Invite participants with a room ID or a shareable link', shortDescription: 'Invite with a room ID or link', color: 'indigo' },
  ],
  BENEFITS: [
    'Host a new session in one click',
    'Invite people with a room ID or a shareable link',
    'Camera, microphone and chat controls',
    'Participant list that refreshes every few seconds',
    'Works in the browser, no downloads',
    'Rejoin your active sessions from the dashboard',
  ],
  TRUST_INDICATORS: [
    'Runs in your browser',
    'Join with a room ID',
    'Sessions saved to your dashboard',
  ],
  HOME_CONTENT: {
    HERO: {
      BADGE_TEXT: 'Live classes in your browser',
      HEADING: 'Connect, Learn,',
      HEADING_HIGHLIGHT: 'Grow Together',
      SUBHEADING: 'Host and join live sessions with group video, chat and a participant list. Share a room ID and start in seconds.',
      CTA_AUTHENTICATED: 'Go to Dashboard',
      CTA_PRIMARY: 'Get Started',
      CTA_SECONDARY: 'Sign In',
    },
    FEATURES: { HEADING: 'Everything You Need for Live Sessions', DESCRIPTION: 'The essentials for running a live class, nothing to install' },
    BENEFITS: { HEADING: 'Why {APP_NAME}?', DESCRIPTION: 'A simple way to run live classes and study sessions with your group.' },
    CTA: { HEADING: 'Ready to Start Your First Session?', DESCRIPTION: 'Create an account and host your first session with {APP_NAME} in under a minute.', BUTTON_AUTHENTICATED: 'Go to Dashboard', BUTTON_GUEST: 'Get Started' },
  },
  DASHBOARD_CONTENT: {
    WELCOME: { GREETING: 'Welcome back, {userName}! 👋', DESCRIPTION: 'Start or join a live session to connect with others' },
    ACTION_CARDS: {
      HOST: { TITLE: 'Host a Session', DESCRIPTION: 'Create a new live session and invite participants to join your class', BUTTON: 'Create Session', BUTTON_LOADING: 'Creating...' },
      JOIN: { TITLE: 'Join a Session', DESCRIPTION: 'Enter a room ID to join an existing live session', BUTTON: 'Join Session' },
    },
    SESSIONS_LIST: { HEADING: 'Your Sessions', DESCRIPTION: 'Active and past sessions you hosted or joined', LOADING: 'Loading sessions...', EMPTY: 'No sessions yet.', FILTER_ALL: 'All', FILTER_ACTIVE: 'Active', FILTER_ENDED: 'Ended', REJOIN_BUTTON: 'Rejoin', ENDED_BUTTON: 'Ended' },
  },
  SESSION_CONTENT: {
    JOIN_FORM: { HEADING: 'Join a Session', DESCRIPTION: 'Enter the room ID to join a live session', ROOM_ID_LABEL: 'Room ID', ROOM_ID_PLACEHOLDER: 'Enter room ID', ROOM_ID_HELP: 'Ask the host for the room ID or the shareable link', BUTTON: 'Join Session', BUTTON_LOADING: 'Joining...' },
    INFO_CARD: { HEADING: 'Session Information', ROOM_ID_LABEL: 'Room ID', SHAREABLE_LINK_LABEL: 'Shareable Link', COPY_BUTTON: 'Copy', COPIED_BUTTON: 'Copied!', STATUS_LABEL: 'Status', PARTICIPANTS_LABEL: 'Participants' },
    HEADER: { HOSTING_TITLE: 'Hosting Session', PARTICIPANT_TITLE: 'Live Session', END_SESSION_BUTTON: 'End Session' },
    VIDEO: {
      TITLE: 'Live Video Session',
      CONNECTED: 'Connected',
      FULLSCREEN: 'Fullscreen',
      CONNECTING: 'Connecting to video room...',
      LEFT: 'You left the video room. The session is still active.',
      REJOIN_BUTTON: 'Rejoin Video',
      RETRY_BUTTON: 'Try Again',
      LEAVE_BUTTON: 'Leave Session',
      END_BUTTON: 'End Session',
    },
    PARTICIPANTS: { HEADING: 'Participants', HOST_LABEL: 'Host', YOU_LABEL: 'You', EMPTY_MESSAGE: 'Participants will appear here as they join' },
    END_CONFIRM: 'End this session for everyone?',
    ENDED_BY_HOST: 'The host ended this session',
    SESSION_ENDED: 'This session has ended',
  },
  AUTH_CONTENT: {
    LOGIN: { HEADING: 'Welcome Back', DESCRIPTION: 'Sign in to continue to your account' },
    REGISTER: { HEADING: 'Create Account', DESCRIPTION: 'Sign up to start hosting and joining live sessions' },
  },
  LOADING_MESSAGES: { SESSION: 'Loading session...', SESSIONS: 'Loading sessions...', GENERAL: 'Loading...' },
};
