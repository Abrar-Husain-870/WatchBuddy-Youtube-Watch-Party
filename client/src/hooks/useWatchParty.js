import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { formatTime } from '../utils/youtubeHelper';
import { recordRoomVideoPlay } from '../utils/historyManager';
import confetti from 'canvas-confetti';

/**
 * Custom Hook: useWatchParty
 * Manages all watch party state: room, user, participants, playback state, chat, requests.
 */
export function useWatchParty() {
  const { socket, isConnected } = useSocket();

  const [currentUser, setCurrentUser] = useState(null); // { id, username, role }
  const [room, setRoom] = useState(null); // { roomId, hostId, videoId, playState, currentTime }
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [systemAlert, setSystemAlert] = useState(null); // { type: 'info'|'warning'|'error', text }
  const [incomingRequests, setIncomingRequests] = useState([]); // for host/moderator review
  const [isKicked, setIsKicked] = useState(false);

  // Clear transient alert after 4 seconds
  useEffect(() => {
    if (systemAlert) {
      const timer = setTimeout(() => setSystemAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [systemAlert]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Room created
    socket.on('room_created', (data) => {
      setCurrentUser(data.user);
      setRoom({
        roomId: data.roomId,
        hostId: data.user.id,
        videoId: data.syncState.videoId,
        playState: data.syncState.playState,
        currentTime: data.syncState.currentTime
      });
      setParticipants(data.participants);
      setIsKicked(false);

      // Celebrate room creation
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

      recordRoomVideoPlay(
        { roomId: data.roomId, videoId: data.syncState.videoId },
        data.user,
        data.participants
      );
    });

    // Room joined
    socket.on('room_joined', (data) => {
      setCurrentUser(data.user);
      setRoom({
        roomId: data.roomId,
        hostId: data.syncState.hostId,
        videoId: data.syncState.videoId,
        playState: data.syncState.playState,
        currentTime: data.syncState.currentTime
      });
      setParticipants(data.participants);
      setIsKicked(false);

      recordRoomVideoPlay(
        { roomId: data.roomId, videoId: data.syncState.videoId },
        data.user,
        data.participants
      );
    });

    // Sync state update
    socket.on('sync_state', (syncState) => {
      setRoom(prev => ({
        ...prev,
        ...syncState
      }));
    });

    // Real-Time Play Event (silent - no chat spam or window scrolling)
    socket.on('play', ({ currentTime, lastUpdated }) => {
      setRoom(prev => prev ? ({
        ...prev,
        playState: 'playing',
        currentTime: typeof currentTime === 'number' ? currentTime : prev.currentTime,
        lastUpdated: lastUpdated || Date.now()
      }) : prev);
    });

    // Real-Time Pause Event (silent - no chat spam or window scrolling)
    socket.on('pause', ({ currentTime, lastUpdated }) => {
      setRoom(prev => prev ? ({
        ...prev,
        playState: 'paused',
        currentTime: typeof currentTime === 'number' ? currentTime : prev.currentTime,
        lastUpdated: lastUpdated || Date.now()
      }) : prev);
    });

    // Real-Time Seek Event (silent - no chat spam or window scrolling)
    socket.on('seek', ({ time, lastUpdated }) => {
      setRoom(prev => prev ? ({
        ...prev,
        currentTime: time,
        lastSeek: { time, timestamp: Date.now() },
        lastUpdated: lastUpdated || Date.now()
      }) : prev);
    });

    // Real-Time Change Video Event (shows Toast update)
    socket.on('change_video', ({ videoId, username, syncState }) => {
      setRoom(prev => prev ? ({
        ...prev,
        videoId: videoId,
        playState: syncState?.playState || 'paused',
        currentTime: 0
      }) : prev);

      if (username) {
        setSystemAlert({
          type: 'info',
          text: `🎬 ${username} changed video.`
        });
      }

      setRoom(current => {
        if (current) {
          recordRoomVideoPlay(
            { roomId: current.roomId, videoId: videoId },
            currentUser,
            participants
          );
        }
        return current;
      });
    });

    // Another user joined (Toast + clean log)
    socket.on('user_joined', ({ user, participants }) => {
      setParticipants(participants);
      setSystemAlert({
        type: 'info',
        text: `👋 ${user.username} joined the room.`
      });
      setChatMessages(prev => [
        ...prev,
        {
          id: `sys_${Date.now()}`,
          isSystem: true,
          message: `${user.username} joined the party! 🎉`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    });

    // User left (Toast + clean log)
    socket.on('user_left', ({ username, participants, newHost }) => {
      setParticipants(participants);
      let alertMsg = `${username} left the room.`;
      if (newHost) {
        alertMsg += ` 👑 ${newHost.username} is now Host!`;
        setCurrentUser(curr => (curr && curr.id === newHost.id ? { ...curr, role: 'Host' } : curr));
        setRoom(prev => (prev ? { ...prev, hostId: newHost.id } : prev));
      }
      setSystemAlert({
        type: 'info',
        text: alertMsg
      });
      setChatMessages(prev => [
        ...prev,
        {
          id: `sys_${Date.now()}`,
          isSystem: true,
          message: alertMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    });

    // Role assigned (Toast + clean log)
    socket.on('role_assigned', ({ userId, username, role, participants }) => {
      setParticipants(participants);
      setCurrentUser(curr => {
        if (curr && curr.id === userId) {
          setSystemAlert({ type: 'info', text: `Your role was updated to: ${role}` });
          return { ...curr, role };
        }
        return curr;
      });

      setSystemAlert({
        type: 'info',
        text: `🛡️ ${username} is now ${role}.`
      });

      setChatMessages(prev => [
        ...prev,
        {
          id: `sys_${Date.now()}`,
          isSystem: true,
          message: `🛡️ ${username}'s role was set to ${role}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    });

    // Host transferred
    socket.on('host_transferred', ({ newHostId, newHostUsername, participants }) => {
      setParticipants(participants);
      setRoom(prev => (prev ? { ...prev, hostId: newHostId } : prev));
      setCurrentUser(curr => {
        if (!curr) return curr;
        if (curr.id === newHostId) return { ...curr, role: 'Host' };
        if (curr.role === 'Host') return { ...curr, role: 'Moderator' };
        return curr;
      });

      setSystemAlert({ type: 'info', text: `👑 Host transferred to ${newHostUsername}` });
      setChatMessages(prev => [
        ...prev,
        {
          id: `sys_${Date.now()}`,
          isSystem: true,
          message: `👑 ${newHostUsername} is now the Room Host.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    });

    // Participant removed (kicked)
    socket.on('participant_removed', ({ message }) => {
      setIsKicked(true);
      setRoom(null);
      setCurrentUser(null);
      setSystemAlert({ type: 'error', text: message });
    });

    // Incoming change request (for Host / Moderator)
    socket.on('change_requested', (changeRequest) => {
      setIncomingRequests(prev => [...prev, changeRequest]);
      setSystemAlert({
        type: 'info',
        text: `Incoming suggestion from ${changeRequest.requesterName}`
      });
    });

    // Change request resolved
    socket.on('change_request_resolved', ({ approved, approver, requesterName }) => {
      const statusText = approved ? 'approved' : 'rejected';
      setChatMessages(prev => [
        ...prev,
        {
          id: `sys_${Date.now()}`,
          isSystem: true,
          message: `Suggestion by ${requesterName} was ${statusText} by ${approver}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    });

    // Chat messages
    socket.on('chat_message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    // Error messages
    socket.on('error_message', ({ message }) => {
      setSystemAlert({ type: 'error', text: message });
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('sync_state');
      socket.off('play');
      socket.off('pause');
      socket.off('seek');
      socket.off('change_video');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('role_assigned');
      socket.off('host_transferred');
      socket.off('participant_removed');
      socket.off('change_requested');
      socket.off('change_request_resolved');
      socket.off('chat_message');
      socket.off('error_message');
    };
  }, [socket]);

  // Actions
  const createRoom = useCallback((username, customRoomId, initialVideoId) => {
    if (!socket) return;
    socket.emit('create_room', { username, customRoomId, initialVideoId });
  }, [socket]);

  const joinRoom = useCallback((roomId, username) => {
    if (!socket) return;
    socket.emit('join_room', { roomId, username });
  }, [socket]);

  const leaveRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('leave_room');
    setRoom(null);
    setCurrentUser(null);
    setParticipants([]);
    setChatMessages([]);
  }, [socket]);

  const sendPlay = useCallback((currentTime) => {
    if (!socket) return;
    socket.emit('play', { currentTime });
  }, [socket]);

  const sendPause = useCallback((currentTime) => {
    if (!socket) return;
    socket.emit('pause', { currentTime });
  }, [socket]);

  const sendSeek = useCallback((time) => {
    if (!socket) return;
    socket.emit('seek', { time });
  }, [socket]);

  const sendChangeVideo = useCallback((videoId) => {
    if (!socket) return;
    socket.emit('change_video', { videoId });
  }, [socket]);

  const assignRole = useCallback((targetUserId, role) => {
    if (!socket) return;
    socket.emit('assign_role', { targetUserId, role });
  }, [socket]);

  const removeParticipant = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('remove_participant', { targetUserId });
  }, [socket]);

  const transferHost = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('transfer_host', { targetUserId });
  }, [socket]);

  const submitChangeRequest = useCallback((type, details) => {
    if (!socket) return;
    socket.emit('request_change', { type, details });
    setSystemAlert({ type: 'info', text: 'Suggestion sent to Host/Moderators!' });
  }, [socket]);

  const resolveChangeRequest = useCallback((requestId, approved) => {
    if (!socket) return;
    socket.emit('approve_change', { requestId, approved });
    setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
  }, [socket]);

  const sendChat = useCallback((message) => {
    if (!socket) return;
    socket.emit('send_chat', { message });
  }, [socket]);

  const canControl = currentUser?.role === 'Host' || currentUser?.role === 'Moderator';
  const isHost = currentUser?.role === 'Host';

  return {
    socket,
    isConnected,
    currentUser,
    room,
    participants,
    chatMessages,
    systemAlert,
    incomingRequests,
    isKicked,
    canControl,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
    sendPlay,
    sendPause,
    sendSeek,
    sendChangeVideo,
    assignRole,
    removeParticipant,
    transferHost,
    submitChangeRequest,
    resolveChangeRequest,
    sendChat
  };
}
