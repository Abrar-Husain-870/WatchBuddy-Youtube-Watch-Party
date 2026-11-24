/**
 * Participant Model
 * Represents an individual connected user in a watch room.
 */
class Participant {
  /**
   * @param {string} id - Unique identifier (socket ID or user ID)
   * @param {string} socketId - Current active socket ID
   * @param {string} username - Display name of the participant
   * @param {'Host'|'Moderator'|'Participant'} role - Permission tier
   */
  constructor(id, socketId, username, role = 'Participant') {
    this.id = id;
    this.socketId = socketId;
    this.username = username;
    this.role = role;
    this.joinedAt = new Date().toISOString();
  }

  /**
   * Update the role of this participant.
   * @param {'Host'|'Moderator'|'Participant'} newRole
   */
  updateRole(newRole) {
    this.role = newRole;
  }

  /**
   * Clean JSON representation of the participant for client broadcast.
   */
  toJSON() {
    return {
      id: this.id,
      socketId: this.socketId,
      username: this.username,
      role: this.role,
      joinedAt: this.joinedAt
    };
  }
}

module.exports = Participant;

