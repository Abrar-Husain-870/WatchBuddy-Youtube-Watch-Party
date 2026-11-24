/**
 * History Manager for Watch Party Sessions and Shared Videos
 * Persists watch party logs to localStorage so users can review past parties,
 * see who the admin, moderators, and participants were, and re-watch videos.
 */

const STORAGE_KEY = 'watchbuddy_room_history';

export const INITIAL_HISTORY_SESSIONS = [
  {
    id: 'session-1',
    roomCode: 'HELL0168',
    date: 'Today, 1:45 PM',
    timestamp: Date.now() - 1000 * 60 * 30,
    admin: { name: 'Alex', role: 'Host' },
    moderators: [{ name: 'Bella', role: 'Moderator' }],
    participants: ['Alex', 'Bella', 'Jake', 'Charlie'],
    videos: [
      {
        id: 'dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
        channel: 'Rick Astley',
        duration: '3:33',
        watchedAt: '1:46 PM'
      },
      {
        id: 'kXYiU_JCYtU',
        title: 'Linkin Park - Numb [Official Music Video 4K Remaster]',
        channel: 'Linkin Park',
        duration: '3:07',
        watchedAt: '1:52 PM'
      }
    ]
  },
  {
    id: 'session-2',
    roomCode: 'LOFI-NIGHT',
    date: 'Yesterday, 9:20 PM',
    timestamp: Date.now() - 1000 * 60 * 60 * 16,
    admin: { name: 'David Kim', role: 'Host' },
    moderators: [{ name: 'Alex', role: 'Moderator' }],
    participants: ['David Kim', 'Alex', 'Emma Watson'],
    videos: [
      {
        id: '5qap5aO4i9A',
        title: 'lofi hip hop radio 📚 - beats to relax/study to',
        channel: 'Lofi Girl',
        duration: 'LIVE',
        watchedAt: '9:20 PM'
      }
    ]
  },
  {
    id: 'session-3',
    roomCode: 'TRAILERS-LIVE',
    date: '2 days ago',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    admin: { name: 'Charlie', role: 'Host' },
    moderators: [],
    participants: ['Charlie', 'Jake Reynolds', 'Bella'],
    videos: [
      {
        id: 'QdBZY2fkU-0',
        title: 'Grand Theft Auto VI Trailer 1 (Official 4K)',
        channel: 'Rockstar Games',
        duration: '1:31',
        watchedAt: '6:10 PM'
      },
      {
        id: 'giXco2jaZ_4',
        title: 'Top Gun: Maverick | Official Trailer (2022 Movie) - Tom Cruise',
        channel: 'Paramount Pictures',
        duration: '2:30',
        watchedAt: '6:15 PM'
      }
    ]
  }
];

export function getHistorySessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HISTORY_SESSIONS));
      return INITIAL_HISTORY_SESSIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load history', e);
    return INITIAL_HISTORY_SESSIONS;
  }
}

export function saveHistorySessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

/**
 * Record a room session or update currently playing video
 */
export function recordRoomVideoPlay(room, currentUser, participants, videoDetails) {
  if (!room || !room.roomId) return;

  const sessions = getHistorySessions();
  const existingIdx = sessions.findIndex(s => s.roomCode === room.roomId);

  const videoEntry = {
    id: videoDetails?.id || room.videoId,
    title: videoDetails?.title || `YouTube Video (${room.videoId})`,
    channel: videoDetails?.channel || 'YouTube',
    duration: videoDetails?.duration || '3:30',
    watchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const adminParticipant = participants.find(p => p.role === 'Host') || { name: currentUser?.name || 'Host', role: 'Host' };
  const mods = participants.filter(p => p.role === 'Moderator').map(p => ({ name: p.name, role: 'Moderator' }));
  const allNames = participants.map(p => p.name);

  if (existingIdx >= 0) {
    const session = sessions[existingIdx];
    // Avoid duplicate continuous entries for same video ID
    const hasVideo = session.videos.some(v => v.id === videoEntry.id);
    if (!hasVideo) {
      session.videos.unshift(videoEntry);
    }
    session.participants = Array.from(new Set([...session.participants, ...allNames]));
    if (mods.length > 0) session.moderators = mods;
    sessions[existingIdx] = session;
  } else {
    const newSession = {
      id: `session-${Date.now()}`,
      roomCode: room.roomId,
      date: 'Just now',
      timestamp: Date.now(),
      admin: { name: adminParticipant.name, role: 'Host' },
      moderators: mods,
      participants: allNames.length > 0 ? allNames : [currentUser?.name || 'User'],
      videos: [videoEntry]
    };
    sessions.unshift(newSession);
  }

  saveHistorySessions(sessions);
}

