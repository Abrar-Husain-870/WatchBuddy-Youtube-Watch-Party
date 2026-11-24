const { io: Client } = require('socket.io-client');
const assert = require('assert');
const { server } = require('../index');

const PORT = 5001;

server.listen(PORT, async () => {
  console.log(`🧪 Running Socket.IO Multi-Client Integration Test on port ${PORT}...`);

  const serverUrl = `http://localhost:${PORT}`;

  const hostSocket = Client(serverUrl);
  let guestSocket;
  let testRoomId = '';

  try {
    // 1. Host connects and creates room
    await new Promise((resolve) => {
      hostSocket.on('connect', () => {
        hostSocket.emit('create_room', { username: 'Alice (Host)', customRoomId: 'INTEG1' });
      });

      hostSocket.on('room_created', (data) => {
        assert.strictEqual(data.roomId, 'INTEG1');
        assert.strictEqual(data.user.role, 'Host');
        testRoomId = data.roomId;
        console.log('✅ 1. Host created room successfully:', testRoomId);
        resolve();
      });
    });

    // 2. Guest connects and joins room
    guestSocket = Client(serverUrl);
    await new Promise((resolve) => {
      guestSocket.on('connect', () => {
        guestSocket.emit('join_room', { roomId: testRoomId, username: 'Bob (Guest)' });
      });

      guestSocket.on('room_joined', (data) => {
        assert.strictEqual(data.roomId, testRoomId);
        assert.strictEqual(data.user.role, 'Participant');
        assert.strictEqual(data.participants.length, 2);
        console.log('✅ 2. Guest joined room as Participant');
        resolve();
      });
    });

    // 3. Guest tries unauthorized play/pause -> Expect error_message
    await new Promise((resolve) => {
      guestSocket.emit('play', { currentTime: 10 });
      guestSocket.on('error_message', (err) => {
        assert.ok(err.message.includes('Permission denied'));
        console.log('✅ 3. Server correctly blocked unauthorized action from Participant');
        resolve();
      });
    });

    // 4. Host promotes Guest to Moderator
    await new Promise((resolve) => {
      const bobUser = guestSocket.id;
      // Get bob's userId
      hostSocket.emit('assign_role', { targetUserId: `user_${guestSocket.id.substring(0, 8)}`, role: 'Moderator' });

      guestSocket.on('role_assigned', (data) => {
        assert.strictEqual(data.role, 'Moderator');
        console.log('✅ 4. Host promoted Guest to Moderator');
        resolve();
      });
    });

    // 5. Moderator seeks video -> Host receives seek broadcast
    await new Promise((resolve) => {
      guestSocket.emit('seek', { time: 42 });

      hostSocket.on('seek', (data) => {
        assert.strictEqual(data.time, 42);
        console.log('✅ 5. Moderator seek broadcast received by Host');
        resolve();
      });
    });

    // 6. Host kicks Guest -> Guest receives participant_removed
    await new Promise((resolve) => {
      hostSocket.emit('remove_participant', { targetUserId: `user_${guestSocket.id.substring(0, 8)}` });

      guestSocket.on('participant_removed', (data) => {
        assert.ok(data.message.includes('removed'));
        console.log('✅ 6. Host kicked Guest, Guest received notification');
        resolve();
      });
    });

    console.log('\n🎉 ALL REAL-TIME SOCKET INTEGRATION TESTS PASSED!');
  } catch (err) {
    console.error('❌ Integration test failed:', err);
    process.exit(1);
  } finally {
    hostSocket.disconnect();
    if (guestSocket) guestSocket.disconnect();
    server.close();
    process.exit(0);
  }
});

