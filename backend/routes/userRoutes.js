const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Lobby = require('../models/Lobby');
const { v4: uuidv4 } = require('uuid');

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Check if EMAIL exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User with this email already exists' });

    const uid = uuidv4();

    user = new User({
      uid,
      name,
      email,
      password, 
      avatarId: Math.floor(Math.random() * 8)
    });

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find by Email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    if (user.password !== password) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Create or Update User
router.post('/', async (req, res) => {
  // 1. We need to accept ALL these fields from the frontend
  const { uid, name, bio, phone, email, avatarId, showContact } = req.body;
  
  try {
    let user = await User.findOne({ uid });
    
    if (user) {
      // 2. Update ALL fields
      user.name = name;
      user.bio = bio;
      user.phone = phone;
      user.email = email;
      user.avatarId = avatarId;
      user.showContact = showContact; // <--- CRITICAL: This was missing!
      
      await user.save();
    } else {
      // Create new
      user = new User({ uid, name, email, bio, phone, avatarId, showContact });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET User Profile (Public Safe Version)
router.get('/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Only send necessary data
    const publicProfile = {
      uid: user.uid,
      name: user.name,
      avatarId: user.avatarId,
      bio: user.bio,
      showContact: user.showContact, // Send the boolean
      // LOGIC: Only send contact info if user allows it
      phone: user.showContact ? user.phone : null,
      email: user.showContact ? user.email : null
    };

    res.json(publicProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete User
router.delete('/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const deletedUser = await User.findOneAndDelete({ uid });
    
    if (!deletedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await Lobby.deleteMany({ hostId: uid });

    await Lobby.updateMany(
      { "players.uid": uid },
      { $pull: { players: { uid: uid } } }
    );

    res.json({ msg: 'Account and associated data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;