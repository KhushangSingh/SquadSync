const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// REGISTER
router.post('/register', async (req, res) => {
  // Now accepting email in body
  const { name, email, password } = req.body;
  
  try {
    // Check if EMAIL exists (Names can be duplicate now)
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User with this email already exists' });

    const uid = uuidv4();

    user = new User({
      uid,
      name,
      email,    // Save the email
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
  const { email, password } = req.body; // Expect email, not name

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

module.exports = router;