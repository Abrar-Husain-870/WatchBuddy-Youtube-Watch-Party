/**
 * Permissions Helper
 * Enforces role-based permissions on the server.
 * Roles: 'Host' | 'Moderator' | 'Participant'
 */

/**
 * Can the user control playback (play, pause, seek, change video)?
 * Allowed for Host and Moderator.
 * @param {string} role
 * @returns {boolean}
 */
function canControlPlayback(role) {
  return role === 'Host' || role === 'Moderator';
}

/**
 * Can the user assign roles (promote to Moderator / demote to Participant)?
 * Allowed for Host only.
 * @param {string} role
 * @returns {boolean}
 */
function canAssignRoles(role) {
  return role === 'Host';
}

/**
 * Can the user remove participants?
 * Allowed for Host only.
 * @param {string} role
 * @returns {boolean}
 */
function canRemoveParticipant(role) {
  return role === 'Host';
}

/**
 * Can the user transfer the Host role?
 * Allowed for Host only.
 * @param {string} role
 * @returns {boolean}
 */
function canTransferHost(role) {
  return role === 'Host';
}

module.exports = {
  canControlPlayback,
  canAssignRoles,
  canRemoveParticipant,
  canTransferHost
};

