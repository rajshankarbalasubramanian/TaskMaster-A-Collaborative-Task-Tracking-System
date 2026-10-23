require('dotenv').config();
const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');
const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Optional: Socket.io for real-time notifications
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('joinTeam', (teamId) => {
    socket.join(`team_${teamId}`);
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    // Sync models (for development). In production use migrations.
    await sequelize.sync({ alter: true });
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
})();
