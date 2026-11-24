const roomManager = require('../managers/RoomManager');
const {
  canControlPlayback,
  canAssignRoles,
  canRemoveParticipant,
  canTransferHost
} = require('./permissions');

/**
 * Socket.IO Handler
 * Registers all real-time events, applies permission checks, and broadcasts updates.
 * @param {import('socket.io').Server} io
 */
function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    // -------------------------------------------------------------
    // CREATE ROOM
    // -------------------------------------------------------------
    socket.on('create_room', ({ username, customRoomId, initialVideoId }) => {
      try {
        const cleanName = (username || 'Host').trim().substring(0, 30);
        const { room, host } = roomManager.createRoom(cleanName, socket.id, customRoomId, initialVideoId);

        socket.join(room.roomId);

        // Send confirmation back to creator
        socket.emit('room_created', {
          roomId: room.roomId,
          user: host.toJSON(),
          syncState: room.getSyncState(),
          participants: room.getParticipantsList()
        });

        // Also broadcast initial state
        socket.emit('sync_state', room.getSyncState());
      } catch (err) {
        socket.emit('error_message', { message: 'Failed to create room: ' + err.message });
      }
    });

    // -------------------------------------------------------------
    // JOIN ROOM (Creator becomes Host, subsequent joiners become Participant)
    // -------------------------------------------------------------
    socket.on('join_room', ({ roomId, username, initialVideoId }) => {
      try {
        if (!roomId) {
          return socket.emit('error_message', { message: 'Room code is required.' });
        }

        const cleanName = (username || 'User').trim().substring(0, 30);
        const existingRoom = roomManager.getRoom(roomId);

        let room, user;

        if (!existingRoom) {
          // Room does not exist yet: First user is creator -> Auto-assign Host role
          const created = roomManager.createRoom(cleanName, socket.id, roomId, initialVideoId);
          room = created.room;
          user = created.host;
        } else {
          // Room exists: Join as Participant
          const joined = roomManager.joinRoom(roomId, cleanName, socket.id);
          room = joined.room;
          user = joined.participant;
        }

        socket.join(room.roomId);

        // Send confirmation/welcome payload
        socket.emit('room_joined', {
          roomId: room.roomId,
          user: user.toJSON(),
          syncState: room.getSyncState(),
          participants: room.getParticipantsList()
        });

        // Also emit room_created if creator for backwards compatibility with our UI
        if (user.role === 'Host') {
          socket.emit('room_created', {
            roomId: room.roomId,
            user: user.toJSON(),
            syncState: room.getSyncState(),
            participants: room.getParticipantsList()
          });
        }

        // Send current video sync state directly to joiner
        socket.emit('sync_state', room.getSyncState());

        // Broadcast to existing room members that a new user joined
        socket.to(room.roomId).emit('user_joined', {
          user: user.toJSON(),
          userId: user.id,
          username: user.username,
          role: user.role,
          participants: room.getParticipantsList()
        });
      } catch (err) {
        socket.emit('error_message', { message: 'Failed to join room: ' + err.message });
      }
    });

    // -------------------------------------------------------------
    // PLAY
    // -------------------------------------------------------------
    socket.on('play', ({ currentTime }) => {
      const session = roomManager.getRoomBySocket(socket.id);
      if (!session) return;
      const { room, participant } = session;

      if (!canControlPlayback(participant.role)) {
        return socket.emit('error_message', {
          message: 'Permission denied: Only Host or Moderator can control playback.'
        });
      }

      const syncTime = typeof currentTime === 'number' ? currentTime : room.getEffectiveTime();
      room.updatePlayback('playing', syncTime);

      io.to(room.roomId).emit('play', {
        currentTime: syncTime,
        lastUpdated: room.lastUpdated,
        userId: participant.id,
        username: participant.username
      });
    });

    // -------------------------------------------------------------
    // PAUSE
    // -------------------------------------------------------------
    socket.on('pause', ({ currentTime }) => {
      const session = roomManager.getRoomBySocket(socket.id);
      if (!session) return;
      const { room, participant } = session;

      if (!canControlPlayback(participant.role)) {
        return socket.emit('error_message', {
          message: 'Permission denied: Only Host or Moderator can control playback.'
        });
      }

      const syncTime = typeof currentTime === 'number' ? currentTime : room.getEffectiveTime();
      room.updatePlayback('paused', syncTime);

      io.to(room.roomId).emit('pause', {
        currentTime: syncTime,
        lastUpdated: room.lastUpdated,
        userId: participant.id,
        username: participant.username
      });
    });

    // -------------------------------------------------------------
    // SEEK
    // -------------------------------------------------------------
    socket.on('seek', ({ time }) => {
      const session = roomManager.getRoomBySocket(socket.id);
      if (!session) return;
      const { room, participant } = session;

      if (!canControlPlayback(participant.role)) {
        return socket.emit('error_message', {
          message: 'Permission denied: Only Host or Moderator can seek.'
        });
      }

      const seekTime = Math.max(0, Number(time) || 0);
      room.updatePlayback(room.playState, seekTime);

      io.to(room.roomId).emit('seek', {
        time: seekTime,
        lastUpdated: room.lastUpdated,
        userId: participant.id,
        username: participant.username
      });
    });

    // -------------------------------------------------------------
    // CHANGE VIDEO
    // -------------------------------------------------------------
    socket.on('change_video', ({ videoId }) => {
      const session = roomManager.getRoomBySocket(socket.id);
      if (!session) return;
      const { room, participant } = session;

      if (!canControlPlayback(participant.role)) {
        return socket.emit('error_message', {
          message: 'Permission denied: Only Host or Moderator can change video.'
        });
      }

      if (!videoId || typeof videoId !== 'string') {
        return socket.emit('error_message', { message: 'Invalid video ID.' });
      }

      const cleanVideoId = videoId.trim();
      room.changeVideo(cleanVideoId);

      io.to(room.roomId).emit('change_video', {
        videoId: cleanVideoId,
        userId: participant.id,
        username: participant.username,
        syncState: room.getSyncState()
      });
    });

    // -------------------------------------------------------------
    // REQUEST SYNC (Client requests authoritative state)
    // -------------------------------------------------------------
    socket.on('request_sync', () => {
      const session = roomManager.getRoomBySocket(socket.id);
      if (!session) return;
      socket.emit('sync_state', session.room.getSyncState());
    });

    // -------------------------------------------------------------
    // ASSIGN ROLE (Host Only)
    // -------------------------------------------------------------
    socket.on('assign_role', ({ targetUserId, userId, role }) => {
      const effectiveTargetId = targetUserId || userId;
      const session = roomManager.getRoomBySocket(socket.id);
      if (!session) return;
      const { room, participant } = session;

      if (!canAssignRoles(participant.role)) {
        return socket.emit('error_message', {
          message: 'Permission denied: Only the Host can assign roles.'
        });
      }

      if (!['Moderator', 'Participant'].includes(role)) {
        return socket.emit('error_message', {
          message: 'Invalid role. Permitted roles to assign: Moderator, Participant.'
        });
      }

      const success = room.setRole(effectiveTargetId, role);
      if (!success) {
        return socket.emit('error_message', {
          message: 'Could not update role for the requested user.'
        });
      }

      const target = room.getParticipant(effectiveTargetId);

      io.to(room.roomId).emit('role_assigned', {
        userId: effectiveTargetId,
        username: target ? target.username : '',
        role: role,
        participants: room.getParticipantsList()
      });
    });

    // -------------------------------------------------------------
    // REMOVE PARTICIPANT (Host Only)
    // -------------------------------------------------------------
    socket.on('remove_participant', ({ targetUserId, userId }) => {
      const effectiveTargetId = targetUserId || userId;
      const session = roomManager.getRoomBySocket(socket.id);
      if (!session) return;
      const { room, participant } = session;

      if (!canRemoveParticipant(participant.role)) {
        return socket.emit('error_message', {
          message: 'Permission denied: Only the Host can remove participants.'
        });
      }

      if (effectiveTargetId === room.hostId) {
        return socket.emit('error_message', {
          message: 'The Host cannot be removed from the room.'
        });
      }

      const target = room.getParticipant(effectiveTargetId);
      if (!target) return;

      room.removeParticipant(effectiveTargetId);

      // Notify the removed participant directly
      io.to(target.socketId).emit('participant_removed', {
        userId: target.id,
        participants: room.getParticipantsList(),
        message: 'You have been removed from the room by the Host.'
      });

      // Have their socket leave the Socket.IO room channel
      const targetSocket = io.sockets.sockets.get(target.socketId);
      if (targetSocket) {
        targetSocket.leave(room.roomId);
      }

      // Notify the remaining room participants (supports both participant_removed & user_left)
      io.to(room.roomId).emit('participant_removed', {
        userId: target.id,
        participants: room.getParticipantsList()
      });

      io.to(room.roomId).emit('user_left', {
        userId: target.id,
        username: target.username,
        participants: room.getParticipantsList()
      });
    });

    // -------------------------------------------------------------
    // TRANSFER HOST (Host Only)
    // -------------------------------------------------------------
    socket.on('transfer_host', ({ targetUserId, userId }) => {
      const effectiveTargetId = targetUserId || userId;
      const session = roomManager.getRoomBySocket(socket.id);
      if (!session) return;
      const { room, participant } = session;

      if (!canTransferHost(participant.role)) {
        return socket.emit('error_message', {
          message: 'Permission denied: Only the Host can transfer ownership.'
        });
      }

      const success = room.transferHost(effectiveTargetId);
      if (!success) {
        return socket.emit('error_message', {
          message: 'Target participant not found to transfer host role.'
        });
      }

      const newHost = room.getParticipant(effectiveTargetId);

      io.to(room.roomId).emit('host_transferred', {
        newHostId: effectiveTargetId,
        newHostUsername: newHost ? newHost.username : '',
        participants: room.getParticipantsList()
      });
    });

    // -------------------------------------------------------------
    // PARTICIPANT CHANGE REQUEST
    // -------------------------------------------------------------
    socket.on('request_change', ({ type, details }) => {
      const session = roomManager.getRoomBySocket(socket.id);
      if (!session) return;
      const { room, participant } = session;

      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const changeRequest = {
        id: requestId,
        requesterId: participant.id,
        requesterName: participant.username,
        type, // 'change_video' | 'play' | 'pause' | 'seek'
        details, // e.g. { videoId, time, title }
        createdAt: new Date().toISOString()
      };

      room.changeRequests.push(changeRequest);

      // Broadcast to Host & Moderators in the room
      for (const p of room.participants.values()) {
        if (p.role === 'Host' || p.role === 'Moderator') {
          io.to(p.socketId).emit('change_requested', changeRequest);
        }
      }

      // Acknowledge to requester
      socket.emit('change_request_submitted', {
        message: 'Your request was sent to the Host and Moderators for approval.'
      });
    });

    // -------------------------------------------------------------
    // APPROVE CHANGE REQUEST (Host or Moderator)
    // -------------------------------------------------------------
    socket.on('approve_change', ({ requestId, approved }) => {
      const session = roomManager.getRoomBySocket(socket.id);
      if (!session) return;
      const { room, participant } = session;

      if (!canControlPlayback(participant.role)) {
        return socket.emit('error_message', {
          message: 'Permission denied: Only Host or Moderator can approve change requests.'
        });
      }

      const reqIndex = room.changeRequests.findIndex(r => r.id === requestId);
      if (reqIndex === -1) return;
      const request = room.changeRequests.splice(reqIndex, 1)[0];

      if (approved) {
        // Execute the approved action
        if (request.type === 'change_video' && request.details?.videoId) {
          room.changeVideo(request.details.videoId);
          io.to(room.roomId).emit('change_video', {
            videoId: request.details.videoId,
            userId: request.requesterId,
            username: request.requesterName,
            syncState: room.getSyncState()
          });
        } else if (request.type === 'play') {
          room.updatePlayback('playing', room.getEffectiveTime());
          io.to(room.roomId).emit('play', {
            currentTime: room.getEffectiveTime(),
            userId: request.requesterId,
            username: request.requesterName
          });
        } else if (request.type === 'pause') {
          room.updatePlayback('paused', room.getEffectiveTime());
          io.to(room.roomId).emit('pause', {
            currentTime: room.getEffectiveTime(),
            userId: request.requesterId,
            username: request.requesterName
          });
        }

        io.to(room.roomId).emit('change_request_resolved', {
          requestId,
          approved: true,
          approver: participant.username,
          requesterName: request.requesterName
        });
      } else {
        io.to(room.roomId).emit('change_request_resolved', {
          requestId,
          approved: false,
          approver: participant.username,
          requesterName: request.requesterName
        });
      }
    });

    // -------------------------------------------------------------
    // CHAT MESSAGE
    // -------------------------------------------------------------
    socket.on('send_chat', ({ message }) => {
      const session = roomManager.getRoomBySocket(socket.id);
      if (!session) return;
      const { room, participant } = session;

      const cleanMsg = (message || '').trim().substring(0, 300);
      if (!cleanMsg) return;

      const chatPayload = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: participant.id,
        username: participant.username,
        role: participant.role,
        message: cleanMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      io.to(room.roomId).emit('chat_message', chatPayload);
    });

    // -------------------------------------------------------------
    // RECONNECT ROOM (Session recovery after network flicker)
    // -------------------------------------------------------------
    socket.on('reconnect_room', ({ roomId, userId }) => {
      try {
        const result = roomManager.rebindSocket(roomId, userId, socket.id);
        if (result) {
          const { room, participant } = result;
          socket.join(room.roomId);

          socket.emit('room_reconnected', {
            roomId: room.roomId,
            user: participant.toJSON(),
            syncState: room.getSyncState(),
            participants: room.getParticipantsList()
          });
        }
      } catch (err) {
        console.warn('reconnect_room error:', err.message);
      }
    });

    // -------------------------------------------------------------
    // END ROOM (Host only - explicitly terminate party for everyone)
    // -------------------------------------------------------------
    socket.on('end_room', () => {
      const session = roomManager.getRoomBySocket(socket.id);
      if (!session) return;
      const { room, participant } = session;

      if (participant.role !== 'Host') {
        return socket.emit('error_message', {
          message: 'Permission denied: Only the Host can end the watch party.'
        });
      }

      const roomId = room.roomId;
      // Delete room from manager
      roomManager.rooms.delete(roomId);

      // Clean up socket mappings for this room
      for (const p of room.participants.values()) {
        if (p.socketId) {
          roomManager.socketToRoom.delete(p.socketId);
          roomManager.socketToUser.delete(p.socketId);
          if (roomManager.disconnectTimers.has(p.id)) {
            clearTimeout(roomManager.disconnectTimers.get(p.id));
            roomManager.disconnectTimers.delete(p.id);
          }
        }
      }

      // Broadcast room_ended to everyone in the room
      io.to(roomId).emit('room_ended', {
        message: 'The Host ended the watch party.',
        roomId
      });

      // Eject all sockets from socket.io room channel
      io.in(roomId).socketsLeave(roomId);
    });

    // -------------------------------------------------------------
    // LEAVE ROOM
    // -------------------------------------------------------------
    socket.on('leave_room', () => {
      const result = roomManager.handleDisconnect(socket.id);
      if (result) {
        socket.leave(result.roomId);
        if (result.hostDeparted) {
          // Host departed without transferring host -> party ends for everyone
          io.to(result.roomId).emit('room_ended', {
            message: 'The Host has left the watch party. The party has ended.',
            roomId: result.roomId
          });
          io.in(result.roomId).socketsLeave(result.roomId);
        } else if (!result.roomDeleted) {
          io.to(result.roomId).emit('user_left', {
            userId: result.participant.id,
            username: result.participant.username,
            newHost: result.newHost ? result.newHost.toJSON() : null,
            participants: result.remainingParticipants
          });
        }
      }
    });

    // -------------------------------------------------------------
    // DISCONNECT (With 15s grace period so temporary flickers don't drop sessions)
    // -------------------------------------------------------------
    socket.on('disconnect', () => {
      roomManager.scheduleDisconnect(socket.id, (result) => {
        if (result) {
          if (result.hostDeparted) {
            io.to(result.roomId).emit('room_ended', {
              message: 'The Host disconnected. The watch party has ended.',
              roomId: result.roomId
            });
            io.in(result.roomId).socketsLeave(result.roomId);
          } else if (!result.roomDeleted) {
            io.to(result.roomId).emit('user_left', {
              userId: result.participant.id,
              username: result.participant.username,
              newHost: result.newHost ? result.newHost.toJSON() : null,
              participants: result.remainingParticipants
            });
          }
        }
      });
    });
  });
}

module.exports = registerSocketHandlers;

