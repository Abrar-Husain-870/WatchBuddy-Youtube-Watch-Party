const Room = require('../models/Room');
const Participant = require('../models/Participant');

/**
 * RoomManager
 * In-memory manager for active watch party rooms.
 * Uses Map data structures for O(1) lookup.
 */
class RoomManager {
  constructor() {
    /** @type {Map<string, Room>} */
    this.rooms = new Map();
    /** @type {Map<string, string>} Maps socketId to roomId for rapid disconnect lookup */
    this.socketToRoom = new Map();
    /** @type {Map<string, string>} Maps socketId to userId */
    this.socketToUser = new Map();
    /** @type {Map<string, NodeJS.Timeout>} Maps userId to disconnect timeout */
    this.disconnectTimers = new Map();
  }

  /**
   * Generate a readable 6-character room code (e.g. "WATCH-8X2").
   * @returns {string}
   */
  generateRoomId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create a new room with the creator as Host.
   * @param {string} username - Host's username
   * @param {string} socketId - Host's socket ID
   * @param {string} [customRoomId] - Optional custom room ID
   * @param {string} [initialVideoId] - Optional initial video ID
   * @returns {{ room: Room, host: Participant }}
   */
  createRoom(username, socketId, customRoomId = null, initialVideoId = null) {
    let roomId = customRoomId ? customRoomId.toUpperCase().trim() : this.generateRoomId();
    while (this.rooms.has(roomId)) {
      roomId = this.generateRoomId();
    }

    const userId = `user_${socketId.substring(0, 8)}`;
    const host = new Participant(userId, socketId, username, 'Host');
    const room = new Room(roomId, host, initialVideoId || 'dQw4w9WgXcQ');

    this.rooms.set(roomId, room);
    this.socketToRoom.set(socketId, roomId);
    this.socketToUser.set(socketId, userId);

    return { room, host };
  }

  /**
   * Join an existing room as a Participant.
   * If the room does not exist, returns null.
   * @param {string} roomId
   * @param {string} username
   * @param {string} socketId
   * @returns {{ room: Room, participant: Participant } | null}
   */
  joinRoom(roomId, username, socketId) {
    const normalizedId = roomId.toUpperCase().trim();
    const room = this.rooms.get(normalizedId);
    if (!room) return null;

    const userId = `user_${socketId.substring(0, 8)}`;
    const participant = new Participant(userId, socketId, username, 'Participant');
    room.addParticipant(participant);

    this.socketToRoom.set(socketId, normalizedId);
    this.socketToUser.set(socketId, userId);

    return { room, participant };
  }

  /**
   * Retrieve a room by ID.
   * @param {string} roomId
   * @returns {Room|null}
   */
  getRoom(roomId) {
    return this.rooms.get(roomId?.toUpperCase()?.trim()) || null;
  }

  /**
   * Retrieve room and participant for a given socket.
   * @param {string} socketId
   * @returns {{ room: Room, participant: Participant } | null}
   */
  getRoomBySocket(socketId) {
    const roomId = this.socketToRoom.get(socketId);
    const userId = this.socketToUser.get(socketId);
    if (!roomId || !userId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    const participant = room.getParticipant(userId);
    if (!participant) return null;

    return { room, participant };
  }

  /**
   * Handles user disconnect.
   * Automatically reassigns host if the host leaves and others remain.
   * Cleans up room if everyone has left.
   * @param {string} socketId
   * @returns {{ roomId: string, participant: Participant, newHost: Participant|null, roomDeleted: boolean } | null}
   */
  handleDisconnect(socketId) {
    const roomId = this.socketToRoom.get(socketId);
    const userId = this.socketToUser.get(socketId);

    this.socketToRoom.delete(socketId);
    this.socketToUser.delete(socketId);

    if (!roomId || !userId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (this.disconnectTimers.has(userId)) {
      clearTimeout(this.disconnectTimers.get(userId));
      this.disconnectTimers.delete(userId);
    }

    const removedParticipant = room.removeParticipant(userId);
    let newHost = null;
    let roomDeleted = false;

    if (room.participants.size === 0) {
      // Room is empty, clean it up
      this.rooms.delete(roomId);
      roomDeleted = true;
    } else if (room.hostId === userId) {
      // Host left, promote the next member (first prioritize Moderator, else first Participant)
      const remaining = Array.from(room.participants.values());
      const nextHost = remaining.find(p => p.role === 'Moderator') || remaining[0];
      if (nextHost) {
        room.transferHost(nextHost.id);
        newHost = nextHost;
      }
    }

    return {
      roomId,
      participant: removedParticipant,
      newHost,
      roomDeleted,
      remainingParticipants: room.getParticipantsList()
    };
  }

  /**
   * Schedule a graceful disconnect with a 15-second grace period for reconnections.
   * Prevents accidental host transfer or room destruction on momentary network drop.
   * @param {string} socketId
   * @param {Function} onTimeout
   */
  scheduleDisconnect(socketId, onTimeout) {
    const roomId = this.socketToRoom.get(socketId);
    const userId = this.socketToUser.get(socketId);
    if (!roomId || !userId) return;

    this.socketToRoom.delete(socketId);
    this.socketToUser.delete(socketId);

    if (this.disconnectTimers.has(userId)) {
      clearTimeout(this.disconnectTimers.get(userId));
    }

    const timer = setTimeout(() => {
      this.disconnectTimers.delete(userId);
      const room = this.rooms.get(roomId);
      if (!room) return;

      const removedParticipant = room.removeParticipant(userId);
      let newHost = null;
      let roomDeleted = false;

      if (room.participants.size === 0) {
        this.rooms.delete(roomId);
        roomDeleted = true;
      } else if (room.hostId === userId) {
        const remaining = Array.from(room.participants.values());
        const nextHost = remaining.find(p => p.role === 'Moderator') || remaining[0];
        if (nextHost) {
          room.transferHost(nextHost.id);
          newHost = nextHost;
        }
      }

      if (onTimeout) {
        onTimeout({
          roomId,
          participant: removedParticipant,
          newHost,
          roomDeleted,
          remainingParticipants: room ? room.getParticipantsList() : []
        });
      }
    }, 15000);

    this.disconnectTimers.set(userId, timer);
  }

  /**
   * Rebind a reconnected socket to their existing room session.
   * Cancels any pending disconnect timer.
   * @param {string} roomId
   * @param {string} userId
   * @param {string} newSocketId
   * @returns {{ room: Room, participant: Participant } | null}
   */
  rebindSocket(roomId, userId, newSocketId) {
    if (!roomId || !userId || !newSocketId) return null;
    const normalizedId = roomId.toUpperCase().trim();
    const room = this.rooms.get(normalizedId);
    if (!room) return null;

    if (this.disconnectTimers.has(userId)) {
      clearTimeout(this.disconnectTimers.get(userId));
      this.disconnectTimers.delete(userId);
    }

    const participant = room.getParticipant(userId);
    if (!participant) return null;

    // Remove old socket mapping if any
    const oldSocket = participant.socketId;
    if (oldSocket) {
      this.socketToRoom.delete(oldSocket);
      this.socketToUser.delete(oldSocket);
    }

    participant.socketId = newSocketId;
    this.socketToRoom.set(newSocketId, normalizedId);
    this.socketToUser.set(newSocketId, userId);

    return { room, participant };
  }

  /**
   * Total number of active rooms.
   */
  getActiveRoomsCount() {
    return this.rooms.size;
  }
}

// Export singleton instance
module.exports = new RoomManager();

