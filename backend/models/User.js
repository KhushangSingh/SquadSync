const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Identity
  uid: { type: String, required: true, unique: true },
  
  // Name is just for display now (can be duplicate)
  name: { type: String, required: true }, 
  
  // Email is the UNIQUE identifier for login
  email: { type: String, required: true, unique: true }, 
  
  password: { type: String, required: true },

  // Profile Extras
  avatarId: { type: Number, default: 0 },
  bio: { type: String, default: "" },
  phone: { type: String, default: "" },
  showContact: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);