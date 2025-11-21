const mongoose = require('mongoose');

const LobbySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true, enum: ['sports', 'hackathon', 'gaming', 'study'] },
  location: { type: String, required: true },
  
  eventDate: { type: Date, required: true }, 

  skill: { type: String, default: '' },
  maxPlayers: { type: Number, default: 4 },
  
  hostId: { type: String, required: true },
  hostName: { type: String, required: true },
  hostMeta: { phone: String, email: String },

  players: [{
    uid: String,
    name: String,
    joinedAt: { type: Date, default: Date.now }
  }],

  requests: [{
    uid: String,
    name: String,
    phone: String,
    email: String,
    message: String,
    requestedAt: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lobby', LobbySchema);