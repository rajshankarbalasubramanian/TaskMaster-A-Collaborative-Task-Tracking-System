const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/db').development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging
  }
);

// Import models
const User = require('./user')(sequelize, DataTypes);
const Team = require('./team')(sequelize, DataTypes);
const TeamMember = require('./teamMember')(sequelize, DataTypes);
const Task = require('./task')(sequelize, DataTypes);
const Comment = require('./comment')(sequelize, DataTypes);
const Attachment = require('./attachment')(sequelize, DataTypes);

// Associations
User.hasMany(Task, { foreignKey: 'creatorId', as: 'createdTasks' });
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

Team.hasMany(Task, { foreignKey: 'teamId', as: 'tasks' });
Task.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

Team.belongsToMany(User, { through: TeamMember, foreignKey: 'teamId', otherKey: 'userId', as: 'members' });
User.belongsToMany(Team, { through: TeamMember, foreignKey: 'userId', otherKey: 'teamId', as: 'teams' });

Task.hasMany(Comment, { foreignKey: 'taskId', as: 'comments' });
Comment.belongsTo(Task, { foreignKey: 'taskId' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Task.hasMany(Attachment, { foreignKey: 'taskId', as: 'attachments' });
Attachment.belongsTo(Task, { foreignKey: 'taskId' });
Attachment.belongsTo(User, { foreignKey: 'userId', as: 'uploader' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Team,
  TeamMember,
  Task,
  Comment,
  Attachment
};
