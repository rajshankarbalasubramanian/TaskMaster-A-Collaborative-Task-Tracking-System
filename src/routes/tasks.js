const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Task, User, Comment, Attachment, Team } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// Create task
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, assigneeId, teamId } = req.body;
    const task = await Task.create({
      title,
      description,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      creatorId: req.user.id,
      assigneeId: assigneeId || null,
      teamId: teamId || null
    });
    // Notify assignee via socket
    const io = req.app.get('io');
    if (io && task.assigneeId) {
      io.to(`team_${task.teamId}`).emit('taskAssigned', { taskId: task.id, assigneeId: task.assigneeId });
    }
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// Get tasks with filtering, sorting, search
router.get('/', auth, async (req, res, next) => {
  try {
    const { status, assigneeId, teamId, q, sortBy, order, page, limit } = req.query;
    const where = {};
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (teamId) where.teamId = teamId;
    if (q) where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { description: { [Op.iLike]: `%${q}%` } }
    ];
    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 20;
    const orderClause = [[sortBy || 'createdAt', order === 'asc' ? 'ASC' : 'DESC']];
    const tasks = await Task.findAndCountAll({
      where,
      order: orderClause,
      limit: pageSize,
      offset: (pageNum - 1) * pageSize,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] }
      ]
    });
    res.json({ total: tasks.count, page: pageNum, pageSize, tasks: tasks.rows });
  } catch (err) {
    next(err);
  }
});

// Get single task
router.get('/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Comment, as: 'comments', include: [{ model: User, as: 'author', attributes: ['id', 'name'] }] },
        { model: Attachment, as: 'attachments' }
      ]
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// Update task
router.put('/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const { title, description, dueDate, status, priority, assigneeId } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assigneeId !== undefined) task.assigneeId = assigneeId;
    await task.save();
    // Notify via socket
    const io = req.app.get('io');
    if (io) io.to(`team_${task.teamId}`).emit('taskUpdated', { taskId: task.id });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// Mark complete
router.post('/:id/complete', auth, async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.status = 'completed';
    await task.save();
    const io = req.app.get('io');
    if (io) io.to(`team_${task.teamId}`).emit('taskCompleted', { taskId: task.id });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const { content } = req.body;
    const comment = await Comment.create({ content, userId: req.user.id, taskId: task.id });
    const io = req.app.get('io');
    if (io) io.to(`team_${task.teamId}`).emit('commentAdded', { taskId: task.id, commentId: comment.id });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

// Upload attachment
router.post('/:id/attachments', auth, upload.single('file'), async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (!req.file) return res.status(400).json({ error: 'File required' });
    const url = `/uploads/${req.file.filename}`;
    const attachment = await Attachment.create({
      filename: req.file.originalname,
      url,
      mimeType: req.file.mimetype,
      size: req.file.size,
      userId: req.user.id,
      taskId: task.id
    });
    const io = req.app.get('io');
    if (io) io.to(`team_${task.teamId}`).emit('attachmentAdded', { taskId: task.id, attachmentId: attachment.id });
    res.status(201).json(attachment);
  } catch (err) {
    next(err);
  }
});

// Delete task
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.destroy();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
