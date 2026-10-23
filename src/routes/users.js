const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { User } = require('../models');

// Get my profile
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl });
  } catch (err) {
    next(err);
  }
});

// Update profile
router.put('/me', auth, async (req, res, next) => {
  try {
    const { name, avatarUrl } = req.body;
    const user = req.user;
    if (name) user.name = name;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    await user.save();
    res.json({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
