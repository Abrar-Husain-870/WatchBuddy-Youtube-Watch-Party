const Participant = require('./Participant');

/**
 * Room Model
 * Represents a virtual watch room, encapsulating participants, current video,
 * playback state, and synchronization logic.
 */
class Room {
  /**
   * @param {string} roomId - Unique room code/ID
   * @param {Participant} creator - The user who created the room (automatically assigned Host)
   * @param {string} initialVideoId - Default YouTube video ID
   */
  constructor(roomId, creator, initialVideoId = 'dQw4w9WgXcQ') {
    this.roomId = roomId;
    this.hostId = creator.id;
    this.videoId = initialVideoId;
    this.playState = 'paused'; // 'playing' | 'paused' | 'buffering'
    this.currentTime = 0; // authoritative playback position in seconds
    this.lastUpdated = Date.now(); // timestamp of last play/pause/seek
    this.createdAt = new Date().toISOString();

    /** @type {Map<string, Participant>} */
    this.participants = new Map();
    this.addParticipant(creator);

    /** @type {Array<object>} */
    this.changeRequests = [];
  }

  /**
   * Add a participant to the room.
   * @param {Participant} participant
   */
  addParticipant(participant) {
    this.participants.set(participant.id, participant);
  }

  /**
   * Remove a participant by ID.
   * @param {string} userId
   * @returns {Participant|null} The removed participant
   */
  removeParticipant(userId) {
    const participant = this.participants.get(userId);
    if (participant) {
      this.participants.delete(userId);
    }
    return participant || null;
  }

  /**
   * Get a participant by ID.
   * @param {string} userId
   * @returns {Participant|undefined}
   */
  getParticipant(userId) {
    return this.participants.get(userId);
  }

  /**
   * Update a participant's role.
   * @param {string} userId
   * @param {'Host'|'Moderator'|'Participant'} newRole
   * @returns {boolean} Success status
   */
  setRole(userId, newRole) {
    const participant = this.participants.get(userId);
    if (!participant) return false;

    // Prevent changing the role of the primary Host through standard promotion/demotion
    if (userId === this.hostId && newRole !== 'Host') {
      return false;
    }

    participant.updateRole(newRole);
    return true;
  }

  /**
   * Transfer host authority to another participant.
   * @param {string} newHostId
   * @returns {boolean} Success status
   */
  transferHost(newHostId) {
    const currentHost = this.participants.get(this.hostId);
    const newHost = this.participants.get(newHostId);

    if (!newHost) return false;

    if (currentHost) {
      currentHost.updateRole('Moderator'); // Demote former host to Moderator
    }
    newHost.updateRole('Host');
    this.hostId = newHostId;
    return true;
  }

  /**
   * Update playback state and timestamp.
   * @param {'playing'|'paused'|'buffering'} playState
   * @param {number} currentTime
   */
  updatePlayback(playState, currentTime) {
    this.playState = playState;
    this.currentTime = Math.max(0, currentTime);
    this.lastUpdated = Date.now();
  }

  /**
   * Change current YouTube video.
   * Resets playback position to 0 and pauses.
   * @param {string} videoId
   */
  changeVideo(videoId) {
    this.videoId = videoId;
    this.currentTime = 0;
    this.playState = 'paused';
    this.lastUpdated = Date.now();
  }

  /**
   * Computes the current effective playback time.
   * If playing, accounts for elapsed wall-clock time since last state change.
   * @returns {number}
   */
  getEffectiveTime() {
    if (this.playState === 'playing') {
      const elapsed = (Date.now() - this.lastUpdated) / 1000;
      return +(this.currentTime + elapsed).toFixed(2);
    }
    return +this.currentTime.toFixed(2);
  }

  /**
   * Returns authoritative synchronization state for clients.
   */
  getSyncState() {
    return {
      roomId: this.roomId,
      videoId: this.videoId,
      playState: this.playState,
      currentTime: this.getEffectiveTime(),
      lastUpdated: this.lastUpdated,
      hostId: this.hostId
    };
  }

  /**
   * Get array of serialized participants.
   * @returns {Array<object>}
   */
  getParticipantsList() {
    return Array.from(this.participants.values()).map(p => p.toJSON());
  }

  /**
   * Clean JSON representation of the room.
   */
  toJSON() {
    return {
      roomId: this.roomId,
      hostId: this.hostId,
      videoId: this.videoId,
      playState: this.playState,
      currentTime: this.getEffectiveTime(),
      participants: this.getParticipantsList(),
      createdAt: this.createdAt
    };
  }
}

module.exports = Room;

