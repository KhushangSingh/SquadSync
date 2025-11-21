require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const lobbyRoutes = require('./routes/lobbyRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

// --- Middleware ---
// Previous Frontend URLs (for development): "http://localhost:5173", "http://localhost:5174"
app.use(cors({
    origin: ["https://squadsync-frontend.onrender.com"], // Allow Frontend URLs
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/squadsync')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Socket.io Setup ---
// Previous Frontend URLs (for development): "http://localhost:5173", "http://localhost:5174"
const io = new Server(server, {
  cors: {
    origin: ["https://squadsync-frontend.onrender.com"],
    methods: ["GET", "POST"]
  }
});

// Pass io instance to routes via request object or separate module
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// --- Routes ---
app.use('/api/lobbies', lobbyRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});