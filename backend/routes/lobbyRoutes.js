const express = require('express');
const router = express.Router();
const Lobby = require('../models/Lobby');

// GET All Lobbies
router.get('/', async (req, res) => {
  try {
    const lobbies = await Lobby.find().sort({ createdAt: -1 });
    res.json(lobbies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Lobby
router.post('/', async (req, res) => {
  try {
    const newLobby = new Lobby(req.body);
    await newLobby.save();
    const io = req.app.get('io');
    io.emit('lobbies_updated'); 
    res.status(201).json(newLobby);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST Request to Join
router.post('/:id/request', async (req, res) => {
  const { uid, name, phone, email, message } = req.body;
  try {
    const lobby = await Lobby.findById(req.params.id);
    if (!lobby) return res.status(404).json({ msg: 'Lobby not found' });

    if (lobby.players.some(p => p.uid === uid)) return res.status(400).json({ msg: 'Already joined' });
    if (lobby.requests && lobby.requests.some(r => r.uid === uid)) return res.status(400).json({ msg: 'Request already sent' });

    lobby.requests.push({ uid, name, phone, email, message });
    await lobby.save();

    const io = req.app.get('io');
    io.emit('lobbies_updated');

    res.json({ msg: 'Request sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Accept Request (FIXED: Using Mongoose $push and $pull)
router.post('/:id/accept', async (req, res) => {
  const { requestUid } = req.body;

  try {
    const lobby = await Lobby.findById(req.params.id);
    if (!lobby) return res.status(404).json({ msg: 'Lobby not found' });

    // Find the request details
    const requestData = lobby.requests.find(r => r.uid === requestUid);
    if (!requestData) return res.status(404).json({ msg: 'Request not found' });

    // Atomic update to ensure data consistency
    await Lobby.findByIdAndUpdate(req.params.id, {
        $push: { 
            players: { uid: requestData.uid, name: requestData.name } 
        },
        $pull: { 
            requests: { uid: requestUid } 
        }
    });

    const io = req.app.get('io');
    io.emit('lobbies_updated');

    res.json({ msg: 'User accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST Reject Request (FIXED: Using Mongoose $pull)
router.post('/:id/reject', async (req, res) => {
  const { requestUid } = req.body;

  try {
    await Lobby.findByIdAndUpdate(req.params.id, {
        $pull: { 
            requests: { uid: requestUid } 
        }
    });

    const io = req.app.get('io');
    io.emit('lobbies_updated');

    res.json({ msg: 'User rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Leave Lobby
router.put('/:id/leave', async (req, res) => {
  const { uid } = req.body;
  try {
    // Atomic pull is safer for concurrent leaves
    await Lobby.findByIdAndUpdate(req.params.id, {
        $pull: { players: { uid: uid } }
    });
    
    // Check if empty to delete (requires fetching updated doc, simplified here)
    const updatedLobby = await Lobby.findById(req.params.id);
    if (updatedLobby && updatedLobby.players.length === 0) {
        await Lobby.findByIdAndDelete(req.params.id);
    }

    const io = req.app.get('io');
    io.emit('lobbies_updated');

    res.json({ msg: 'Left lobby' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Disband Lobby
router.delete('/:id', async (req, res) => {
  try {
    await Lobby.findByIdAndDelete(req.params.id);
    const io = req.app.get('io');
    io.emit('lobbies_updated');
    res.json({ msg: 'Lobby disbanded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Join (Direct - kept for compatibility)
router.put('/:id/join', async (req, res) => {
  const { uid, name } = req.body;
  try {
    await Lobby.findByIdAndUpdate(req.params.id, {
        $push: { players: { uid, name } }
    });
    const io = req.app.get('io');
    io.emit('lobbies_updated');
    res.json({ msg: 'Joined' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// KICK MEMBER (Host Only)
router.put('/:id/kick', async (req, res) => {
  const { uid, targetUid } = req.body; // uid = host, targetUid = person to kick
  try {
    const lobby = await Lobby.findById(req.params.id);
    if (!lobby) return res.status(404).json({ msg: 'Lobby not found' });

    // Verify request is coming from the host
    if (lobby.hostId !== uid) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Remove the target user
    lobby.players = lobby.players.filter(p => p.uid !== targetUid);
    
    // Also remove any pending request from that user if it exists
    if (lobby.requests) {
      lobby.requests = lobby.requests.filter(r => r.uid !== targetUid);
    }

    await lobby.save();
    
    // Notify clients (handled by socket in frontend, or emit here if you have socket instance)
    req.app.get('io').emit('lobbies_updated'); 
    
    res.json(lobby);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// TRANSFER HOST (New Route)
router.put('/:id/transfer', async (req, res) => {
  const { uid, newHostUid } = req.body;
  try {
    const lobby = await Lobby.findById(req.params.id);
    
    // Verify current host
    if (lobby.hostId !== uid) return res.status(401).json({ msg: 'Not authorized' });

    // Find the new host in the player list
    const newHost = lobby.players.find(p => p.uid === newHostUid);
    if (!newHost) return res.status(404).json({ msg: 'New host not found in lobby' });

    // Transfer ownership
    lobby.hostId = newHost.uid;
    lobby.hostName = newHost.name;
    
    // Note: hostMeta (phone/email) will update next time the new host saves their profile
    // For now, we clear it or fetch user details (Optional simplification: just clear it)
    lobby.hostMeta = { phone: null, email: null }; 

    await lobby.save();
    req.app.get('io').emit('lobbies_updated');
    res.json(lobby);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;