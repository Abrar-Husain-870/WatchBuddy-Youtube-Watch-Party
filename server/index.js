const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const registerSocketHandlers = require('./socket/socketHandler');
const roomManager = require('./managers/RoomManager');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Enable CORS for frontend applications (local Vite dev & production Netlify deployments)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Socket.IO with permissive CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Register real-time event handlers
registerSocketHandlers(io);

// Healthcheck endpoint for Render and uptime monitors
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    activeRooms: roomManager.getActiveRoomsCount(),
    timestamp: new Date().toISOString()
  });
});

// Simple root info endpoint
app.get('/', (req, res) => {
  res.send({
    name: 'YouTube Watch Party API & WebSocket Server',
    version: '1.0.0',
    status: 'running',
    healthCheck: '/health'
  });
});

// Start the server only if executed directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Watch Party Server running on port ${PORT}`);
    console.log(`📡 WebSocket ready with Socket.IO`);
    console.log(`🩺 Health check available at http://localhost:${PORT}/health`);
    console.log(`===============================================`);
  });
}

module.exports = { app, server, io };
