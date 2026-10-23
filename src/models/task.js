module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.ENUM('open', 'in_progress', 'completed', 'archived'), defaultValue: 'open' },
      priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
      dueDate: { type: DataTypes.DATE, allowNull: true },
      creatorId: { type: DataTypes.UUID, allowNull: false },
      assigneeId: { type: DataTypes.UUID, allowNull: true },
      teamId: { type: DataTypes.UUID, allowNull: true }
    }, {
      tableName: 'tasks',
      timestamps: true
    });
    return Task;
  };
  