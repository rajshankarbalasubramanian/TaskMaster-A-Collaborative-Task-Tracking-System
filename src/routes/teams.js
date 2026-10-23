const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Team, TeamMember, User } = require('../models');

// Create team
router.post('/', auth, async (req, res, next) => {
  try {
    const { name, description, visibility } = req.body;
    const team = await Team.create({ name, description, visibility });
    // Add creator as admin
    await TeamMember.create({ TeamId: team.id, userId: req.user.id, teamId: team.id, role: 'admin' });
    res.status(201).json(team);
  } catch (err) {
    next(err);
  }
});

// Join team (simple flow: user can join public team)
router.post('/:teamId/join', auth, async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    const existing = await TeamMember.findOne({ where: { teamId: team.id, userId: req.user.id } });
    if (existing) return res.status(400).json({ error: 'Already a member' });
    if (team.visibility === 'private') return res.status(403).json({ error: 'Cannot join private team without invite' });
    const member = await TeamMember.create({ teamId: team.id, userId: req.user.id, role: 'member' });
    res.json(member);
  } catch (err) {
    next(err);
  }
});

// List teams for user
router.get('/', auth, async (req, res, next) => {
  try {
    const teams = await req.user.getTeams();
    res.json(teams);
  } catch (err) {
    next(err);
  }
});

// Invite user to team (simple: add by email)
router.post('/:teamId/invite', auth, async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const team = await Team.findByPk(req.params.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    // Only admins can invite
    const membership = await TeamMember.findOne({ where: { teamId: team.id, userId: req.user.id } });
    if (!membership || membership.role !== 'admin') return res.status(403).json({ error: 'Only admins can invite' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const existing = await TeamMember.findOne({ where: { teamId: team.id, userId: user.id } });
    if (existing) return res.status(400).json({ error: 'User already a member' });
    const member = await TeamMember.create({ teamId: team.id, userId: user.id, role: role || 'member' });
    res.json(member);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
