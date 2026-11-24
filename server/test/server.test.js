const assert = require('assert');
const roomManager = require('../managers/RoomManager');
const {
  canControlPlayback,
  canAssignRoles,
  canRemoveParticipant,
  canTransferHost
} = require('../socket/permissions');

console.log('🧪 Starting Watch Party Backend Tests...\n');

// Test 1: Permissions checks
console.log('Test 1: Permission evaluation for roles');
assert.strictEqual(canControlPlayback('Host'), true, 'Host must be able to control playback');
assert.strictEqual(canControlPlayback('Moderator'), true, 'Moderator must be able to control playback');
assert.strictEqual(canControlPlayback('Participant'), false, 'Participant must not control playback');

assert.strictEqual(canAssignRoles('Host'), true, 'Host must be able to assign roles');
assert.strictEqual(canAssignRoles('Moderator'), false, 'Moderator must not assign roles');
assert.strictEqual(canAssignRoles('Participant'), false, 'Participant must not assign roles');

assert.strictEqual(canRemoveParticipant('Host'), true, 'Host must be able to remove participant');
assert.strictEqual(canRemoveParticipant('Moderator'), false, 'Moderator must not remove participant');

assert.strictEqual(canTransferHost('Host'), true, 'Host must be able to transfer host');
assert.strictEqual(canTransferHost('Moderator'), false, 'Moderator must not transfer host');
console.log('✅ Test 1 Passed: Role permissions enforce strict security.\n');

// Test 2: Room Creation
console.log('Test 2: Room creation and host auto-assignment');
const { room, host } = roomManager.createRoom('Alice', 'socket_123', 'TEST01');
assert.strictEqual(room.roomId, 'TEST01');
assert.strictEqual(room.hostId, host.id);
assert.strictEqual(host.role, 'Host');
assert.strictEqual(host.username, 'Alice');
assert.strictEqual(room.participants.size, 1);
console.log('✅ Test 2 Passed: Room created with Alice as Host.\n');

// Test 3: Participant Joining
console.log('Test 3: Participant joining');
const joinResult = roomManager.joinRoom('TEST01', 'Bob', 'socket_456');
assert.ok(joinResult, 'Bob should successfully join existing room');
const bob = joinResult.participant;
assert.strictEqual(bob.role, 'Participant', 'Bob should default to Participant role');
assert.strictEqual(room.participants.size, 2);
console.log('✅ Test 3 Passed: Bob joined with Participant role.\n');

// Test 4: Role Promotion
console.log('Test 4: Host promotes Participant to Moderator');
const promoted = room.setRole(bob.id, 'Moderator');
assert.strictEqual(promoted, true);
assert.strictEqual(bob.role, 'Moderator');
assert.strictEqual(canControlPlayback(bob.role), true, 'Bob as Moderator can now control playback');
console.log('✅ Test 4 Passed: Bob promoted to Moderator.\n');

// Test 5: Playback state and video changes
console.log('Test 5: Playback state mutation');
room.changeVideo('dQw4w9WgXcQ');
assert.strictEqual(room.videoId, 'dQw4w9WgXcQ');
assert.strictEqual(room.playState, 'paused');
assert.strictEqual(room.currentTime, 0);

room.updatePlayback('playing', 45);
assert.strictEqual(room.playState, 'playing');
assert.strictEqual(room.currentTime, 45);
assert.ok(room.getEffectiveTime() >= 45, 'Effective time should be >= 45 seconds');
console.log('✅ Test 5 Passed: Playback & video state correctly tracked.\n');

// Test 6: Host Transfer
console.log('Test 6: Host Transfer');
const transferred = room.transferHost(bob.id);
assert.strictEqual(transferred, true);
assert.strictEqual(room.hostId, bob.id);
assert.strictEqual(bob.role, 'Host');
assert.strictEqual(host.role, 'Moderator', 'Former host Alice should be demoted to Moderator');
console.log('✅ Test 6 Passed: Host successfully transferred to Bob.\n');

// Test 7: Disconnect and cleanup
console.log('Test 7: Disconnect and room cleanup');
roomManager.handleDisconnect('socket_123'); // Alice leaves
assert.strictEqual(room.participants.size, 1);

const disconnectBob = roomManager.handleDisconnect('socket_456'); // Bob leaves
assert.strictEqual(disconnectBob.roomDeleted, true, 'Room should be deleted when empty');
assert.strictEqual(roomManager.getRoom('TEST01'), null, 'Room should no longer exist in memory');
console.log('✅ Test 7 Passed: Room cleaned up when all participants disconnect.\n');

// Test 8: Host leaves with participants remaining (no transfer) -> room terminates for all
console.log('Test 8: Host leaves without transfer -> Room terminates');
const room2 = roomManager.createRoom('HostCharlie', 'socket_c1', 'TEST02');
roomManager.joinRoom('TEST02', 'GuestDavid', 'socket_d1');
assert.strictEqual(roomManager.getRoom('TEST02').participants.size, 2);

const hostLeaveResult = roomManager.handleDisconnect('socket_c1'); // Host Charlie leaves
assert.strictEqual(hostLeaveResult.roomDeleted, true, 'Room must be deleted when Host leaves without transfer');
assert.strictEqual(hostLeaveResult.hostDeparted, true, 'hostDeparted must be true');
assert.strictEqual(roomManager.getRoom('TEST02'), null, 'Room must be null in RoomManager');
console.log('✅ Test 8 Passed: Room terminated when Host departs without transferring ownership.\n');

// Test 9: Host transfers host first, then leaves -> room continues with new Host
console.log('Test 9: Host transfers host first, then leaves -> Room continues');
const room3 = roomManager.createRoom('HostEve', 'socket_e1', 'TEST03');
const joinEve = roomManager.joinRoom('TEST03', 'GuestFrank', 'socket_f1');
assert.strictEqual(roomManager.getRoom('TEST03').participants.size, 2);

// Transfer host from Eve to Frank
const transferredToFrank = room3.room.transferHost(joinEve.participant.id);
assert.strictEqual(transferredToFrank, true);
assert.strictEqual(room3.room.hostId, joinEve.participant.id);

// Now former host Eve leaves
const eveLeaveResult = roomManager.handleDisconnect('socket_e1');
assert.strictEqual(eveLeaveResult.roomDeleted, false, 'Room must NOT be deleted because Eve transferred host');
assert.strictEqual(eveLeaveResult.hostDeparted, false, 'hostDeparted must be false');
assert.strictEqual(roomManager.getRoom('TEST03').participants.size, 1);
assert.strictEqual(roomManager.getRoom('TEST03').hostId, joinEve.participant.id, 'Frank remains Host');

// Clean up room 3
roomManager.handleDisconnect('socket_f1');
console.log('✅ Test 9 Passed: Room seamlessly continues when Host transfers role before leaving.\n');

console.log('🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!');

